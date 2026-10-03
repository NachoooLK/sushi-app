import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing"
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Firestore,
} from "firebase/firestore"
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest"

const PROJECT_ID = "demo-sushi-rush"
const CODE = "ABC234"
const HOST = "host"
const GUEST = "guest"
const OTHER = "other"

let env: RulesTestEnvironment

function db(uid?: string): Firestore {
  const ctx = uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()
  // The compat type returned by rules-unit-testing is structurally a modular Firestore.
  return ctx.firestore() as unknown as Firestore
}

function newSession(uid: string, code = CODE): Record<string, unknown> {
  return {
    code,
    name: "Cena del viernes",
    restaurant: "Sushi Bar",
    location: null,
    hostId: uid,
    hostName: "Host",
    status: "live",
    createdAt: serverTimestamp(),
    finishedAt: null,
    participantIds: [uid],
    maxPlayers: 10,
    results: null,
    totalPieces: 0,
    winnerIds: [],
  }
}

function newPlayer(name = "Player"): Record<string, unknown> {
  return {
    name,
    photoURL: null,
    count: 0,
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

function createSessionBatch(f: Firestore, uid: string, code = CODE, overrides: Record<string, unknown> = {}) {
  const batch = writeBatch(f)
  batch.set(doc(f, "sessions", code), { ...newSession(uid, code), ...overrides })
  batch.set(doc(f, "sessions", code, "players", uid), newPlayer("Host"))
  return batch.commit()
}

function joinBatch(f: Firestore, uid: string, code = CODE) {
  const batch = writeBatch(f)
  batch.update(doc(f, "sessions", code), { participantIds: arrayUnion(uid) })
  batch.set(doc(f, "sessions", code, "players", uid), newPlayer("Guest"))
  return batch.commit()
}

/** Seeds a live session (host + guest) bypassing rules. */
async function seed(opts: { status?: "live" | "finished"; participantIds?: string[]; guestCount?: number } = {}) {
  const participantIds = opts.participantIds ?? [HOST, GUEST]
  await env.withSecurityRulesDisabled(async (ctx) => {
    const f = ctx.firestore() as unknown as Firestore
    const finished = opts.status === "finished"
    await setDoc(doc(f, "sessions", CODE), {
      code: CODE,
      name: "Cena",
      restaurant: null,
      location: null,
      hostId: HOST,
      hostName: "Host",
      status: opts.status ?? "live",
      createdAt: Timestamp.fromMillis(Date.now() - 3_600_000),
      finishedAt: finished ? Timestamp.now() : null,
      participantIds,
      maxPlayers: 10,
      results: finished ? [{ uid: HOST, name: "Host", photoURL: null, count: 3 }] : null,
      totalPieces: finished ? 3 : 0,
      winnerIds: finished ? [HOST] : [],
    })
    for (const uid of participantIds.slice(0, 2)) {
      await setDoc(doc(f, "sessions", CODE, "players", uid), {
        name: uid,
        photoURL: null,
        count: uid === GUEST ? (opts.guestCount ?? 0) : 0,
        joinedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    }
  })
}

beforeAll(async () => {
  const rulesPath = fileURLToPath(new URL("../../firestore.rules", import.meta.url))
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync(rulesPath, "utf8"), host: "127.0.0.1", port: 8080 },
  })
})

afterAll(async () => {
  await env?.cleanup()
})

beforeEach(async () => {
  await env.clearFirestore()
})

describe("session create", () => {
  it("host creates session + own player doc in one batch", async () => {
    await assertSucceeds(createSessionBatch(db(HOST), HOST))
  })

  it("fails unauthenticated", async () => {
    await assertFails(createSessionBatch(db(), HOST))
  })

  it("fails with wrong hostId", async () => {
    await assertFails(createSessionBatch(db(HOST), HOST, CODE, { hostId: OTHER }))
  })

  it("fails with bad code format", async () => {
    // I, O, 0 and 1 are excluded; also wrong length / lowercase.
    for (const bad of ["ABCI23", "ABC0Z2", "abc234", "ABC23", "ABC2345"]) {
      await assertFails(createSessionBatch(db(HOST), HOST, bad))
    }
  })

  it("fails when code field != doc id", async () => {
    await assertFails(createSessionBatch(db(HOST), HOST, CODE, { code: "XYZ234" }))
  })

  it("fails with an extra field", async () => {
    await assertFails(createSessionBatch(db(HOST), HOST, CODE, { extra: true }))
  })

  it("fails with a missing field", async () => {
    const f = db(HOST)
    const data = newSession(HOST)
    delete data.winnerIds
    const batch = writeBatch(f)
    batch.set(doc(f, "sessions", CODE), data)
    batch.set(doc(f, "sessions", CODE, "players", HOST), newPlayer())
    await assertFails(batch.commit())
  })

  it("fails when createdAt is not serverTimestamp", async () => {
    await assertFails(createSessionBatch(db(HOST), HOST, CODE, { createdAt: Timestamp.now() }))
  })

  it("re-create over an existing session by another user fails (collision detection)", async () => {
    await assertSucceeds(createSessionBatch(db(HOST), HOST))
    await assertFails(createSessionBatch(db(OTHER), OTHER))
    await assertFails(setDoc(doc(db(OTHER), "sessions", CODE), newSession(OTHER)))
  })
})

describe("join", () => {
  beforeEach(() => seed({ participantIds: [HOST] }))

  it("another user joins in one batch", async () => {
    await assertSucceeds(joinBatch(db(GUEST), GUEST))
  })

  it("cannot create a player doc for someone else", async () => {
    const f = db(GUEST)
    const batch = writeBatch(f)
    batch.update(doc(f, "sessions", CODE), { participantIds: arrayUnion(GUEST) })
    batch.set(doc(f, "sessions", CODE, "players", OTHER), newPlayer())
    await assertFails(batch.commit())
  })

  it("cannot create the player doc without the participantIds update", async () => {
    await assertFails(setDoc(doc(db(GUEST), "sessions", CODE, "players", GUEST), newPlayer()))
  })

  it("cannot add someone else to participantIds", async () => {
    await assertFails(updateDoc(doc(db(GUEST), "sessions", CODE), { participantIds: arrayUnion(OTHER) }))
  })
})

describe("join limits", () => {
  it("cannot join a finished session", async () => {
    await seed({ status: "finished", participantIds: [HOST] })
    await assertFails(joinBatch(db(GUEST), GUEST))
  })

  it("cannot join when 10 players are already in", async () => {
    const ten = [HOST, ...Array.from({ length: 9 }, (_, i) => `p${i}`)]
    await seed({ participantIds: ten })
    await assertFails(joinBatch(db(GUEST), GUEST))
  })

  it("can join as the 10th player", async () => {
    const nine = [HOST, ...Array.from({ length: 8 }, (_, i) => `p${i}`)]
    await seed({ participantIds: nine })
    await assertSucceeds(joinBatch(db(GUEST), GUEST))
  })
})

describe("count", () => {
  const guestPlayer = (f: Firestore) => doc(f, "sessions", CODE, "players", GUEST)

  it("owner can increment", async () => {
    await seed()
    await assertSucceeds(updateDoc(guestPlayer(db(GUEST)), { count: increment(1), updatedAt: serverTimestamp() }))
  })

  it("owner can decrement above 0", async () => {
    await seed({ guestCount: 2 })
    await assertSucceeds(updateDoc(guestPlayer(db(GUEST)), { count: increment(-1), updatedAt: serverTimestamp() }))
  })

  it("another user cannot change it", async () => {
    await seed()
    await assertFails(updateDoc(guestPlayer(db(HOST)), { count: increment(1), updatedAt: serverTimestamp() }))
  })

  it("cannot go below 0", async () => {
    await seed()
    await assertFails(updateDoc(guestPlayer(db(GUEST)), { count: increment(-1), updatedAt: serverTimestamp() }))
  })

  it("cannot go above 999", async () => {
    await seed({ guestCount: 999 })
    await assertFails(updateDoc(guestPlayer(db(GUEST)), { count: increment(1), updatedAt: serverTimestamp() }))
  })

  it("cannot change after the session is finished", async () => {
    await seed({ status: "finished", guestCount: 3 })
    await assertFails(updateDoc(guestPlayer(db(GUEST)), { count: increment(1), updatedAt: serverTimestamp() }))
  })

  it("updatedAt must be serverTimestamp", async () => {
    await seed()
    await assertFails(updateDoc(guestPlayer(db(GUEST)), { count: increment(1), updatedAt: Timestamp.now() }))
    await assertFails(updateDoc(guestPlayer(db(GUEST)), { count: increment(1) }))
  })

  it("cannot change name or other fields", async () => {
    await seed()
    await assertFails(updateDoc(guestPlayer(db(GUEST)), { name: "X", updatedAt: serverTimestamp() }))
  })
})

describe("rating / comment", () => {
  const guestPlayer = (f: Firestore) => doc(f, "sessions", CODE, "players", GUEST)

  for (const status of ["live", "finished"] as const) {
    it(`owner can rate 1..5 and comment while ${status}`, async () => {
      await seed({ status })
      for (const rating of [1, 5]) {
        await assertSucceeds(
          updateDoc(guestPlayer(db(GUEST)), { rating, comment: "Muy rico", updatedAt: serverTimestamp() }),
        )
      }
      await assertSucceeds(updateDoc(guestPlayer(db(GUEST)), { comment: null, updatedAt: serverTimestamp() }))
      await assertSucceeds(
        updateDoc(guestPlayer(db(GUEST)), { comment: "x".repeat(280), updatedAt: serverTimestamp() }),
      )
    })
  }

  it("rating 0 or 6 fails, comment > 280 fails, non-owner fails", async () => {
    await seed({ status: "finished" })
    await assertFails(updateDoc(guestPlayer(db(GUEST)), { rating: 0, updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(guestPlayer(db(GUEST)), { rating: 6, updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(guestPlayer(db(GUEST)), { rating: 4.5, updatedAt: serverTimestamp() }))
    await assertFails(
      updateDoc(guestPlayer(db(GUEST)), { comment: "x".repeat(281), updatedAt: serverTimestamp() }),
    )
    await assertFails(updateDoc(guestPlayer(db(HOST)), { rating: 3, updatedAt: serverTimestamp() }))
  })
})

describe("leave", () => {
  beforeEach(() => seed())

  it("non-host leaves in one batch", async () => {
    const f = db(GUEST)
    const batch = writeBatch(f)
    batch.update(doc(f, "sessions", CODE), { participantIds: arrayRemove(GUEST) })
    batch.delete(doc(f, "sessions", CODE, "players", GUEST))
    await assertSucceeds(batch.commit())
  })

  it("host cannot leave", async () => {
    const f = db(HOST)
    const batch = writeBatch(f)
    batch.update(doc(f, "sessions", CODE), { participantIds: arrayRemove(HOST) })
    batch.delete(doc(f, "sessions", CODE, "players", HOST))
    await assertFails(batch.commit())
  })

  it("deleting player doc without removing from participantIds fails", async () => {
    await assertFails(deleteDoc(doc(db(GUEST), "sessions", CODE, "players", GUEST)))
  })

  it("cannot remove someone else", async () => {
    await assertFails(updateDoc(doc(db(HOST), "sessions", CODE), { participantIds: arrayRemove(GUEST) }))
  })
})

describe("edit", () => {
  beforeEach(() => seed())

  it("host can update name/restaurant/location while live", async () => {
    await assertSucceeds(
      updateDoc(doc(db(HOST), "sessions", CODE), { name: "Nueva", restaurant: null, location: "Madrid" }),
    )
  })

  it("non-host cannot", async () => {
    await assertFails(updateDoc(doc(db(GUEST), "sessions", CODE), { name: "Nueva" }))
  })

  it("host cannot change hostId or status via edit", async () => {
    await assertFails(updateDoc(doc(db(HOST), "sessions", CODE), { hostId: GUEST }))
    await assertFails(updateDoc(doc(db(HOST), "sessions", CODE), { status: "finished" }))
  })
})

describe("finish", () => {
  const finish = () => ({
    status: "finished",
    finishedAt: serverTimestamp(),
    results: [
      { uid: HOST, name: "Host", photoURL: null, count: 4 },
      { uid: GUEST, name: "Guest", photoURL: "https://x/y.png", count: 4 },
    ],
    totalPieces: 8,
    winnerIds: [HOST, GUEST],
  })

  beforeEach(() => seed())

  it("host can finish", async () => {
    await assertSucceeds(updateDoc(doc(db(HOST), "sessions", CODE), finish()))
  })

  it("non-host cannot finish", async () => {
    await assertFails(updateDoc(doc(db(GUEST), "sessions", CODE), finish()))
  })

  it("cannot finish twice", async () => {
    await assertSucceeds(updateDoc(doc(db(HOST), "sessions", CODE), finish()))
    await assertFails(updateDoc(doc(db(HOST), "sessions", CODE), finish()))
  })

  it("cannot change hostId or participantIds in the finish update", async () => {
    await assertFails(updateDoc(doc(db(HOST), "sessions", CODE), { ...finish(), hostId: GUEST }))
    await assertFails(updateDoc(doc(db(HOST), "sessions", CODE), { ...finish(), participantIds: [HOST] }))
  })

  it("finishedAt must be serverTimestamp", async () => {
    await assertFails(updateDoc(doc(db(HOST), "sessions", CODE), { ...finish(), finishedAt: Timestamp.now() }))
  })
})

describe("reads", () => {
  beforeEach(() => seed({ status: "finished" }))

  it("signed-in users can get and list sessions and players", async () => {
    const f = db(OTHER)
    await assertSucceeds(getDoc(doc(f, "sessions", CODE)))
    await assertSucceeds(getDocs(query(collection(f, "sessions"), where("participantIds", "array-contains", OTHER))))
    await assertSucceeds(getDocs(query(collection(f, "sessions"), where("status", "==", "finished"))))
    await assertSucceeds(
      getDocs(query(collection(f, "sessions"), where("finishedAt", ">=", Timestamp.fromMillis(Date.now() - 86_400_000)))),
    )
    await assertSucceeds(getDoc(doc(f, "sessions", CODE, "players", GUEST)))
    await assertSucceeds(getDocs(collection(f, "sessions", CODE, "players")))
  })

  it("unauthenticated cannot read", async () => {
    const f = db()
    await assertFails(getDoc(doc(f, "sessions", CODE)))
    await assertFails(getDocs(query(collection(f, "sessions"), where("status", "==", "finished"))))
    await assertFails(getDoc(doc(f, "sessions", CODE, "players", GUEST)))
  })
})

describe("legacy collections and delete", () => {
  for (const name of ["users", "rooms", "games"]) {
    it(`${name} is denied even when signed in`, async () => {
      const f = db(HOST)
      await assertFails(getDoc(doc(f, name, HOST)))
      await assertFails(getDocs(collection(f, name)))
      await assertFails(setDoc(doc(f, name, HOST), { a: 1 }))
    })
  }

  it("session delete is denied", async () => {
    await seed()
    await assertFails(deleteDoc(doc(db(HOST), "sessions", CODE)))
  })
})
