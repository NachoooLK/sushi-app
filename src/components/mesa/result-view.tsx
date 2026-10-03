"use client"

import { CircleCheckBig, RefreshCw, Share, Star } from "lucide-react"
import { useMemo, useState, type FormEvent } from "react"
import { decimal, formatDay, formatDuration, formatTime, pieces } from "@/lib/format"
import { newTableHref } from "@/lib/routes"
import { rateSession } from "@/lib/sessions"
import { personalStats } from "@/lib/stats"
import type { Player, Session } from "@/lib/types"
import { useMySessions } from "../providers"
import { RankList, type RankEntry } from "../rank-list"
import { useToast } from "../toast"
import { Avatar, Button, ButtonLink, cx, Medal, Tag, TextArea } from "../ui"
import { IconButton, MesaHeader, whereLine } from "./header"

const RATING_LABELS = ["Flojo", "Mejorable", "Bien", "Muy bueno", "Espectacular"]

export function ResultView({ session, players, uid }: { session: Session; players: Player[]; uid: string }) {
  const toast = useToast()
  const { sessions } = useMySessions()

  // La clasificación final es la foto que guardó el anfitrión al cerrar.
  const ranked: RankEntry[] = useMemo(
    () =>
      (session.results ?? []).map((entry, _index, all) => ({
        ...entry,
        position: 1 + all.filter((other) => other.count > entry.count).length,
      })),
    [session.results],
  )
  const me = ranked.find((entry) => entry.uid === uid)
  const solo = ranked.length === 1
  const allZero = ranked.every((entry) => entry.count === 0)
  const podium = ranked.length > 1 && !allZero
  const showList = !solo && (!podium || ranked.length > 3)
  const duration =
    session.finishedAt && session.createdAt ? session.finishedAt.getTime() - session.createdAt.getTime() : null

  const previousBest = useMemo(
    () => personalStats(sessions.filter((other) => other.code !== session.code), uid).best,
    [sessions, session.code, uid],
  )
  const newRecord = Boolean(me && me.count > 0 && me.count > previousBest)

  async function share() {
    const lines = ranked.map((entry) => `${entry.position}. ${entry.name}: ${entry.count}`)
    const text = [session.name, ...lines, `Mesa: ${pieces(session.totalPieces)}`].join("\n")
    const url = window.location.href
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: `Sushi Rush · ${session.name}`, text, url })
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        toast("Resultado copiado al portapapeles.", "success")
      }
    } catch {
      // Compartir cancelado.
    }
  }

  const subtitle = [whereLine(session), formatDay(session.finishedAt)].filter(Boolean).join(" · ")

  return (
    <div className="min-h-dvh">
      <MesaHeader
        title={session.name}
        subtitle={subtitle}
        actions={
          <>
            <span className="lg:hidden">
              <IconButton label="Compartir" onClick={share}>
                <Share size={22} className="text-ink" aria-hidden />
              </IconButton>
            </span>
            <span className="hidden lg:block">
              <Button kind="secondary" size="sm" icon={Share} onClick={share}>
                Compartir
              </Button>
            </span>
          </>
        }
      />

      <div className="mx-auto md:max-w-[640px] lg:grid lg:max-w-[1040px] lg:grid-cols-[repeat(auto-fit,minmax(420px,1fr))] lg:gap-x-16 lg:px-10 lg:pt-12 lg:pb-[72px]">
        <div>
          <section className="flex flex-col items-start gap-3 px-6 pt-[22px] lg:px-0 lg:pt-0">
            <p className="flex items-center gap-2 text-[14px] leading-5 font-semibold text-ink-2">
              <CircleCheckBig size={18} aria-hidden />
              Mesa cerrada
            </p>
            <h2 className="text-headline text-balance text-ink lg:text-[48px] lg:leading-[52px]">
              {headline(session, ranked, me)}
            </h2>
            {newRecord ? (
              <Tag kind="record" big>
                Nuevo récord personal
              </Tag>
            ) : null}
          </section>

          {podium ? <Podium entries={ranked} meId={uid} /> : null}

          <dl className="mx-6 mt-8 grid grid-cols-[1fr_1fr_1.5fr] gap-px overflow-hidden rounded-card border border-line bg-line lg:mx-0">
            <ResultStat label="Mesa" sub="piezas">
              {session.totalPieces}
            </ResultStat>
            <ResultStat label="Media" sub="por persona">
              {Math.round(session.totalPieces / Math.max(1, ranked.length))}
            </ResultStat>
            <ResultStat
              label="Duración"
              sub={session.createdAt ? `desde ${formatTime(session.createdAt)}` : undefined}
              small
            >
              {duration !== null ? formatDuration(duration) : "—"}
            </ResultStat>
          </dl>

          <div className="mt-9 hidden gap-3 lg:flex">
            <Actions session={session} onShare={share} />
          </div>
        </div>

        <div>
          {showList || ranked.length > 1 ? (
            <section className={cx("px-6 pt-9 lg:px-0 lg:pt-0", !showList && "lg:block hidden")}>
              <h3 className="mb-1.5 text-[20px] leading-[26px] font-semibold tracking-[-0.01em] text-ink lg:text-h2">
                Clasificación completa
              </h3>
              <div className="px-3">
                <RankList entries={ranked} meId={uid} dense={false} crowns={false} />
              </div>
            </section>
          ) : null}

          <Ratings session={session} players={players} uid={uid} canRate={Boolean(me)} />
        </div>

        <div className="flex flex-col gap-3 px-6 pt-9 pb-[max(44px,env(safe-area-inset-bottom))] lg:hidden">
          <Actions session={session} onShare={share} />
        </div>
      </div>
    </div>
  )
}

function Actions({ session, onShare }: { session: Session; onShare: () => void }) {
  return (
    <>
      <ButtonLink
        href={newTableHref({ restaurant: session.restaurant, location: session.location })}
        size="lg"
        full
        icon={RefreshCw}
        className="lg:flex-1"
      >
        Repetir sitio
      </ButtonLink>
      <Button kind="secondary" size="lg" full icon={Share} className="lg:flex-1" onClick={onShare}>
        Compartir
      </Button>
    </>
  )
}

function headline(session: Session, ranked: RankEntry[], me: RankEntry | undefined) {
  if (me && ranked.length === 1) return `Te has comido ${pieces(me.count)}`
  const winners = ranked.filter((entry) => session.winnerIds.includes(entry.uid))
  if (!winners.length) return "Empate a cero. ¿Seguro que habéis cenado?"
  const tie = winners.length > 1
  if (me && winners.some((winner) => winner.uid === me.uid)) {
    return tie ? `¡Empate en cabeza con ${pieces(me.count)}!` : "¡Has ganado!"
  }
  if (me) return `Quedaste ${me.position}.º con ${pieces(me.count)}`
  return tie ? `Empate en cabeza con ${pieces(winners[0].count)}` : `Ganó ${winners[0].name} con ${pieces(winners[0].count)}`
}

const STEP_HEIGHTS: Record<number, string> = { 1: "h-[116px]", 2: "h-[84px]", 3: "h-[60px]" }

function Podium({ entries, meId }: { entries: RankEntry[]; meId: string }) {
  const top = entries.slice(0, 3)
  // Orden visual 2.º · 1.º · 3.º; con dos personas, 2.º · 1.º.
  const columns = top.length === 3 ? [top[1], top[0], top[2]] : [top[1], top[0]]
  return (
    <ol className="flex items-end justify-center gap-2.5 px-6 pt-9 lg:px-0 lg:pt-12" aria-label="Podio">
      {columns.map((entry) => (
        <li key={entry.uid} className="flex w-[104px] flex-col items-center">
          <Avatar name={entry.name} photoURL={entry.photoURL} seed={entry.uid} size={entry.position === 1 ? 56 : 48} />
          <p className="mt-2 max-w-[104px] truncate text-[15px] leading-5 font-semibold text-ink">{entry.name}</p>
          <div className="flex h-5 items-center">{entry.uid === meId ? <Tag kind="you">tú</Tag> : null}</div>
          <p className="text-[30px] leading-9 font-semibold tracking-[-0.03em] text-ink tabular-nums">{entry.count}</p>
          <div
            className={cx(
              "mt-2.5 flex w-full justify-center rounded-t-btn pt-3",
              STEP_HEIGHTS[entry.position] ?? "h-[60px]",
              entry.position === 1 ? "bg-ink" : "border border-b-0 border-line bg-sf",
            )}
          >
            <Medal position={entry.position} size={30} />
          </div>
        </li>
      ))}
    </ol>
  )
}

function ResultStat({ label, sub, small, children }: { label: string; sub?: string; small?: boolean; children: React.ReactNode }) {
  return (
    <div className="min-w-0 bg-bg px-3.5 py-3.5 min-[380px]:px-4">
      <dt className="text-caption font-medium text-ink-2">{label}</dt>
      <dd
        className={cx(
          "leading-9 font-semibold tracking-[-0.02em] whitespace-nowrap text-ink tabular-nums",
          small ? "text-[24px]" : "text-[28px]",
        )}
      >
        {children}
      </dd>
      {sub ? <dd className="text-[12px] leading-4 whitespace-nowrap text-ink-3">{sub}</dd> : null}
    </div>
  )
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="flex gap-0.5 text-gold" role="img" aria-label={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={n <= value ? "currentColor" : "none"} className={n <= value ? "" : "text-ink-3"} aria-hidden />
      ))}
    </span>
  )
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
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const rating = draftRating ?? mine?.rating ?? 0
  const comment = draftComment ?? mine?.comment ?? ""
  const showForm = canRate && (editing || !mine?.rating)

  const rated = players.filter((player) => player.rating)
  const others = rated.filter((player) => player.uid !== uid)
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

  return (
    <section className="flex flex-col gap-3.5 px-6 pt-10 lg:px-0">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-h2 text-ink">{session.restaurant ? `¿Qué tal ${session.restaurant}?` : "¿Qué tal el sitio?"}</h3>
        {average !== null ? (
          <span className="text-[15px] leading-5 font-medium whitespace-nowrap text-ink-2 tabular-nums">
            {decimal(average)} / 5 ({rated.length})
          </span>
        ) : null}
      </div>

      {showForm ? (
        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <div role="radiogroup" aria-label="Valoración del restaurante" className="-mx-1 flex justify-between lg:justify-start lg:gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n}: ${RATING_LABELS[n - 1]}`}
                onClick={() => setRating(n)}
                className={cx(
                  "flex size-[52px] items-center justify-center rounded-input transition-transform active:scale-95",
                  n <= rating ? "text-gold" : "text-ink-3",
                )}
              >
                <Star size={34} strokeWidth={1.6} fill={n <= rating ? "currentColor" : "none"} aria-hidden />
              </button>
            ))}
          </div>
          <p className={cx("min-h-5 text-center text-[15px] leading-5 font-semibold lg:text-left", rating ? "text-ink" : "text-ink-3")}>
            {rating ? RATING_LABELS[rating - 1] : "Toca una estrella"}
          </p>
          <TextArea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Lo mejor, lo peor, si repetiríais…"
            aria-label="Comentario (opcional)"
          />
          <Button type="submit" size="lg" full className="lg:w-auto lg:self-start" disabled={!rating} loading={busy}>
            Guardar valoración
          </Button>
        </form>
      ) : canRate && mine?.rating ? (
        <div className="flex flex-col gap-2 border-y border-line py-4">
          <div className="flex items-center gap-2.5">
            <Avatar name={mine.name} photoURL={mine.photoURL} seed={mine.uid} size={36} />
            <div className="flex-1">
              <p className="text-[15px] leading-5 font-semibold text-ink">Tu valoración</p>
              <div className="flex items-center gap-1.5">
                <Stars value={mine.rating} />
                <span className="text-caption font-medium text-ink-2">{RATING_LABELS[mine.rating - 1]}</span>
              </div>
            </div>
          </div>
          {mine.comment ? <p className="text-body text-pretty text-ink-2">{mine.comment}</p> : null}
          <button
            type="button"
            onClick={() => {
              setRating(mine.rating ?? null)
              setComment(mine.comment ?? "")
              setEditing(true)
            }}
            className="self-start text-[15px] leading-[44px] font-semibold text-accent-ink underline underline-offset-[3px]"
          >
            Cambiar mi valoración
          </button>
        </div>
      ) : null}

      {!rated.length ? (
        <p className="py-1 text-center text-[14px] leading-5 text-ink-3 lg:text-left">Todavía no hay valoraciones de la mesa.</p>
      ) : null}

      {others.length ? (
        <ul className="flex flex-col">
          {others.map((player) => (
            <li key={player.uid} className="flex gap-3 border-t border-line py-3.5">
              <Avatar name={player.name} photoURL={player.photoURL} seed={player.uid} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[15px] leading-5 font-semibold text-ink">{player.name}</span>
                  <Stars value={player.rating ?? 0} />
                </div>
                {player.comment ? <p className="mt-0.5 text-body text-pretty text-ink-2">{player.comment}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {!canRate ? <p className="text-caption text-ink-3">Sólo los comensales de la mesa pueden valorar.</p> : null}
    </section>
  )
}
