"use client"

import { Crown } from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Avatar, cx, PositionMark, Tag } from "./ui"

export interface RankEntry {
  uid: string
  name: string
  photoURL: string | null
  count: number
  position: number
}

/**
 * Clasificación de una mesa (directo, invitación, resultado y modal de cierre).
 * Con 7 o más comensales pasa a la variante densa. Los adelantamientos se animan con FLIP.
 */
export function RankList({
  entries,
  meId,
  hostId,
  live = false,
  dense,
  crowns = true,
  className,
}: {
  entries: RankEntry[]
  meId?: string
  hostId?: string
  live?: boolean
  dense?: boolean
  /** La clasificación final no lleva corona: el podio ya marca al ganador. */
  crowns?: boolean
  className?: string
}) {
  const compact = dense ?? entries.length >= 7
  const max = Math.max(0, ...entries.map((entry) => entry.count))
  const contested = entries.length > 1 && max > 0
  const listRef = useRef<HTMLOListElement>(null)
  const tops = useRef(new Map<string, number>())

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const next = new Map<string, number>()
    for (const item of list.querySelectorAll<HTMLElement>("[data-uid]")) {
      const uid = item.dataset.uid!
      const top = item.offsetTop
      next.set(uid, top)
      const before = tops.current.get(uid)
      if (live && !reduce && before !== undefined && before !== top) {
        item.animate([{ transform: `translateY(${before - top}px)` }, { transform: "translateY(0)" }], {
          duration: 240,
          easing: "cubic-bezier(.4,0,.2,1)",
        })
      }
    }
    tops.current = next
  })

  return (
    <ol ref={listRef} className={cx("flex flex-col", className)}>
      {entries.map((entry) => (
        <RankRow
          key={entry.uid}
          entry={entry}
          dense={compact}
          me={entry.uid === meId}
          host={entry.uid === hostId}
          crown={crowns && contested && entry.count === max}
          blank={!contested && max === 0 && entries.length > 1}
          share={max ? entry.count / max : 0}
          live={live}
        />
      ))}
    </ol>
  )
}

function RankRow({
  entry,
  dense,
  me,
  host,
  crown,
  blank,
  share,
  live,
}: {
  entry: RankEntry
  dense: boolean
  me: boolean
  host: boolean
  crown: boolean
  blank: boolean
  share: number
  live: boolean
}) {
  const flashing = useFlash(entry.count, live)
  const highlighted = me || flashing

  return (
    <li
      data-uid={entry.uid}
      className={cx(
        "relative -mx-3 flex items-center px-3",
        dense ? "min-h-[60px] gap-2.5" : "min-h-[72px] gap-3",
        highlighted ? "rounded-btn border-b border-transparent" : "border-b border-line",
        me ? "bg-accent-soft" : flashing && "animate-flash",
      )}
    >
      <PositionMark position={entry.position} size={dense ? 26 : 28} blank={blank} />
      <Avatar name={entry.name} photoURL={entry.photoURL} seed={entry.uid} size={dense ? 32 : 40} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={cx("truncate font-semibold text-ink", dense ? "text-[15px] leading-[22px]" : "text-base leading-[22px]")}>
            {entry.name}
          </span>
          {me ? <Tag kind="you">tú</Tag> : null}
          {host ? <Tag kind="host">anfitrión</Tag> : null}
          {crown ? <Crown size={16} className="shrink-0 text-gold" aria-label="Líder" /> : null}
        </div>
        <div className="h-1 overflow-hidden rounded-sm bg-line" aria-hidden>
          <div
            className={cx("h-full rounded-sm transition-[width] duration-300", highlighted ? "bg-accent" : "bg-ink-3")}
            style={{ width: `${Math.min(100, Math.max(0, share * 100))}%` }}
          />
        </div>
      </div>
      <div className="flex min-w-11 shrink-0 items-baseline justify-end gap-1.5">
        {flashing ? <span className="text-[13px] leading-none font-semibold text-accent-ink">+1</span> : null}
        <span
          key={flashing ? `f${entry.count}` : entry.count}
          className={cx(
            "font-semibold tracking-[-0.02em] text-ink tabular-nums",
            dense ? "text-[22px] leading-8" : "text-[28px] leading-8",
            flashing && "animate-flash-ink",
          )}
          aria-label={`${entry.count} ${entry.count === 1 ? "pieza" : "piezas"}`}
        >
          {entry.count}
        </span>
      </div>
    </li>
  )
}

/** True durante 900 ms cada vez que la cifra sube en directo. */
function useFlash(count: number, live: boolean) {
  const previous = useRef(count)
  const [flashing, setFlashing] = useState(false)
  useEffect(() => {
    const rose = live && count > previous.current
    previous.current = count
    if (!rose) return
    setFlashing(true)
    const id = window.setTimeout(() => setFlashing(false), 900)
    return () => window.clearTimeout(id)
  }, [count, live])
  return flashing
}
