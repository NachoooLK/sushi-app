"use client"

import { LucideProvider } from "lucide-react"
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { AuthProvider, useAuth } from "@/lib/auth"
import { subscribeMySessions } from "@/lib/sessions"
import type { Session } from "@/lib/types"
import { ToastProvider } from "./toast"

interface MySessionsState {
  sessions: Session[]
  loading: boolean
  error: string | null
}

const MySessionsContext = createContext<MySessionsState & { retry: () => void }>({
  sessions: [],
  loading: true,
  error: null,
  retry: () => {},
})

/** Una sola suscripción a "mis mesas" que sobrevive a la navegación entre pestañas. */
function MySessionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [state, setState] = useState<MySessionsState>({ sessions: [], loading: true, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!uid) {
      setState({ sessions: [], loading: false, error: null })
      return
    }
    setState((current) => ({ ...current, loading: true, error: null }))
    return subscribeMySessions(
      uid,
      (sessions) => setState({ sessions, loading: false, error: null }),
      () => setState((current) => ({ ...current, loading: false, error: "No se han podido cargar tus mesas." })),
    )
  }, [uid, attempt])

  const value = useMemo(() => ({ ...state, retry: () => setAttempt((n) => n + 1) }), [state])
  return <MySessionsContext value={value}>{children}</MySessionsContext>
}

export function useMySessions() {
  return useContext(MySessionsContext)
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LucideProvider strokeWidth={1.75}>
      <AuthProvider>
        <ToastProvider>
          <MySessionsProvider>{children}</MySessionsProvider>
        </ToastProvider>
      </AuthProvider>
    </LucideProvider>
  )
}
