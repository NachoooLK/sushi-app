"use client"

import { useEffect, useState } from "react"
import { subscribePlayers, subscribeSession } from "@/lib/sessions"
import type { Player, Session } from "@/lib/types"

interface SessionData {
  session: Session | null
  players: Player[]
  playersLoaded: boolean
  loading: boolean
  error: boolean
  retry: () => void
}

export function useSession(code: string | null): SessionData {
  const [session, setSession] = useState<Session | null>(null)
  const [players, setPlayers] = useState<Player[] | null>(null)
  const [loading, setLoading] = useState(Boolean(code))
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!code) return
    setLoading(true)
    setError(false)
    const fail = () => {
      setError(true)
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
  }, [code, attempt])

  // Sólo cuentan quienes siguen en la mesa, por si quedara algún documento huérfano.
  const seated = session && players ? players.filter((player) => session.participantIds.includes(player.uid)) : []
  return {
    session,
    players: seated,
    playersLoaded: players !== null,
    loading,
    error,
    retry: () => setAttempt((n) => n + 1),
  }
}
