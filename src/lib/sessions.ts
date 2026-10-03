import type { User } from "firebase/auth"
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { displayNameOf } from "./auth"
import { generateCode } from "./code"
import { db } from "./firebase"
import { buildResults, computeWinners, sumPieces } from "./stats"
import type { Player, Session } from "./types"

export const MAX_PLAYERS = 10
export const MAX_PIECES = 999

export class SessionError extends Error {
  constructor(
    public reason: "not-found" | "finished" | "full" | "unknown",
    message: string,
  ) {
    super(message)
  }
}

const sessionRef = (code: string) => doc(db(), "sessions", code)
const playerRef = (code: string, uid: string) => doc(db(), "sessions", code, "players", uid)
const playersCol = (code: string) => collection(db(), "sessions", code, "players")

function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null
}

function toSession(snapshot: DocumentSnapshot | QueryDocumentSnapshot): Session {
  const data = snapshot.data({ serverTimestamps: "estimate" }) ?? {}
  return {
    code: snapshot.id,
    name: data.name ?? "Mesa",
    restaurant: data.restaurant ?? null,
    location: data.location ?? null,
    hostId: data.hostId,
    hostName: data.hostName ?? "",
    status: data.status === "finished" ? "finished" : "live",
    createdAt: toDate(data.createdAt),
    finishedAt: toDate(data.finishedAt),
    participantIds: data.participantIds ?? [],
    maxPlayers: data.maxPlayers ?? MAX_PLAYERS,
    results: data.results ?? null,
    totalPieces: data.totalPieces ?? 0,
    winnerIds: data.winnerIds ?? [],
  }
}

function toPlayer(snapshot: QueryDocumentSnapshot): Player {
  const data = snapshot.data({ serverTimestamps: "estimate" })
  return {
    uid: snapshot.id,
    name: data.name ?? "Comensal",
    photoURL: data.photoURL ?? null,
    count: data.count ?? 0,
    joinedAt: toDate(data.joinedAt),
    updatedAt: toDate(data.updatedAt),
    rating: data.rating,
    comment: data.comment ?? null,
  }
}

function newPlayer(user: User) {
  return {
    name: displayNameOf(user).slice(0, 40),
    photoURL: user.photoURL ?? null,
    count: 0,
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

function clean(value: string | undefined | null, max: number) {
  const trimmed = value?.trim().slice(0, max)
  return trimmed ? trimmed : null
}

export async function createSession(
  user: User,
  details: { name: string; restaurant?: string; location?: string },
): Promise<string> {
  // Si el código ya existe, las reglas rechazan el set (sería una actualización): probamos otro.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode()
    const batch = writeBatch(db())
    batch.set(sessionRef(code), {
      code,
      name: clean(details.name, 60) ?? "Mesa de sushi",
      restaurant: clean(details.restaurant, 80),
      location: clean(details.location, 80),
      hostId: user.uid,
      hostName: displayNameOf(user).slice(0, 40),
      status: "live",
      createdAt: serverTimestamp(),
      finishedAt: null,
      participantIds: [user.uid],
      maxPlayers: MAX_PLAYERS,
      results: null,
      totalPieces: 0,
      winnerIds: [],
    })
    batch.set(playerRef(code, user.uid), newPlayer(user))
    try {
      await batch.commit()
      return code
    } catch (error) {
      if (!isPermissionDenied(error)) throw error
    }
  }
  throw new SessionError("unknown", "No se pudo crear la mesa. Inténtalo de nuevo.")
}

export async function joinSession(user: User, code: string) {
  const snapshot = await getDoc(sessionRef(code))
  if (!snapshot.exists()) throw new SessionError("not-found", "No existe ninguna mesa con ese código.")
  const session = toSession(snapshot)
  if (session.participantIds.includes(user.uid)) return session
  if (session.status === "finished") throw new SessionError("finished", "Esta mesa ya está cerrada.")
  if (session.participantIds.length >= session.maxPlayers) {
    throw new SessionError("full", `La mesa está llena (${session.maxPlayers} comensales).`)
  }
  const batch = writeBatch(db())
  batch.update(sessionRef(code), { participantIds: arrayUnion(user.uid) })
  batch.set(playerRef(code, user.uid), newPlayer(user))
  await batch.commit()
  return session
}

export async function leaveSession(uid: string, code: string) {
  const batch = writeBatch(db())
  batch.update(sessionRef(code), { participantIds: arrayRemove(uid) })
  batch.delete(playerRef(code, uid))
  await batch.commit()
}

/** No esperamos al servidor: la caché local pinta el cambio al instante y lo sincroniza después. */
export function changeCount(uid: string, code: string, delta: 1 | -1) {
  return updateDoc(playerRef(code, uid), {
    count: increment(delta),
    updatedAt: serverTimestamp(),
  })
}

export async function finishSession(code: string, players: Player[]) {
  const results = buildResults(players)
  await updateDoc(sessionRef(code), {
    status: "finished",
    finishedAt: serverTimestamp(),
    results,
    totalPieces: sumPieces(results),
    winnerIds: computeWinners(results),
  })
}

export async function updateSessionDetails(
  code: string,
  details: { name: string; restaurant?: string; location?: string },
) {
  await updateDoc(sessionRef(code), {
    name: clean(details.name, 60) ?? "Mesa de sushi",
    restaurant: clean(details.restaurant, 80),
    location: clean(details.location, 80),
  })
}

export async function rateSession(uid: string, code: string, rating: number, comment: string) {
  await updateDoc(playerRef(code, uid), {
    rating,
    comment: clean(comment, 280),
    updatedAt: serverTimestamp(),
  })
}

export function subscribeSession(
  code: string,
  onChange: (session: Session | null) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    sessionRef(code),
    (snapshot) => onChange(snapshot.exists() ? toSession(snapshot) : null),
    onError,
  )
}

export function subscribePlayers(code: string, onChange: (players: Player[]) => void, onError: (error: Error) => void) {
  return onSnapshot(playersCol(code), (snapshot) => onChange(snapshot.docs.map(toPlayer)), onError)
}

/** Todas mis mesas (en curso y cerradas). Sin orderBy para no depender de índices compuestos. */
export function subscribeMySessions(
  uid: string,
  onChange: (sessions: Session[]) => void,
  onError: (error: Error) => void,
) {
  const mine = query(collection(db(), "sessions"), where("participantIds", "array-contains", uid), limit(300))
  return onSnapshot(
    mine,
    (snapshot) => onChange(snapshot.docs.map(toSession).sort(byNewest)),
    onError,
  )
}

export async function fetchFinishedSessions(since: Date | null) {
  const sessions = collection(db(), "sessions")
  const finished = since
    ? query(sessions, where("finishedAt", ">=", Timestamp.fromDate(since)), limit(1000))
    : query(sessions, where("status", "==", "finished"), limit(1000))
  const snapshot = await getDocs(finished)
  return snapshot.docs.map(toSession).filter((session) => session.status === "finished")
}

const recency = (session: Session) => (session.finishedAt ?? session.createdAt)?.getTime() ?? Date.now()

export function byNewest(a: Session, b: Session) {
  return recency(b) - recency(a)
}

export function isPermissionDenied(error: unknown) {
  return (error as { code?: string })?.code === "permission-denied"
}

export function sessionUrl(code: string) {
  return `${window.location.origin}/s/${code}`
}
