import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app"
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth"
import {
  connectFirestoreEmulator,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore"

export const usingEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === "1"

// La configuración web de Firebase es pública por diseño: la seguridad vive en firestore.rules.
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyAlzsPWuThGAzE3NaKg7roW3nVuSACsZSo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "sushi-e3a2b.firebaseapp.com",
  projectId: usingEmulators
    ? "demo-sushi-rush"
    : (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "sushi-e3a2b"),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:76628481247:web:2899dc8d9a781701ce456a",
}

let app: FirebaseApp | undefined
let authInstance: Auth | undefined
let dbInstance: Firestore | undefined

function firebaseApp() {
  app ??= getApps().length ? getApp() : initializeApp(config)
  return app
}

// Inicialización perezosa: sólo se llama desde efectos y handlers, nunca durante el render en servidor.
export function auth() {
  if (!authInstance) {
    authInstance = getAuth(firebaseApp())
    if (usingEmulators) {
      connectAuthEmulator(authInstance, "http://127.0.0.1:9099", { disableWarnings: true })
    }
  }
  return authInstance
}

export function db() {
  if (!dbInstance) {
    // La caché persistente mantiene los toques guardados si el wifi del restaurante se cae.
    dbInstance = initializeFirestore(firebaseApp(), {
      localCache:
        typeof indexedDB === "undefined"
          ? memoryLocalCache()
          : persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })
    if (usingEmulators) {
      connectFirestoreEmulator(dbInstance, "127.0.0.1", 8080)
    }
  }
  return dbInstance
}
