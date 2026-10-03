"use client"

import { ChevronRight, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { formatDay, ordinal, pieces } from "@/lib/format"
import { resultHref, tableHref } from "@/lib/routes"
import { subscribeMyCount } from "@/lib/sessions"
import { myResult } from "@/lib/stats"
import type { Session } from "@/lib/types"
import { cx, Tag } from "./ui"

function where(session: Session) {
  return [session.restaurant, session.location].filter(Boolean).join(" · ")
}

/** Tarjeta destacada de una mesa en curso (Inicio). */
export function LiveSessionCard({ session }: { session: Session }) {
  const diners = session.participantIds.length
  return (
    <Link
      href={tableHref(session.code)}
      className="flex flex-col gap-3 rounded-card border border-accent bg-accent-soft p-4 transition-[filter] hover:brightness-[1.02]"
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-h3 text-ink">{session.name}</p>
          <p className="truncate text-[14px] leading-5 text-ink-2">{where(session) || `Mesa de ${session.hostName}`}</p>
        </div>
        <Tag kind="live">En directo</Tag>
      </div>
      <div className="flex items-center gap-2 text-[14px] leading-5 font-medium text-ink-2">
        <Users size={18} aria-hidden />
        <span className="flex-1">
          {diners} {diners === 1 ? "comensal" : "comensales"}
        </span>
        <ChevronRight size={20} aria-hidden />
      </div>
    </Link>
  )
}

/** Fila de mesa para listas con separadores (Inicio, Historial). */
export function SessionRow({ session, uid }: { session: Session; uid: string }) {
  const live = session.status === "live"
  const mine = myResult(session, uid)
  const players = session.results?.length ?? session.participantIds.length
  const winners = (session.results ?? []).filter((entry) => session.winnerIds.includes(entry.uid))
  const won = Boolean(mine?.won)

  let line: string
  if (live) line = `${players} ${players === 1 ? "comensal" : "comensales"}`
  else if (players < 2) line = "En solitario"
  else if (won) line = `Ganaste de ${players}`
  else if (mine) {
    const winner = winners[0]
    line = `Quedaste ${ordinal(mine.position)} de ${players}${winner ? ` · ganó ${winner.name} con ${pieces(winner.count)}` : ""}`
  } else line = `${players} comensales`

  const liveCount = useLiveCount(session, uid)
  const count = live ? liveCount : (mine?.count ?? null)
  const subtitle = [session.restaurant ?? session.location, formatDay(session.finishedAt ?? session.createdAt)]
    .filter(Boolean)
    .join(" · ")

  return (
    <li className="border-b border-line">
      <Link href={live ? tableHref(session.code) : resultHref(session.code)} className="group flex items-center gap-4 py-4">
        <div className="w-[60px] shrink-0">
          <p
            className={cx(
              "text-[32px] leading-9 font-semibold tracking-[-0.02em] tabular-nums",
              won ? "text-accent-ink" : "text-ink",
            )}
          >
            {count ?? "–"}
          </p>
          <p className="text-[12px] leading-4 text-ink-3">piezas</p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-base leading-[22px] font-semibold text-ink">{session.name}</p>
          <p className="truncate text-[14px] leading-5 text-ink-2">{subtitle}</p>
          <p className={cx("flex min-w-0 items-start gap-1.5 text-caption font-medium", won ? "text-accent-ink" : "text-ink-2")}>
            {won ? <Trophy size={14} className="mt-0.5 shrink-0" aria-hidden /> : null}
            <span className="text-pretty">{line}</span>
          </p>
        </div>
        {live ? <Tag kind="live">En directo</Tag> : null}
        <ChevronRight size={20} className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </li>
  )
}

function useLiveCount(session: Session, uid: string) {
  const [count, setCount] = useState<number | null>(null)
  const live = session.status === "live"
  useEffect(() => {
    if (!live) return
    return subscribeMyCount(session.code, uid, setCount)
  }, [live, session.code, uid])
  return count
}
