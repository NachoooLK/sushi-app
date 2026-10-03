"use client"

import { Repeat, Share2, Sparkles } from "lucide-react"
import Link from "next/link"
import { useMemo, useState, type FormEvent } from "react"
import { decimal, formatDay, formatDuration, formatTime, pieces } from "@/lib/format"
import { rateSession } from "@/lib/sessions"
import { personalStats, rankPlayers, type RankedPlayer } from "@/lib/stats"
import type { Player, Session } from "@/lib/types"
import { useMySessions } from "../providers"
import { useToast } from "../toast"
import { Avatar, Button, Card, cx, StatTile } from "../ui"
import { IconButton, Leaderboard, Podium, SessionHeader } from "./parts"

export function ResultsView({ session, players, uid }: { session: Session; players: Player[]; uid: string }) {
  const toast = useToast()
  const { sessions } = useMySessions()

  // La clasificación final es la foto que guardó el anfitrión al cerrar.
  const ranked: RankedPlayer[] = useMemo(
    () =>
      (session.results ?? []).map((entry, _index, all) => ({
        ...entry,
        joinedAt: null,
        updatedAt: null,
        position: 1 + all.filter((other) => other.count > entry.count).length,
      })),
    [session.results],
  )
  const me = ranked.find((entry) => entry.uid === uid)
  const wasThere = Boolean(me)
  const solo = ranked.length === 1
  const duration =
    session.finishedAt && session.createdAt ? session.finishedAt.getTime() - session.createdAt.getTime() : null

  const previousBest = useMemo(
    () => personalStats(sessions.filter((other) => other.code !== session.code), uid).best,
    [sessions, session.code, uid],
  )
  const newRecord = me ? me.count > 0 && me.count > previousBest : false
  const won = session.winnerIds.includes(uid)

  async function share() {
    const medals = ["🥇", "🥈", "🥉"]
    const lines = ranked.map((entry) => `${medals[entry.position - 1] ?? `${entry.position}.`} ${entry.name}: ${entry.count}`)
    const text = [`🍣 ${session.name}`, ...lines, `Total de la mesa: ${pieces(session.totalPieces)}`].join("\n")
    try {
      if (navigator.share) {
        await navigator.share({ title: "Sushi Rush", text, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`)
        toast("Resultado copiado al portapapeles.", "success")
      }
    } catch {
      // Compartir cancelado.
    }
  }

  const where = [session.restaurant, session.location].filter(Boolean).join(" · ")
  const repeatHref = `/nueva?${new URLSearchParams({
    ...(session.restaurant ? { restaurante: session.restaurant } : {}),
    ...(session.location ? { zona: session.location } : {}),
  })}`

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-12">
      <SessionHeader
        title={session.name}
        subtitle={[where, formatDay(session.finishedAt)].filter(Boolean).join(" · ")}
        actions={
          <IconButton label="Compartir resultado" onClick={share}>
            <Share2 className="size-5" />
          </IconButton>
        }
      />

      <div className="space-y-6 px-4">
        <Card className="overflow-hidden">
          <div
            className={cx(
              "px-5 pb-6 pt-5 text-center",
              won || newRecord ? "bg-gold-soft" : "bg-surface",
            )}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Mesa cerrada</p>
            <h2 className="mt-1 text-balance font-display text-2xl font-extrabold tracking-tight">
              {headline(session, ranked, me)}
            </h2>
            {newRecord ? (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-sm font-semibold text-gold">
                <Sparkles className="size-4" /> Nuevo récord personal
              </p>
            ) : null}
            {!solo ? (
              <div className="mt-6">
                <Podium entries={ranked.slice(0, 3)} meId={uid} />
              </div>
            ) : null}
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-2">
          <StatTile label="Mesa" value={session.totalPieces} hint="piezas" tone="accent" />
          <StatTile label="Media" value={decimal(session.totalPieces / Math.max(1, ranked.length))} hint="por persona" />
          <StatTile
            label="Duración"
            value={duration ? formatDuration(duration) : "—"}
            hint={session.createdAt ? `desde ${formatTime(session.createdAt)}` : undefined}
          />
        </div>

        {ranked.length > 3 ? (
          <section>
            <h3 className="mb-3 font-display text-lg font-bold tracking-tight">Clasificación completa</h3>
            <Leaderboard players={ranked} meId={uid} hostId={session.hostId} />
          </section>
        ) : null}

        <Ratings session={session} players={players} uid={uid} canRate={wasThere} />

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={repeatHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-line bg-surface text-[15px] font-semibold hover:bg-surface-2"
          >
            <Repeat className="size-4" /> Repetir sitio
          </Link>
          <Button onClick={share}>
            <Share2 className="size-4" /> Compartir
          </Button>
        </div>
      </div>
    </div>
  )
}

function headline(session: Session, ranked: RankedPlayer[], me: RankedPlayer | undefined) {
  const winners = ranked.filter((entry) => session.winnerIds.includes(entry.uid))
  if (me && ranked.length === 1) return `Te has comido ${pieces(me.count)}`
  if (!winners.length) return "Empate a cero. ¿Seguro que habéis cenado?"
  if (me && winners.some((winner) => winner.uid === me.uid)) {
    return winners.length > 1 ? `¡Empate en cabeza con ${pieces(me.count)}!` : "¡Has ganado!"
  }
  if (me) return `Quedaste ${me.position}.º con ${pieces(me.count)}`
  return `Ganó ${winners.map((winner) => winner.name).join(" y ")} con ${pieces(winners[0].count)}`
}

function Ratings({
  session,
  players,
  uid,
  canRate,
}: {
  session: Session
  players: Player[]
  uid: string
  canRate: boolean
}) {
  const toast = useToast()
  const mine = players.find((player) => player.uid === uid)
  // Los jugadores llegan después que la mesa: hasta que toques algo, mandan los datos guardados.
  const [draftRating, setRating] = useState<number | null>(null)
  const [draftComment, setComment] = useState<string | null>(null)
  const [editingChoice, setEditing] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const rating = draftRating ?? mine?.rating ?? 0
  const comment = draftComment ?? mine?.comment ?? ""
  const editing = editingChoice ?? !mine?.rating

  const rated = players.filter((player) => player.rating)
  const average = rated.length ? rated.reduce((total, player) => total + (player.rating ?? 0), 0) / rated.length : null

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!rating) return
    setBusy(true)
    try {
      await rateSession(uid, session.code, rating, comment)
      setEditing(false)
      toast("¡Gracias por tu valoración!", "success")
    } catch {
      toast("No se ha podido guardar la valoración.", "error")
    } finally {
      setBusy(false)
    }
  }

  if (!canRate && !rated.length) return null

  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold tracking-tight">
          {session.restaurant ? `¿Qué tal ${session.restaurant}?` : "¿Qué tal el sitio?"}
        </h3>
        {average ? (
          <span className="shrink-0 text-sm font-semibold">
            {decimal(average)} / 5 <span className="font-normal text-muted">({rated.length})</span>
          </span>
        ) : null}
      </div>

      {canRate && editing ? (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <SushiRating value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={280}
            rows={2}
            placeholder="Lo mejor, lo peor, si repetiríais…"
            className="w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-[15px] outline-none placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/15"
          />
          <Button type="submit" block disabled={!rating} loading={busy}>
            Guardar valoración
          </Button>
        </form>
      ) : canRate ? (
        <button type="button" onClick={() => setEditing(true)} className="mt-1 text-sm font-semibold text-accent">
          Cambiar mi valoración
        </button>
      ) : null}

      {rated.length ? (
        <ul className="mt-4 space-y-3">
          {rated.map((player) => (
            <li key={player.uid} className="flex gap-3">
              <Avatar name={player.name} photoURL={player.photoURL} seed={player.uid} size={32} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center justify-between gap-2 text-sm font-semibold">
                  <span className="truncate">{player.name}</span>
                  <span className="shrink-0" aria-label={`${player.rating} de 5`}>
                    {"🍣".repeat(player.rating ?? 0)}
                  </span>
                </p>
                {player.comment ? <p className="mt-0.5 text-sm text-muted">{player.comment}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  )
}

const RATING_LABELS = ["", "Flojo", "Mejorable", "Bien", "Muy bueno", "Espectacular"]

function SushiRating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <div role="radiogroup" aria-label="Valoración del restaurante" className="flex justify-between gap-1">
        {[1, 2, 3, 4, 5].map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={value === option}
            aria-label={`${option}: ${RATING_LABELS[option]}`}
            onClick={() => onChange(option)}
            className={cx(
              "grid h-12 flex-1 place-items-center rounded-2xl text-2xl transition active:scale-95",
              option <= value ? "bg-accent-soft" : "bg-surface-2 grayscale opacity-50",
            )}
          >
            🍣
          </button>
        ))}
      </div>
      <p className="mt-1.5 h-5 text-center text-sm font-medium text-muted">{RATING_LABELS[value]}</p>
    </div>
  )
}
