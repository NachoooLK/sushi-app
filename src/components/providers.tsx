"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { AuthProvider, useAuth } from "@/lib/auth"
import { subscribeMySessions } from "@/lib/sessions"
import type { Session } from "@/lib/types"
import { ToastProvider } from "./toast"

interface MySessionsState {
  sessions: Session[]
  loading: boolean
  error: string | null
}

const MySessionsContext = createContext<MySessionsState>({ sessions: [], loading: true, error: null })

/** Una sola suscripción a "mis mesas" que sobrevive a la navegación entre pestañas. */
function MySessionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [state, setState] = useState<MySessionsState>({ sessions: [], loading: true, error: null })

  useEffect(() => {
    if (!uid) {
      setState({ sessions: [], loading: false, error: null })
      return
    }
    setState((current) => ({ ...current, loading: true }))
    return subscribeMySessions(
      uid,
      (sessions) => setState({ sessions, loading: false, error: null }),
      () => setState((current) => ({ ...current, loading: false, error: "No se han podido cargar tus mesas." })),
    )
  }, [uid])

  return <MySessionsContext value={state}>{children}</MySessionsContext>
}

export function useMySessions() {
  return useContext(MySessionsContext)
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <MySessionsProvider>{children}</MySessionsProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
