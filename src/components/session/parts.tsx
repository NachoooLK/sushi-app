"use client"

import { ArrowLeft, Crown } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { ordinal } from "@/lib/format"
import type { RankedPlayer } from "@/lib/stats"
import { Avatar, cx } from "../ui"

export function SessionHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 bg-bg/85 px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-md">
      <Link
        href="/"
        aria-label="Volver al inicio"
        className="grid size-10 shrink-0 place-items-center rounded-full text-ink hover:bg-surface-2"
      >
        <ArrowLeft className="size-5" />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-lg font-extrabold leading-tight tracking-tight">{title}</h1>
        {subtitle ? <p className="truncate text-xs text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </header>
  )
}

export function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-10 place-items-center rounded-full text-ink hover:bg-surface-2"
    >
      {children}
    </button>
  )
}

const MEDALS = ["bg-gold text-white", "bg-[#a7a39d] text-white", "bg-[#c98a54] text-white"]

export function PositionBadge({ position }: { position: number }) {
  return (
    <span
      className={cx(
        "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold tabular",
        MEDALS[position - 1] ?? "bg-surface-2 text-muted",
      )}
    >
      {position}
    </span>
  )
}

export function Leaderboard({
  players,
  meId,
  hostId,
  live = false,
}: {
  players: RankedPlayer[]
  meId: string
  hostId: string
  live?: boolean
}) {
  const leader = Math.max(1, players[0]?.count ?? 0)
  return (
    <ol className="space-y-2" aria-label="Clasificación">
      {players.map((player) => (
        <LeaderboardRow
          key={player.uid}
          player={player}
          isMe={player.uid === meId}
          isHost={player.uid === hostId}
          share={player.count / leader}
          live={live}
        />
      ))}
    </ol>
  )
}

function LeaderboardRow({
  player,
  isMe,
  isHost,
  share,
  live,
}: {
  player: RankedPlayer
  isMe: boolean
  isHost: boolean
  share: number
  live: boolean
}) {
  // Destello cuando alguien suma, para que se note el movimiento en la mesa.
  const previous = useRef(player.count)
  const [flash, setFlash] = useState(0)
  useEffect(() => {
    if (live && player.count > previous.current) setFlash((value) => value + 1)
    previous.current = player.count
  }, [player.count, live])

  return (
    <li
      className={cx(
        "relative isolate flex items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2.5",
        isMe ? "border-accent/40 bg-accent-soft/60" : "border-line bg-surface",
      )}
    >
      {flash ? <span key={flash} aria-hidden className="absolute inset-0 -z-10 animate-flash" /> : null}
      <PositionBadge position={player.position} />
      <Avatar name={player.name} photoURL={player.photoURL} seed={player.uid} size={36} />
      <div className="relative min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold">
          <span className="truncate">{player.name}</span>
          {player.position === 1 && player.count > 0 ? <Crown className="size-4 shrink-0 text-gold" aria-label="Líder" /> : null}
          {isMe ? <span className="shrink-0 text-xs font-medium text-accent">tú</span> : null}
          {isHost ? <span className="shrink-0 text-xs font-medium text-muted">anfitrión</span> : null}
        </p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className={cx("h-full rounded-full transition-[width] duration-500", isMe ? "bg-accent" : "bg-ink/25")}
            style={{ width: `${Math.max(player.count ? 4 : 0, share * 100)}%` }}
          />
        </div>
      </div>
      <span className="relative w-12 text-right font-display text-2xl font-extrabold tabular" aria-label={`${player.count} piezas`}>
        {player.count}
      </span>
    </li>
  )
}

export function Podium({ entries, meId }: { entries: RankedPlayer[]; meId: string }) {
  const [first, second, third] = entries
  const columns = [
    { entry: second, height: "h-20", place: 2 },
    { entry: first, height: "h-28", place: 1 },
    { entry: third, height: "h-14", place: 3 },
  ]
  return (
    <div className="grid grid-cols-3 items-end gap-2" aria-label="Podio">
      {columns.map(({ entry, height, place }) =>
        entry ? (
          <div key={entry.uid} className="flex flex-col items-center text-center">
            {place === 1 ? <Crown className="mb-1 size-6 text-gold" aria-hidden /> : null}
            <Avatar
              name={entry.name}
              photoURL={entry.photoURL}
              seed={entry.uid}
              size={place === 1 ? 60 : 48}
              className={cx("ring-4", place === 1 ? "ring-gold" : "ring-surface")}
            />
            <p className="mt-2 w-full truncate text-sm font-semibold">
              {entry.name}
              {entry.uid === meId ? <span className="text-accent"> · tú</span> : null}
            </p>
            <p className="font-display text-xl font-extrabold tabular">{entry.count}</p>
            <div
              className={cx(
                "mt-2 grid w-full place-items-center rounded-t-2xl font-display text-lg font-extrabold",
                height,
                place === 1 ? "bg-gold text-white" : "bg-surface-2 text-muted",
              )}
            >
              {ordinal(entry.position)}
            </div>
          </div>
        ) : (
          <div key={place} />
        ),
      )}
    </div>
  )
}
