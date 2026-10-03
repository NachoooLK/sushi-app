"use client"

import { MapPin } from "lucide-react"
import { useState } from "react"
import type { User } from "firebase/auth"
import { formatCode } from "@/lib/code"
import { joinSession, SessionError } from "@/lib/sessions"
import { rankPlayers } from "@/lib/stats"
import type { Player, Session } from "@/lib/types"
import { useToast } from "../toast"
import { Button, Card } from "../ui"
import { Leaderboard, SessionHeader } from "./parts"

export function JoinView({ session, players, user }: { session: Session; players: Player[]; user: User }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const full = session.participantIds.length >= session.maxPlayers

  async function join() {
    setBusy(true)
    setError(null)
    try {
      await joinSession(user, session.code)
      toast(`¡Dentro! Bienvenido a ${session.name}.`, "success")
    } catch (caught) {
      setError(caught instanceof SessionError ? caught.message : "No se ha podido entrar en la mesa. Inténtalo de nuevo.")
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-10">
      <SessionHeader title="Invitación" subtitle={`Mesa ${formatCode(session.code)}`} />
      <div className="px-4">
        <Card className="mt-2 p-6 text-center">
          <p className="text-sm font-medium text-muted">{session.hostName} te invita a</p>
          <h2 className="mt-1 text-balance font-display text-3xl font-extrabold tracking-tight">{session.name}</h2>
          {session.restaurant || session.location ? (
            <p className="mt-2 flex items-center justify-center gap-1 text-sm text-muted">
              <MapPin className="size-4" />
              {[session.restaurant, session.location].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          <p className="mt-4 text-sm">
            {players.length} de {session.maxPlayers} comensales
          </p>
          {error ? (
            <p role="alert" className="mt-4 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <Button size="lg" block className="mt-5" onClick={join} loading={busy} disabled={full}>
            {full ? "Mesa llena" : "Unirme a la mesa"}
          </Button>
        </Card>

        {players.length ? (
          <section className="mt-6">
            <h3 className="mb-3 font-display text-lg font-bold tracking-tight">Así va la mesa</h3>
            <Leaderboard players={rankPlayers(players)} meId={user.uid} hostId={session.hostId} />
          </section>
        ) : null}
      </div>
    </div>
  )
}
