"use client"

import { useEffect, useState } from "react"
import { subscribePlayers, subscribeSession } from "@/lib/sessions"
import type { Player, Session } from "@/lib/types"

interface SessionData {
  session: Session | null
  players: Player[]
  loading: boolean
  error: string | null
}

export function useSession(code: string | null): SessionData {
  const [session, setSession] = useState<Session | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(Boolean(code))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return
    setLoading(true)
    const fail = () => {
      setError("No se ha podido cargar la mesa. Revisa tu conexión.")
      setLoading(false)
    }
    const stopSession = subscribeSession(
      code,
      (next) => {
        setSession(next)
        setLoading(false)
      },
      fail,
    )
    const stopPlayers = subscribePlayers(code, setPlayers, fail)
    return () => {
      stopSession()
      stopPlayers()
    }
  }, [code])

  // Sólo cuentan quienes siguen en la mesa, por si quedara algún documento huérfano.
  const seated = session ? players.filter((player) => session.participantIds.includes(player.uid)) : []
  return { session, players: seated, loading, error }
}
