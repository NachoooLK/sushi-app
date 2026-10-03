"use client"

import { Plus, UtensilsCrossed } from "lucide-react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { JoinByCode } from "@/components/join-by-code"
import { useMySessions } from "@/components/providers"
import { SessionCard } from "@/components/session-card"
import { Card, EmptyState, SectionTitle, Spinner, StatTile } from "@/components/ui"
import { displayNameOf, useAuth } from "@/lib/auth"
import { decimal } from "@/lib/format"
import { personalStats } from "@/lib/stats"

export default function HomePage() {
  return (
    <AppShell>
      <Home />
    </AppShell>
  )
}

function Home() {
  const { user } = useAuth()
  const { sessions, loading, error } = useMySessions()
  if (!user) return null

  const live = sessions.filter((session) => session.status === "live")
  const finished = sessions.filter((session) => session.status === "finished")
  const stats = personalStats(sessions, user.uid)
  const firstName = displayNameOf(user).split(" ")[0]

  return (
    <div className="space-y-8 pt-2">
      <section>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Hola, {firstName}</h1>
        <p className="mt-1 text-muted">
          {live.length ? "Tienes una mesa en marcha. ¡A por la siguiente pieza!" : "¿Hoy toca libre de sushi?"}
        </p>
      </section>

      {live.length ? (
        <section aria-label="Mesas en curso" className="space-y-3">
          {live.map((session) => (
            <SessionCard key={session.code} session={session} uid={user.uid} />
          ))}
        </section>
      ) : null}

      <Card className="overflow-hidden">
        <Link
          href="/nueva"
          className="flex items-center gap-4 bg-accent p-5 text-accent-ink transition hover:bg-accent-strong"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-white/20">
            <Plus className="size-7" strokeWidth={2.6} />
          </span>
          <span>
            <span className="block font-display text-xl font-extrabold">Nueva mesa</span>
            <span className="block text-sm opacity-90">Crea la mesa e invita a los demás con un código o QR.</span>
          </span>
        </Link>
        <div className="p-5">
          <JoinByCode />
        </div>
      </Card>

      <section>
        <SectionTitle>Tus números</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Piezas" value={stats.pieces.toLocaleString("es-ES")} tone="accent" />
          <StatTile label="Mesas" value={stats.sessions} hint={stats.sessions ? `${decimal(stats.average)} de media` : undefined} />
          <StatTile
            label="Victorias"
            value={stats.wins}
            hint={stats.groupSessions ? `de ${stats.groupSessions} en grupo` : undefined}
            tone="gold"
          />
          <StatTile label="Récord" value={stats.best} hint={stats.best ? "piezas en una mesa" : undefined} tone="wasabi" />
        </div>
      </section>

      <section>
        <SectionTitle
          action={
            finished.length > 3 ? (
              <Link href="/historial" className="text-sm font-semibold text-accent">
                Ver todo
              </Link>
            ) : null
          }
        >
          Últimas mesas
        </SectionTitle>
        {loading ? (
          <div className="grid place-items-center py-10 text-muted">
            <Spinner className="size-6" />
          </div>
        ) : error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : finished.length ? (
          <div className="space-y-3">
            {finished.slice(0, 3).map((session) => (
              <SessionCard key={session.code} session={session} uid={user.uid} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<UtensilsCrossed className="size-8" />} title="Aún no hay mesas">
            Cuando cerréis vuestra primera mesa aparecerá aquí con el resultado.
          </EmptyState>
        )}
      </section>
    </div>
  )
}
