"use client"

import { Medal, Trophy } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { PositionBadge } from "@/components/session/parts"
import { Avatar, cx, EmptyState, SectionTitle, Segmented, Spinner } from "@/components/ui"
import { useAuth } from "@/lib/auth"
import { formatDay } from "@/lib/format"
import { fetchFinishedSessions } from "@/lib/sessions"
import { buildLeaderboard, periodStart, topPerformances } from "@/lib/stats"
import type { Period, Session } from "@/lib/types"

const PERIODS: { value: Period; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "all", label: "Siempre" },
]

const EMPTY_COPY: Record<Period, string> = {
  today: "Hoy todavía no se ha cerrado ninguna mesa.",
  week: "Esta semana todavía no se ha cerrado ninguna mesa.",
  month: "Este mes todavía no se ha cerrado ninguna mesa.",
  all: "Todavía no se ha cerrado ninguna mesa.",
}

export default function RankingsPage() {
  return (
    <AppShell>
      <Rankings />
    </AppShell>
  )
}

function Rankings() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<Period>("month")
  const [state, setState] = useState<{ period: Period; sessions: Session[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    fetchFinishedSessions(periodStart(period))
      .then((sessions) => {
        if (!cancelled) setState({ period, sessions })
      })
      .catch(() => {
        if (!cancelled) setError("No se han podido cargar los rankings.")
      })
    return () => {
      cancelled = true
    }
  }, [period])

  const loading = state?.period !== period && !error
  const sessions = useMemo(() => state?.sessions ?? [], [state])
  const leaderboard = useMemo(() => buildLeaderboard(sessions), [sessions])
  const records = useMemo(() => topPerformances(sessions, 5), [sessions])

  return (
    <div className="space-y-6 pt-2">
      <section>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Rankings</h1>
        <p className="mt-1 text-muted">Quién ha comido más sushi en Sushi Rush.</p>
      </section>

      <Segmented label="Periodo" value={period} onChange={setPeriod} options={PERIODS} />

      {loading ? (
        <div className="grid place-items-center py-16 text-muted">
          <Spinner className="size-6" />
        </div>
      ) : error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : leaderboard.length === 0 ? (
        <EmptyState icon={<Trophy className="size-8" />} title="Sin resultados">
          {EMPTY_COPY[period]}
        </EmptyState>
      ) : (
        <>
          <section>
            <SectionTitle>Más piezas</SectionTitle>
            <ol className="space-y-2">
              {leaderboard.slice(0, 50).map((row) => {
                const position = 1 + leaderboard.filter((other) => other.pieces > row.pieces).length
                const isMe = row.uid === user?.uid
                return (
                  <li
                    key={row.uid}
                    className={cx(
                      "flex items-center gap-3 rounded-2xl border px-3 py-2.5",
                      isMe ? "border-accent/40 bg-accent-soft/60" : "border-line bg-surface",
                    )}
                  >
                    <PositionBadge position={position} />
                    <Avatar name={row.name} photoURL={row.photoURL} seed={row.uid} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {row.name}
                        {isMe ? <span className="text-sm font-medium text-accent"> · tú</span> : null}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {row.sessions} {row.sessions === 1 ? "mesa" : "mesas"} · {row.wins}{" "}
                        {row.wins === 1 ? "victoria" : "victorias"} · récord {row.best}
                      </p>
                    </div>
                    <span className="font-display text-2xl font-extrabold tabular" aria-label={`${row.pieces} piezas`}>
                      {row.pieces}
                    </span>
                  </li>
                )
              })}
            </ol>
          </section>

          {records.length ? (
            <section>
              <SectionTitle>Mejores marcas en una mesa</SectionTitle>
              <ol className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
                {records.map((record, index) => (
                  <li key={`${record.sessionCode}-${record.uid}`}>
                    <Link href={`/s/${record.sessionCode}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
                      <Medal className={cx("size-5 shrink-0", index === 0 ? "text-gold" : "text-muted")} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{record.name}</p>
                        <p className="truncate text-xs text-muted">
                          {record.restaurant ?? record.sessionName} · {formatDay(record.finishedAt)}
                        </p>
                      </div>
                      <span className="font-display text-xl font-extrabold tabular">{record.count}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <p className="text-center text-xs text-muted">Las victorias sólo cuentan en mesas de dos o más personas.</p>
        </>
      )}
    </div>
  )
}
