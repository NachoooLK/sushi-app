"use client"

import { Clock, LogOut, Minus, Pencil, Plus, Users, UserPlus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { useNow } from "@/hooks/use-now"
import { useWakeLock } from "@/hooks/use-wake-lock"
import { formatClock, pieces } from "@/lib/format"
import {
  changeCount,
  finishSession,
  leaveSession,
  MAX_PIECES,
  updateSessionDetails,
} from "@/lib/sessions"
import { piecesPerHour, rankPlayers, standingLine, sumPieces } from "@/lib/stats"
import type { Player, Session } from "@/lib/types"
import { useToast } from "../toast"
import { Button, Dialog, Field, Spinner } from "../ui"
import { InviteDialog } from "./invite-dialog"
import { IconButton, Leaderboard, PositionBadge, SessionHeader } from "./parts"

export function LiveView({ session, players, uid }: { session: Session; players: Player[]; uid: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const toast = useToast()
  const now = useNow(1000)
  useWakeLock(true)

  const [inviteOpen, setInviteOpen] = useState(params.get("invitar") === "1")
  const [dialog, setDialog] = useState<"finish" | "leave" | "edit" | null>(null)
  const [busy, setBusy] = useState(false)
  const [bubbles, setBubbles] = useState<number[]>([])

  const ranked = useMemo(() => rankPlayers(players), [players])
  const me = ranked.find((player) => player.uid === uid)
  const isHost = session.hostId === uid
  const tableTotal = sumPieces(players)
  const pace = me ? piecesPerHour(me.count, me.joinedAt, now) : null

  useOvertakeAlerts(ranked, uid)

  function closeInvite() {
    setInviteOpen(false)
    if (params.get("invitar")) router.replace(`/s/${session.code}`, { scroll: false })
  }

  function tap(delta: 1 | -1) {
    if (!me) return
    if (delta < 0 && me.count <= 0) return
    if (delta > 0 && me.count >= MAX_PIECES) return
    navigator.vibrate?.(delta > 0 ? 12 : [6, 40, 6])
    if (delta > 0) {
      const id = Date.now() + Math.random()
      setBubbles((current) => [...current.slice(-4), id])
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
      setDialog(null)
    } catch {
      toast("No se ha podido cerrar la mesa. Inténtalo de nuevo.", "error")
    } finally {
      setBusy(false)
    }
  }

  async function leave() {
    setBusy(true)
    try {
      await leaveSession(uid, session.code)
      router.replace("/")
      toast("Has salido de la mesa.")
    } catch {
      toast("No se ha podido salir de la mesa.", "error")
      setBusy(false)
    }
  }

  if (!me) {
    return (
      <div className="grid min-h-dvh place-items-center text-muted">
        <Spinner className="size-6" />
      </div>
    )
  }

  const subtitle = [session.restaurant, session.location].filter(Boolean).join(" · ") || `Mesa de ${session.hostName}`

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-[calc(7.5rem+env(safe-area-inset-bottom))]">
      <SessionHeader
        title={session.name}
        subtitle={subtitle}
        actions={
          <>
            {isHost ? (
              <IconButton label="Editar mesa" onClick={() => setDialog("edit")}>
                <Pencil className="size-[18px]" />
              </IconButton>
            ) : null}
            <Button size="sm" variant="secondary" onClick={() => setInviteOpen(true)}>
              <UserPlus className="size-4" /> Invitar
            </Button>
          </>
        }
      />

      <div className="px-4">
        <dl className="mt-1 grid grid-cols-3 gap-2 text-center text-xs text-muted">
          <div className="rounded-2xl bg-surface-2 px-2 py-2">
            <dt className="flex items-center justify-center gap-1">
              <Clock className="size-3.5" /> Tiempo
            </dt>
            <dd className="mt-0.5 font-display text-base font-bold text-ink tabular">
              {formatClock(now.getTime() - (session.createdAt ?? now).getTime())}
            </dd>
          </div>
          <div className="rounded-2xl bg-surface-2 px-2 py-2">
            <dt>Mesa</dt>
            <dd className="mt-0.5 font-display text-base font-bold text-ink tabular">{pieces(tableTotal)}</dd>
          </div>
          <div className="rounded-2xl bg-surface-2 px-2 py-2">
            <dt className="flex items-center justify-center gap-1">
              <Users className="size-3.5" /> Comensales
            </dt>
            <dd className="mt-0.5 font-display text-base font-bold text-ink tabular">
              {players.length}/{session.maxPlayers}
            </dd>
          </div>
        </dl>

        <section aria-label="Tu contador" className="relative mt-4 rounded-[2rem] border border-line bg-surface px-5 pb-6 pt-5 text-center shadow-card">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted">
            {ranked.length > 1 ? <PositionBadge position={me.position} /> : null}
            Tus piezas
          </div>
          <div className="relative mx-auto mt-1 w-fit">
            <output
              key={me.count}
              aria-live="polite"
              className="block animate-pop font-display text-[7.5rem] font-extrabold leading-none tracking-tighter tabular"
            >
              {me.count}
            </output>
            {bubbles.map((id) => (
              <span
                key={id}
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-2 animate-float-up font-display text-2xl font-extrabold text-accent"
              >
                +1
              </span>
            ))}
          </div>
          <p className="mt-2 min-h-5 text-balance text-sm font-medium">{standingLine(ranked, uid)}</p>
          {pace ? <p className="mt-1 text-xs text-muted">Ritmo: {Math.round(pace)} piezas/hora</p> : null}
        </section>

        {ranked.length > 1 ? (
          <section className="mt-6">
            <h2 className="mb-3 font-display text-lg font-bold tracking-tight">Clasificación en directo</h2>
            <Leaderboard players={ranked} meId={uid} hostId={session.hostId} live />
          </section>
        ) : (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="mt-6 flex w-full items-center gap-3 rounded-3xl border border-dashed border-line p-4 text-left hover:bg-surface"
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-accent">
              <UserPlus className="size-5" />
            </span>
            <span>
              <span className="block font-semibold">¿Comes acompañado?</span>
              <span className="block text-sm text-muted">Comparte el código {session.code} y competid en directo.</span>
            </span>
          </button>
        )}

        <div className="mt-8 flex flex-col items-center gap-2">
          {isHost ? (
            <Button variant="danger" block onClick={() => setDialog("finish")}>
              Cerrar la mesa y ver resultados
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setDialog("leave")}>
              <LogOut className="size-4" /> Salir de la mesa
            </Button>
          )}
          {isHost ? (
            <p className="text-center text-xs text-muted">Sólo tú, como anfitrión, puedes cerrar la mesa.</p>
          ) : null}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-md gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={() => tap(-1)}
            disabled={me.count === 0}
            aria-label="Quitar una pieza"
            className="grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center rounded-3xl border border-line bg-surface text-ink transition active:scale-95 disabled:opacity-40"
          >
            <Minus className="size-7" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => tap(1)}
            disabled={me.count >= MAX_PIECES}
            className="flex h-[4.5rem] flex-1 items-center justify-center gap-2 rounded-3xl bg-accent font-display text-2xl font-extrabold text-accent-ink shadow-card transition hover:bg-accent-strong active:scale-[0.97]"
          >
            <Plus className="size-8" strokeWidth={3} /> Una pieza
          </button>
        </div>
      </div>

      <InviteDialog open={inviteOpen} onClose={closeInvite} code={session.code} sessionName={session.name} />

      <Dialog open={dialog === "finish"} onClose={() => setDialog(null)} title="¿Cerrar la mesa?">
        <p className="text-sm text-muted">
          Se guardará el resultado y nadie podrá sumar más piezas.
          {ranked.length < 2 ? " Al comer solo, cuenta para tus récords pero no como victoria." : null}
        </p>
        <ol className="mt-4 space-y-1.5">
          {ranked.slice(0, 5).map((player) => (
            <li key={player.uid} className="flex items-center gap-2 text-sm">
              <PositionBadge position={player.position} />
              <span className="flex-1 truncate font-medium">{player.name}</span>
              <span className="font-display font-bold tabular">{player.count}</span>
            </li>
          ))}
        </ol>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setDialog(null)}>
            Seguir comiendo
          </Button>
          <Button onClick={finish} loading={busy}>
            Cerrar mesa
          </Button>
        </div>
      </Dialog>

      <Dialog open={dialog === "leave"} onClose={() => setDialog(null)} title="¿Salir de la mesa?">
        <p className="text-sm text-muted">
          Tus {pieces(me.count)} de esta mesa se perderán y no contarán en el resultado.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setDialog(null)}>
            Quedarme
          </Button>
          <Button variant="danger" onClick={leave} loading={busy}>
            Salir
          </Button>
        </div>
      </Dialog>

      {isHost ? (
        <EditDialog open={dialog === "edit"} onClose={() => setDialog(null)} session={session} />
      ) : null}
    </div>
  )
}

function EditDialog({ open, onClose, session }: { open: boolean; onClose: () => void; session: Session }) {
  const toast = useToast()
  const [name, setName] = useState(session.name)
  const [restaurant, setRestaurant] = useState(session.restaurant ?? "")
  const [location, setLocation] = useState(session.location ?? "")
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      await updateSessionDetails(session.code, { name, restaurant, location })
      onClose()
    } catch {
      toast("No se han podido guardar los cambios.", "error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Editar mesa">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre de la mesa" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} required />
        <Field label="Restaurante" value={restaurant} onChange={(event) => setRestaurant(event.target.value)} maxLength={80} />
        <Field label="Zona o ciudad" value={location} onChange={(event) => setLocation(event.target.value)} maxLength={80} />
        <Button type="submit" block loading={busy}>
          Guardar
        </Button>
      </form>
    </Dialog>
  )
}

/** Avisa cuando alguien te adelanta o cuando tomas la cabeza. */
function useOvertakeAlerts(ranked: ReturnType<typeof rankPlayers>, uid: string) {
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
