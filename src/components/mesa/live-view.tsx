"use client"

import { LogOut, Minus, Pencil, Plus, QrCode, Users, WifiOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useConnection } from "@/hooks/use-connection"
import { useNow } from "@/hooks/use-now"
import { useWakeLock } from "@/hooks/use-wake-lock"
import { formatCode } from "@/lib/code"
import { formatClock, ordinal } from "@/lib/format"
import { tableHref } from "@/lib/routes"
import { changeCount, finishSession, leaveSession, MAX_PIECES } from "@/lib/sessions"
import { piecesPerHour, rankPlayers, standingLine, sumPieces, type RankedPlayer } from "@/lib/stats"
import type { Player, Session } from "@/lib/types"
import { RankList } from "../rank-list"
import { useToast } from "../toast"
import { Button, cx, Skeleton, Tag } from "../ui"
import { IconButton, MesaHeader, whereLine } from "./header"
import { CloseSheet, EditSheet, InviteSheet, LeaveSheet } from "./sheets"

type SheetName = "invite" | "close" | "leave" | "edit" | null

export function LiveView({
  session,
  players,
  playersLoaded,
  uid,
}: {
  session: Session
  players: Player[]
  playersLoaded: boolean
  uid: string
}) {
  const router = useRouter()
  const params = useSearchParams()
  const toast = useToast()
  const now = useNow(1000)
  useWakeLock(true)

  const [sheet, setSheet] = useState<SheetName>(params.get("invitar") === "1" ? "invite" : null)
  const [busy, setBusy] = useState(false)
  const [bubbles, setBubbles] = useState<number[]>([])

  const ranked = useMemo(() => rankPlayers(players), [players])
  const me = ranked.find((player) => player.uid === uid)
  const loading = !playersLoaded || !me
  const isHost = session.hostId === uid
  const solo = ranked.length < 2
  const max = Math.max(0, ...ranked.map((player) => player.count))
  const pace = me && me.count > 0 ? piecesPerHour(me.count, me.joinedAt, now) : null

  const onSynced = useCallback(() => toast("Sincronizado", "success"), [toast])
  const { online, pending } = useConnection(onSynced)
  useOvertakeAlerts(ranked, uid)

  function closeSheet() {
    if (sheet === "invite" && params.get("invitar")) router.replace(tableHref(session.code), { scroll: false })
    setSheet(null)
  }

  function tap(delta: 1 | -1) {
    if (!me) return
    if (delta < 0 && me.count <= 0) return
    if (delta > 0 && me.count >= MAX_PIECES) return
    navigator.vibrate?.(12)
    if (delta > 0) {
      const id = Date.now() + Math.random()
      setBubbles((current) => [...current.slice(-3), id])
      window.setTimeout(() => setBubbles((current) => current.filter((bubble) => bubble !== id)), 700)
    }
    changeCount(uid, session.code, delta).catch(() =>
      toast("No se ha podido guardar el último toque. Vuelve a intentarlo.", "error"),
    )
  }

  async function finish() {
    setBusy(true)
    try {
      await finishSession(session.code, players)
      // La página detecta el cierre y lleva a todos al resultado.
    } catch {
      toast("No se ha podido cerrar la mesa. Inténtalo de nuevo.", "error")
      setBusy(false)
    }
  }

  async function leave() {
    setBusy(true)
    try {
      await leaveSession(uid, session.code)
      toast("Has salido de la mesa.")
      router.replace("/")
    } catch {
      toast("No se ha podido salir de la mesa.", "error")
      setBusy(false)
    }
  }

  const pieceButtons = (
    <PieceButtons
      count={me?.count ?? 0}
      disabled={loading}
      onPlus={() => tap(1)}
      onMinus={() => tap(-1)}
    />
  )

  return (
    <div className="min-h-dvh">
      <MesaHeader
        title={session.name}
        subtitle={whereLine(session) || `Mesa de ${session.hostName}`}
        actions={
          <>
            {isHost ? (
              <IconButton label="Editar mesa" onClick={() => setSheet("edit")}>
                <Pencil size={20} aria-hidden />
              </IconButton>
            ) : null}
            <Button kind="secondary" size="sm" icon={QrCode} className="w-[104px]" onClick={() => setSheet("invite")}>
              Invitar
            </Button>
          </>
        }
      />

      {!online ? (
        <div
          role="status"
          className="flex h-9 items-center gap-2 border-t border-line bg-sf px-5 text-[13px] leading-none font-medium text-ink-2 lg:px-8"
        >
          <WifiOff size={16} aria-hidden />
          <span className="flex-1">
            Sin conexión{pending ? ` · ${pending} ${pending === 1 ? "pieza" : "piezas"} por sincronizar` : ""}
          </span>
          <span className="size-2 rounded-full border-[1.5px] border-ink-3" aria-hidden />
        </div>
      ) : null}

      <div className="mx-auto pb-[calc(190px+env(safe-area-inset-bottom))] md:max-w-[640px] lg:grid lg:max-w-[1040px] lg:grid-cols-[repeat(auto-fit,minmax(420px,1fr))] lg:gap-x-16 lg:px-10 lg:pt-14 lg:pb-[72px]">
        <section aria-label="Tu contador" className="lg:flex lg:flex-col lg:items-stretch">
          <dl className="flex border-y border-line lg:border-x">
            <Kpi label="Tiempo" loading={false}>
              {formatClock(now.getTime() - (session.createdAt ?? now).getTime())}
            </Kpi>
            <Kpi label="Mesa" loading={loading}>
              {sumPieces(players)}
            </Kpi>
            <Kpi label="Comensales" loading={loading}>
              {players.length}
              <span className="font-medium text-ink-3">/{session.maxPlayers}</span>
            </Kpi>
          </dl>

          <div className="flex flex-col items-center px-5 pt-[18px] lg:pt-8">
            <div className="flex h-7 items-center gap-2.5">
              {!loading && !solo && max > 0 ? (
                <span
                  className={cx(
                    "inline-flex h-7 items-center rounded-[14px] border border-accent px-[11px] text-[15px] leading-none font-semibold text-accent-ink tabular-nums",
                    me.position === 1 && "bg-accent-soft",
                  )}
                >
                  {ordinal(me.position)}
                </span>
              ) : null}
              <span className="text-[15px] leading-5 font-medium text-ink-2">Tus piezas</span>
            </div>

            {loading ? (
              <>
                <Skeleton className="mt-3.5 h-[120px] w-[150px] rounded-[24px]" />
                <Skeleton className="mt-5 h-[18px] w-60 rounded-[9px]" />
                <Skeleton className="mt-2.5 h-3.5 w-40 rounded-[7px]" />
              </>
            ) : (
              <>
                <div className="relative mt-1">
                  <Counter value={me.count} />
                  {bubbles.map((id) => (
                    <span
                      key={id}
                      aria-hidden
                      className="pointer-events-none absolute top-1.5 -right-11 animate-float-up text-[32px] leading-none font-semibold text-accent-ink"
                    >
                      +1
                    </span>
                  ))}
                </div>
                <p aria-live="polite" className="mt-1.5 max-w-[320px] text-center text-body-lg font-medium text-balance text-ink">
                  {standingLine(ranked, uid)}
                </p>
                {pace ? (
                  <p className="mt-1.5 text-[14px] leading-5 text-ink-3">Ritmo: {Math.round(pace)} piezas/hora</p>
                ) : null}
              </>
            )}
          </div>

          <div className="mt-10 hidden lg:block">{pieceButtons}</div>
        </section>

        <section className="px-5 pt-[30px] lg:px-0 lg:pt-0">
          {loading || !solo ? (
            <>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-h3 text-ink lg:text-h2">Clasificación en directo</h2>
                <Tag kind="live">En directo</Tag>
              </div>
              {loading ? <RankSkeleton /> : <RankList entries={ranked} meId={uid} hostId={session.hostId} live />}
            </>
          ) : (
            <div className="flex items-start gap-4 rounded-[20px] border border-line p-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink-2">
                <Users size={24} aria-hidden />
              </span>
              <div>
                <p className="text-h3 text-ink">¿Comes acompañado?</p>
                <p className="mt-1 text-body text-pretty text-ink-2">
                  Comparte el código{" "}
                  <b className="font-semibold tracking-[0.06em] whitespace-nowrap text-ink">{formatCode(session.code)}</b> y
                  competid en directo.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-3 pt-7 lg:items-start">
            {isHost ? (
              <>
                <Button kind="secondary" size="lg" full className="lg:w-auto" onClick={() => setSheet("close")} disabled={loading}>
                  Cerrar la mesa y ver resultados
                </Button>
                <p className="text-center text-caption text-ink-3">Sólo tú, como anfitrión, puedes cerrar la mesa.</p>
              </>
            ) : (
              <Button kind="ghost" size="sm" icon={LogOut} onClick={() => setSheet("leave")} disabled={loading}>
                Salir de la mesa
              </Button>
            )}
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg lg:hidden">
        <div className="mx-auto px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] md:max-w-[560px]">{pieceButtons}</div>
      </div>

      <InviteSheet open={sheet === "invite"} onClose={closeSheet} session={session} />
      <CloseSheet
        open={sheet === "close"}
        onClose={closeSheet}
        onConfirm={finish}
        busy={busy}
        entries={ranked}
        meId={uid}
      />
      <LeaveSheet open={sheet === "leave"} onClose={closeSheet} onConfirm={leave} busy={busy} count={me?.count ?? 0} />
      {isHost ? <EditSheet open={sheet === "edit"} onClose={closeSheet} session={session} /> : null}
    </div>
  )
}

function Kpi({ label, loading, children }: { label: string; loading: boolean; children: React.ReactNode }) {
  return (
    <div className="-ml-px min-w-0 flex-1 border-l border-line py-3 pl-5 first:ml-0 first:border-l-0 lg:first:border-l-0">
      <dt className="text-[12px] leading-4 font-medium text-ink-3">{label}</dt>
      <dd>
        {loading ? (
          <Skeleton className="mt-1 h-[22px] w-14 rounded-md" />
        ) : (
          <span className="text-[22px] leading-7 font-semibold tracking-[-0.01em] text-ink tabular-nums">{children}</span>
        )}
      </dd>
    </div>
  )
}

/** El número grande: hace "pop" cada vez que cambia, pero no al aparecer. */
function Counter({ value }: { value: number }) {
  const first = useRef(true)
  const [bump, setBump] = useState(0)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setBump((n) => n + 1)
  }, [value])
  return (
    <output
      key={bump}
      className={cx(
        "block text-hero text-ink tabular-nums lg:text-[160px] lg:leading-[160px]",
        bump > 0 && "animate-pop",
      )}
    >
      {value}
    </output>
  )
}

function PieceButtons({
  count,
  disabled,
  onPlus,
  onMinus,
}: {
  count: number
  disabled: boolean
  onPlus: () => void
  onMinus: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onMinus}
        disabled={disabled || count <= 0}
        aria-label="Quitar una pieza"
        className="flex size-16 shrink-0 items-center justify-center rounded-[20px] border border-line-strong text-ink transition-transform duration-[90ms] select-none active:scale-[0.98] disabled:border-line disabled:text-ink-3"
      >
        <Minus size={28} strokeWidth={2} aria-hidden />
      </button>
      <button
        type="button"
        onClick={onPlus}
        disabled={disabled || count >= MAX_PIECES}
        aria-label="Sumar una pieza"
        className="flex h-[88px] flex-1 items-center justify-center gap-2.5 rounded-hero bg-accent text-[28px] leading-none font-semibold tracking-[-0.01em] text-accent-on transition-[transform,filter] duration-[90ms] select-none hover:brightness-108 active:scale-[0.98] active:brightness-90 disabled:bg-sf disabled:text-ink-3"
      >
        <Plus size={36} strokeWidth={2.25} aria-hidden />
        <span>Una pieza</span>
      </button>
    </div>
  )
}

function RankSkeleton() {
  return (
    <div aria-hidden>
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex h-[72px] items-center gap-3 border-b border-line">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2.5">
            <Skeleton className="h-3.5 w-[45%] rounded-[7px]" />
            <Skeleton className="h-1 rounded-sm" />
          </div>
          <Skeleton className="h-[26px] w-9 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

/** Avisa cuando alguien te adelanta o cuando tomas la cabeza. */
function useOvertakeAlerts(ranked: RankedPlayer[], uid: string) {
  const toast = useToast()
  const previous = useRef<number | null>(null)
  const me = ranked.find((player) => player.uid === uid)
  const position = me?.position ?? null
  const contested = ranked.length > 1

  useEffect(() => {
    const before = previous.current
    previous.current = position
    if (!contested || before === null || position === null || !me) return
    if (position > before) {
      const passer = ranked.filter((player) => player.count > me.count).at(-1)
      if (passer) toast(`¡${passer.name} te ha adelantado!`)
    } else if (position === 1 && before > 1 && me.count > 0) {
      toast("¡Te pones en cabeza!", "success")
    }
    // Sólo reaccionamos a cambios de posición, no a cada pieza.
  }, [position])
}
