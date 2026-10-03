"use client"

import { ChevronRight, CircleAlert, RefreshCw, Trophy } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Avatar, Button, cx, Empty, PositionMark, Seg } from "@/components/ui"
import { useAuth } from "@/lib/auth"
import { formatDay } from "@/lib/format"
import { resultHref } from "@/lib/routes"
import { fetchFinishedSessions } from "@/lib/sessions"
import { buildLeaderboard, periodStart, topPerformances, type LeaderboardRow, type Performance } from "@/lib/stats"
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
  all: "Aún no se ha cerrado ninguna mesa.",
}

const MAX_ROWS = 50

export default function RankingsPage() {
  return (
    <AppShell width="rankings">
      <Rankings />
    </AppShell>
  )
}

type Load = { key: string; sessions: Session[] } | { key: string; error: true }

function Rankings() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<Period>("month")
  const [attempt, setAttempt] = useState(0)
  const [load, setLoad] = useState<Load | null>(null)
  const key = `${period}:${attempt}`

  useEffect(() => {
    // Si cambias de periodo antes de que llegue la respuesta, la anterior se descarta.
    let cancelled = false
    fetchFinishedSessions(periodStart(period))
      .then((sessions) => {
        if (!cancelled) setLoad({ key, sessions })
      })
      .catch(() => {
        if (!cancelled) setLoad({ key, error: true })
      })
    return () => {
      cancelled = true
    }
  }, [key, period])

  const current = load?.key === key ? load : null
  const sessions = current && "sessions" in current ? current.sessions : null
  const leaderboard = useMemo(() => (sessions ? buildLeaderboard(sessions) : []), [sessions])
  const marks = useMemo(() => (sessions ? topPerformances(sessions, 5) : []), [sessions])

  return (
    <>
      <header>
        <h1 className="text-title text-ink lg:text-[40px] lg:leading-[46px] lg:tracking-[-0.035em]">Rankings</h1>
        <p className="mt-1.5 text-body-lg text-ink-2 lg:text-[18px] lg:leading-[26px]">
          Quién ha comido más sushi en Sushi Rush.
        </p>
      </header>

      <div className="mt-5 lg:max-w-[420px]">
        <Seg label="Periodo" value={period} options={PERIODS} onChange={setPeriod} />
      </div>

      {!current ? (
        <RankingsSkeleton />
      ) : "error" in current ? (
        <div className="mt-6 border-t border-line">
          <Empty
            icon={CircleAlert}
            title="No se han podido cargar los rankings."
            action={
              <Button kind="secondary" icon={RefreshCw} onClick={() => setAttempt((n) => n + 1)}>
                Reintentar
              </Button>
            }
          >
            Revisa tu conexión e inténtalo otra vez.
          </Empty>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="mt-6 border-t border-line">
          <Empty icon={Trophy} title={EMPTY_COPY[period]} />
        </div>
      ) : (
        <div className="mt-7 lg:mt-8 lg:grid lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <section aria-labelledby="rankings-most">
            <h2 id="rankings-most" className="text-h2 text-ink">
              Más piezas
            </h2>
            <ol className="mt-1.5 px-3">
              {leaderboard.slice(0, MAX_ROWS).map((row) => (
                <LeaderRow
                  key={row.uid}
                  row={row}
                  position={1 + leaderboard.filter((other) => other.pieces > row.pieces).length}
                  blank={leaderboard[0].pieces === 0}
                  me={row.uid === user?.uid}
                />
              ))}
            </ol>
          </section>

          <section aria-labelledby="rankings-marks" className="mt-9 lg:mt-0">
            <h2 id="rankings-marks" className="text-h2 text-ink">
              Mejores marcas en una mesa
            </h2>
            {marks.length ? (
              <ol className="mt-1.5">
                {marks.map((mark, index) => (
                  <MarkRow key={`${mark.sessionCode}-${mark.uid}`} mark={mark} index={index + 1} />
                ))}
              </ol>
            ) : null}
            <p className="mt-5 text-caption text-pretty text-ink-3">
              Las victorias sólo cuentan en mesas de dos o más personas.
            </p>
          </section>
        </div>
      )}
    </>
  )
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

function LeaderRow({ row, position, blank, me }: { row: LeaderboardRow; position: number; blank: boolean; me: boolean }) {
  return (
    <li
      className={cx(
        "-mx-3 flex min-h-[76px] items-center gap-3 border-b px-3",
        me ? "rounded-btn border-transparent bg-accent-soft" : "border-line",
      )}
    >
      <PositionMark position={position} size={28} blank={blank} />
      <Avatar name={row.name} photoURL={row.photoURL} seed={row.uid} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base leading-[22px] font-semibold text-ink">
          {row.name}
          {me ? <span className="text-accent-ink"> · tú</span> : null}
        </p>
        <p className="truncate text-caption text-ink-2 tabular-nums">
          {plural(row.sessions, "mesa", "mesas")} · {plural(row.wins, "victoria", "victorias")} · récord {row.best}
        </p>
      </div>
      <p
        className={cx(
          "shrink-0 text-[26px] leading-8 font-semibold tracking-[-0.02em] tabular-nums",
          me ? "text-accent-ink" : "text-ink",
        )}
      >
        {row.pieces}
        <span className="sr-only"> piezas</span>
      </p>
    </li>
  )
}

function MarkRow({ mark, index }: { mark: Performance; index: number }) {
  const where = [mark.restaurant?.trim() || mark.sessionName, formatDay(mark.finishedAt)].filter(Boolean).join(" · ")
  return (
    <li>
      <Link href={resultHref(mark.sessionCode)} className="group flex min-h-[68px] items-center gap-3 border-b border-line">
        <span className="w-5 shrink-0 text-[15px] leading-none font-semibold text-ink-3 tabular-nums">{index}</span>
        <Avatar name={mark.name} photoURL={mark.photoURL} seed={mark.uid} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base leading-[22px] font-semibold text-ink">{mark.name}</p>
          <p className="truncate text-caption text-ink-2">{where}</p>
        </div>
        <p className="shrink-0 text-[26px] leading-8 font-semibold tracking-[-0.02em] text-ink tabular-nums">
          {mark.count}
          <span className="sr-only"> piezas</span>
        </p>
        <ChevronRight
          size={20}
          className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 lg:hidden"
          aria-hidden
        />
      </Link>
    </li>
  )
}

function Bone({ className }: { className: string }) {
  return <span aria-hidden className={cx("block shrink-0 animate-skeleton bg-sf", className)} />
}

function RankingsSkeleton() {
  return (
    <div role="status" aria-label="Cargando los rankings">
      <Bone className="mt-7 h-[26px] w-[140px] rounded-lg" />
      <div className="mt-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex h-[72px] items-center gap-3 border-b border-line">
            <Bone className="size-7 rounded-full" />
            <Bone className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Bone className="h-3.5 w-2/5 rounded-[7px]" />
              <Bone className="h-[11px] w-[70%] rounded-md" />
            </div>
            <Bone className="h-[26px] w-11 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
