"use client"

import { UtensilsCrossed } from "lucide-react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { useMySessions } from "@/components/providers"
import { SessionCard } from "@/components/session-card"
import { EmptyState, Spinner } from "@/components/ui"
import { useAuth } from "@/lib/auth"
import { formatMonth } from "@/lib/format"
import type { Session } from "@/lib/types"

export default function HistoryPage() {
  return (
    <AppShell>
      <History />
    </AppShell>
  )
}

function History() {
  const { user } = useAuth()
  const { sessions, loading, error } = useMySessions()
  if (!user) return null

  const groups = new Map<string, Session[]>()
  for (const session of sessions) {
    const date = session.finishedAt ?? session.createdAt ?? new Date()
    const label = session.status === "live" ? "En curso" : formatMonth(date)
    groups.set(label, [...(groups.get(label) ?? []), session])
  }

  return (
    <div className="space-y-6 pt-2">
      <section>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Historial</h1>
        <p className="mt-1 text-muted">Todas las mesas en las que has comido.</p>
      </section>

      {loading ? (
        <div className="grid place-items-center py-16 text-muted">
          <Spinner className="size-6" />
        </div>
      ) : error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="size-8" />}
          title="Tu historial está vacío"
          action={
            <Link href="/nueva" className="inline-flex h-11 items-center rounded-2xl bg-accent px-5 font-semibold text-accent-ink">
              Crear mi primera mesa
            </Link>
          }
        >
          Crea una mesa o únete a la de tus amigos para empezar a contar.
        </EmptyState>
      ) : (
        [...groups.entries()].map(([label, items]) => (
          <section key={label}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted">{label}</h2>
            <div className="space-y-3">
              {items.map((session) => (
                <SessionCard key={session.code} session={session} uid={user.uid} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
