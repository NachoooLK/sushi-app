"use client"

import { ChevronRight, Crown, MapPin, Radio, Users } from "lucide-react"
import Link from "next/link"
import { formatDay, ordinal, pieces } from "@/lib/format"
import { myResult } from "@/lib/stats"
import type { Session } from "@/lib/types"
import { cx } from "./ui"

export function SessionCard({ session, uid }: { session: Session; uid: string }) {
  const live = session.status === "live"
  const mine = myResult(session, uid)
  const winners = (session.results ?? []).filter((entry) => session.winnerIds.includes(entry.uid))
  const players = session.results?.length ?? session.participantIds.length

  return (
    <Link
      href={`/s/${session.code}`}
      className={cx(
        "group flex items-center gap-4 rounded-3xl border bg-surface p-4 shadow-card transition hover:-translate-y-0.5",
        live ? "border-accent/40" : "border-line",
      )}
    >
      <div
        className={cx(
          "grid size-14 shrink-0 place-items-center rounded-2xl font-display",
          live ? "bg-accent text-accent-ink" : mine?.won ? "bg-gold-soft text-gold" : "bg-surface-2 text-ink",
        )}
      >
        {live ? (
          <Radio className="size-6 animate-pulse" />
        ) : mine ? (
          <div className="text-center leading-none">
            <div className="text-xl font-extrabold tabular">{mine.count}</div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">
              {mine.count === 1 ? "pieza" : "piezas"}
            </div>
          </div>
        ) : (
          <Users className="size-6" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold">{session.name}</p>
          {live ? (
            <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent">
              En directo
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted">
          {session.restaurant ? (
            <>
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{session.restaurant}</span>
              <span aria-hidden>·</span>
            </>
          ) : null}
          <span className="shrink-0">{formatDay(session.finishedAt ?? session.createdAt)}</span>
        </p>
        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted">
          {live ? (
            <>
              <Users className="size-3.5" /> {players} {players === 1 ? "comensal" : "comensales"}
            </>
          ) : mine && players > 1 ? (
            <>
              {mine.won ? <Crown className="size-3.5 text-gold" /> : null}
              {mine.won ? "Ganaste" : `Quedaste ${ordinal(mine.position)}`} de {players}
              {!mine.won && winners[0] ? ` · ganó ${winners[0].name} con ${pieces(winners[0].count)}` : null}
            </>
          ) : (
            "En solitario"
          )}
        </p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted transition group-hover:translate-x-0.5" />
    </Link>
  )
}
