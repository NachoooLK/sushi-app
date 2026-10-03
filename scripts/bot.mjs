// Comensal simulado para probar mesas en local contra los emuladores de Firebase.
//   npm run emulators          (en otra terminal)
//   npm run bot -- K7P2QX "Ana" 15 1500
// Se une a la mesa con ese nombre y suma `taps` piezas, una cada `intervalMs`.
import { initializeApp } from "firebase/app"
import { connectAuthEmulator, getAuth, signInAnonymously, updateProfile } from "firebase/auth"
import {
  arrayUnion,
  connectFirestoreEmulator,
  doc,
  getFirestore,
  increment,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore"

const [code, name = "Bot", taps = "10", intervalMs = "1500"] = process.argv.slice(2)
if (!code) {
  console.error('Uso: npm run bot -- CODIGO "Nombre" [piezas] [ms entre piezas]')
  process.exit(1)
}

const app = initializeApp({ apiKey: "demo", projectId: "demo-sushi-rush" })
const auth = getAuth(app)
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true })
const db = getFirestore(app)
connectFirestoreEmulator(db, "127.0.0.1", 8080)

const { user } = await signInAnonymously(auth)
await updateProfile(user, { displayName: name })

const session = doc(db, "sessions", code)
const me = doc(db, "sessions", code, "players", user.uid)
const batch = writeBatch(db)
batch.update(session, { participantIds: arrayUnion(user.uid) })
batch.set(me, { name, photoURL: null, count: 0, joinedAt: serverTimestamp(), updatedAt: serverTimestamp() })
await batch.commit()
console.log(`${name} se ha sentado en ${code}`)

for (let i = 1; i <= Number(taps); i++) {
  await new Promise((resolve) => setTimeout(resolve, Number(intervalMs)))
  await updateDoc(me, { count: increment(1), updatedAt: serverTimestamp() })
  console.log(`${name}: ${i}`)
}
process.exit(0)
