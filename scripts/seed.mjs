// Datos de ejemplo para desarrollar contra los emuladores (npm run emulators && npm run seed).
// Crea a Marta (marta@test.dev / sushi123) con mesas cerradas, una mesa en directo y una invitación pendiente.
import { initializeApp } from "firebase/app"
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInAnonymously,
  updateProfile,
} from "firebase/auth"
import {
  arrayUnion,
  connectFirestoreEmulator,
  doc,
  getFirestore,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore"

const PROJECT = "demo-sushi-rush"
const FIRESTORE = "http://127.0.0.1:8080"

async function person(name, email) {
  const app = initializeApp({ apiKey: "demo", projectId: PROJECT }, name)
  const auth = getAuth(app)
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true })
  const db = getFirestore(app)
  connectFirestoreEmulator(db, "127.0.0.1", 8080)
  const { user } = email
    ? await createUserWithEmailAndPassword(auth, email, "sushi123")
    : await signInAnonymously(auth)
  await updateProfile(user, { displayName: name })
  return { name, uid: user.uid, db }
}

const player = (who) => ({
  name: who.name,
  photoURL: null,
  count: 0,
  joinedAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

async function table(host, code, details, guests) {
  const batch = writeBatch(host.db)
  batch.set(doc(host.db, "sessions", code), {
    code,
    name: details.name,
    restaurant: details.restaurant ?? null,
    location: details.location ?? null,
    hostId: host.uid,
    hostName: host.name,
    status: "live",
    createdAt: serverTimestamp(),
    finishedAt: null,
    participantIds: [host.uid],
    maxPlayers: 10,
    results: null,
    totalPieces: 0,
    winnerIds: [],
  })
  batch.set(doc(host.db, "sessions", code, "players", host.uid), player(host))
  await batch.commit()
  for (const guest of guests) {
    const join = writeBatch(guest.db)
    join.update(doc(guest.db, "sessions", code), { participantIds: arrayUnion(guest.uid) })
    join.set(doc(guest.db, "sessions", code, "players", guest.uid), player(guest))
    await join.commit()
  }
}

async function eat(who, code, count) {
  if (!count) return
  await updateDoc(doc(who.db, "sessions", code, "players", who.uid), { count, updatedAt: serverTimestamp() })
}

async function close(host, code, counts) {
  const results = [...counts]
    .sort((a, b) => b[1] - a[1])
    .map(([who, count]) => ({ uid: who.uid, name: who.name, photoURL: null, count }))
  const top = results[0].count
  const winnerIds = results.length > 1 && top > 0 ? results.filter((r) => r.count === top).map((r) => r.uid) : []
  await updateDoc(doc(host.db, "sessions", code), {
    status: "finished",
    finishedAt: serverTimestamp(),
    results,
    totalPieces: results.reduce((sum, r) => sum + r.count, 0),
    winnerIds,
  })
}

async function rate(who, code, rating, comment) {
  await updateDoc(doc(who.db, "sessions", code, "players", who.uid), {
    rating,
    comment,
    updatedAt: serverTimestamp(),
  })
}

/** Reescribe las fechas saltándose las reglas (solo emulador) para que duraciones e historial sean realistas. */
async function backdate(code, startMinutesAgo, durationMinutes) {
  const start = new Date(Date.now() - startMinutesAgo * 60_000)
  const fields = { createdAt: { timestampValue: start.toISOString() } }
  const mask = ["createdAt"]
  if (durationMinutes !== null) {
    fields.finishedAt = { timestampValue: new Date(start.getTime() + durationMinutes * 60_000).toISOString() }
    mask.push("finishedAt")
  }
  const query = mask.map((field) => `updateMask.fieldPaths=${field}`).join("&")
  const response = await fetch(
    `${FIRESTORE}/v1/projects/${PROJECT}/databases/(default)/documents/sessions/${code}?${query}`,
    { method: "PATCH", headers: { Authorization: "Bearer owner", "Content-Type": "application/json" }, body: JSON.stringify({ fields }) },
  )
  if (!response.ok) throw new Error(`backdate ${code}: ${response.status} ${await response.text()}`)
}

const marta = await person("Marta Ruiz", "marta@test.dev")
const ana = await person("Ana")
const dani = await person("Dani")
const lucia = await person("Lucía")
const pablo = await person("Pablo")

// Hoy: ganó Marta en Sakura Buffet.
await table(marta, "SKR4PX", { name: "Libre en Sakura Buffet", restaurant: "Sakura Buffet", location: "Chamberí" }, [ana, dani, lucia, pablo])
for (const [who, n] of [[marta, 22], [ana, 18], [dani, 12], [lucia, 9], [pablo, 4]]) await eat(who, "SKR4PX", n)
await close(marta, "SKR4PX", [[marta, 22], [ana, 18], [dani, 12], [lucia, 9], [pablo, 4]])
await rate(ana, "SKR4PX", 4, "Muy buena relación calidad-precio. Repetiría, aunque pediría antes el sushi caliente.")
await rate(dani, "SKR4PX", 5, "El nigiri de salmón flambeado, de 10.")
await backdate("SKR4PX", 200, 85)

// Hace 3 días: ganó Ana en Kiyomi.
await table(ana, "KYM7Q2", { name: "Cena del viernes", restaurant: "Kiyomi", location: "Malasaña" }, [marta, dani])
for (const [who, n] of [[ana, 25], [marta, 19], [dani, 15]]) await eat(who, "KYM7Q2", n)
await close(ana, "KYM7Q2", [[ana, 25], [marta, 19], [dani, 15]])
await backdate("KYM7Q2", 3 * 24 * 60, 95)

// Hace 40 días: reto en solitario.
await table(marta, "TKG3HN", { name: "Reto en solitario", restaurant: "Tokyo Garden", location: "Chamberí" }, [])
await eat(marta, "TKG3HN", 27)
await close(marta, "TKG3HN", [[marta, 27]])
await backdate("TKG3HN", 40 * 24 * 60, 52)

// En directo ahora: Marta va 2.ª a una pieza de Ana.
await table(marta, "ZAH73V", { name: "Libre en Sakura Buffet", restaurant: "Sakura Buffet", location: "Chamberí" }, [ana, dani, lucia, pablo])
for (const [who, n] of [[ana, 18], [marta, 17], [dani, 12], [lucia, 9], [pablo, 4]]) await eat(who, "ZAH73V", n)
await backdate("ZAH73V", 42, null)

// Invitación pendiente: mesa de Ana en la que Marta todavía no está.
await table(ana, "K7P2QX", { name: "Comida de empresa", restaurant: "Nikkei Bar", location: "Salamanca" }, [dani, lucia])
for (const [who, n] of [[ana, 6], [dani, 3], [lucia, 2]]) await eat(who, "K7P2QX", n)
await backdate("K7P2QX", 25, null)

console.log("Listo: entra con marta@test.dev / sushi123")
console.log("Mesa en directo: /mesa/ZAH73V · Invitación: /mesa/K7P2QX · Resultado: /mesa/SKR4PX/resultado")
process.exit(0)
