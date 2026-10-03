"use client"

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { auth } from "./firebase"

export const guestLoginEnabled = process.env.NEXT_PUBLIC_ENABLE_GUEST === "1"

interface AuthState {
  user: User | null
  ready: boolean
  /** Fuerza un re-render tras cambiar el perfil, que Firebase no notifica. */
  refresh: () => void
  version: number
}

const AuthContext = createContext<AuthState>({ user: null, ready: false, refresh: () => {}, version: 0 })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(
    () =>
      onAuthStateChanged(auth(), (next) => {
        setUser(next)
        setReady(true)
      }),
    [],
  )

  const refresh = useCallback(() => setVersion((version) => version + 1), [])
  // `version` entra en las dependencias para que un cambio de perfil llegue a quien consume el contexto.
  const value = useMemo(() => ({ user, ready, refresh, version }), [user, ready, refresh, version])
  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  return useContext(AuthContext)
}

export function displayNameOf(user: Pick<User, "displayName" | "email">) {
  return user.displayName?.trim() || user.email?.split("@")[0] || "Comensal"
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: "select_account" })
  await signInWithPopup(auth(), provider)
}

export async function signInWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(auth(), email.trim(), password)
}

export async function registerWithEmail(name: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth(), email.trim(), password)
  await updateProfile(credential.user, { displayName: name.trim().slice(0, 40) })
}

export async function signInAsGuest(name: string) {
  const credential = await signInAnonymously(auth())
  await updateProfile(credential.user, { displayName: name.trim().slice(0, 40) })
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth(), email.trim())
}

export async function updateDisplayName(user: User, name: string) {
  await updateProfile(user, { displayName: name.trim().slice(0, 40) })
}

export async function signOut() {
  await firebaseSignOut(auth())
}

const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Email o contraseña incorrectos.",
  "auth/wrong-password": "Email o contraseña incorrectos.",
  "auth/user-not-found": "No hay ninguna cuenta con ese email.",
  "auth/invalid-email": "Ese email no parece válido.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese email. Prueba a entrar.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/missing-password": "Escribe tu contraseña.",
  "auth/too-many-requests": "Demasiados intentos. Espera un momento y vuelve a probar.",
  "auth/network-request-failed": "Sin conexión. Revisa tu internet.",
  "auth/popup-blocked": "El navegador ha bloqueado la ventana de Google. Permite ventanas emergentes.",
  "auth/unauthorized-domain": "Este dominio no está autorizado en Firebase para entrar con Google.",
  "auth/operation-not-allowed": "Este método de acceso no está activado en Firebase.",
  "auth/admin-restricted-operation": "Este método de acceso no está activado en Firebase.",
}

/** Devuelve null cuando el usuario canceló a propósito y no hay nada que mostrar. */
export function authErrorMessage(error: unknown): string | null {
  const code = (error as { code?: string })?.code ?? ""
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return null
  return AUTH_ERRORS[code] ?? "No se ha podido completar el acceso. Inténtalo de nuevo."
}
