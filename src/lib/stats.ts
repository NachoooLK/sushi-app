import type { Period, Player, ResultEntry, Session } from "./types"

export interface RankedPlayer extends Player {
  /** Posición con empates compartidos: 1, 1, 3… */
  position: number
}

/** Ordena por piezas; a igualdad, va delante quien llegó antes a esa cifra. */
export function rankPlayers(players: Player[]): RankedPlayer[] {
  const sorted = [...players].sort(
    (a, b) =>
      b.count - a.count ||
      time(a.updatedAt) - time(b.updatedAt) ||
      time(a.joinedAt) - time(b.joinedAt) ||
      a.name.localeCompare(b.name),
  )
  return sorted.map((player) => ({
    ...player,
    position: 1 + sorted.filter((other) => other.count > player.count).length,
  }))
}

/** La frase bajo tu contador: dónde estás y a cuánto del siguiente objetivo. */
export function standingLine(ranked: RankedPlayer[], uid: string): string {
  const me = ranked.find((player) => player.uid === uid)
  if (!me) return ""
  if (ranked.length < 2) return me.count ? "" : "Pulsa + cada vez que te comas una pieza"
  const others = ranked.filter((player) => player.uid !== uid)
  const best = others[0]
  if (me.count === 0 && best.count === 0) return "Nadie ha empezado todavía"
  if (me.position === 1) {
    const tied = others.filter((player) => player.count === me.count)
    if (tied.length) return `Empatas en cabeza con ${joinNames(tied.map((player) => player.name))}`
    return `Vas primero, ${countLabel(me.count - best.count)} por delante de ${best.name}`
  }
  const leader = ranked[0]
  return `Vas ${me.position}.º, a ${countLabel(leader.count - me.count)} de ${leader.name}`
}

function countLabel(count: number) {
  return `${count} ${count === 1 ? "pieza" : "piezas"}`
}

function joinNames(names: string[]) {
  return names.length < 3 ? names.join(" y ") : `${names.slice(0, -1).join(", ")} y ${names.at(-1)}`
}

export function buildResults(players: Player[]): ResultEntry[] {
  return rankPlayers(players).map(({ uid, name, photoURL, count }) => ({ uid, name, photoURL, count }))
}

export function computeWinners(results: ResultEntry[]): string[] {
  if (results.length < 2) return []
  const top = Math.max(...results.map((entry) => entry.count))
  if (top <= 0) return []
  return results.filter((entry) => entry.count === top).map((entry) => entry.uid)
}

export function sumPieces(entries: { count: number }[]) {
  return entries.reduce((total, entry) => total + entry.count, 0)
}

export interface LeaderboardRow {
  uid: string
  name: string
  photoURL: string | null
  pieces: number
  sessions: number
  wins: number
  best: number
  average: number
}

export function buildLeaderboard(sessions: Session[]): LeaderboardRow[] {
  const rows = new Map<string, LeaderboardRow & { lastSeen: number }>()
  for (const session of finishedOnly(sessions)) {
    const seenAt = time(session.finishedAt)
    for (const entry of session.results) {
      const row = rows.get(entry.uid) ?? {
        uid: entry.uid,
        name: entry.name,
        photoURL: entry.photoURL,
        pieces: 0,
        sessions: 0,
        wins: 0,
        best: 0,
        average: 0,
        lastSeen: -Infinity,
      }
      row.pieces += entry.count
      row.sessions += 1
      row.best = Math.max(row.best, entry.count)
      if (session.winnerIds.includes(entry.uid)) row.wins += 1
      // El nombre y la foto más recientes ganan, por si alguien cambió su perfil.
      if (seenAt >= row.lastSeen) {
        row.name = entry.name
        row.photoURL = entry.photoURL
        row.lastSeen = seenAt
      }
      rows.set(entry.uid, row)
    }
  }
  return [...rows.values()]
    .map(({ lastSeen: _lastSeen, ...row }) => ({ ...row, average: row.pieces / row.sessions }))
    .sort((a, b) => b.pieces - a.pieces || b.wins - a.wins || b.best - a.best || a.name.localeCompare(b.name))
}

export interface Performance extends ResultEntry {
  sessionCode: string
  sessionName: string
  restaurant: string | null
  finishedAt: Date | null
}

export function topPerformances(sessions: Session[], limit = 5): Performance[] {
  return finishedOnly(sessions)
    .flatMap((session) =>
      session.results.map((entry) => ({
        ...entry,
        sessionCode: session.code,
        sessionName: session.name,
        restaurant: session.restaurant,
        finishedAt: session.finishedAt,
      })),
    )
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || time(a.finishedAt) - time(b.finishedAt))
    .slice(0, limit)
}

export interface PersonalStats {
  pieces: number
  sessions: number
  wins: number
  groupSessions: number
  best: number
  average: number
  favoriteRestaurant: string | null
}

export function personalStats(sessions: Session[], uid: string): PersonalStats {
  const mine = finishedOnly(sessions).filter((session) => session.results.some((entry) => entry.uid === uid))
  const counts = mine.map((session) => session.results.find((entry) => entry.uid === uid)!.count)
  const restaurants = new Map<string, number>()
  for (const session of mine) {
    const name = session.restaurant?.trim()
    if (name) restaurants.set(name, (restaurants.get(name) ?? 0) + 1)
  }
  const pieces = counts.reduce((total, count) => total + count, 0)
  return {
    pieces,
    sessions: mine.length,
    wins: mine.filter((session) => session.winnerIds.includes(uid)).length,
    groupSessions: mine.filter((session) => session.results.length > 1).length,
    best: counts.length ? Math.max(...counts) : 0,
    average: mine.length ? pieces / mine.length : 0,
    favoriteRestaurant: [...restaurants.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
  }
}

export function myResult(session: Session, uid: string) {
  const results = session.results ?? []
  const index = results.findIndex((entry) => entry.uid === uid)
  if (index === -1) return null
  const entry = results[index]
  return {
    ...entry,
    position: 1 + results.filter((other) => other.count > entry.count).length,
    won: session.winnerIds.includes(uid),
  }
}

/** Inicio del periodo en hora local; la semana empieza en lunes. */
export function periodStart(period: Period, now = new Date()): Date | null {
  if (period === "all") return null
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === "week") start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  if (period === "month") start.setDate(1)
  return start
}

/** Piezas por hora; null mientras haya muy poco tiempo para que el dato signifique algo. */
export function piecesPerHour(count: number, since: Date | null, now = new Date()) {
  if (!since) return null
  const hours = (now.getTime() - since.getTime()) / 3_600_000
  if (hours < 5 / 60) return null
  return count / hours
}

function finishedOnly(sessions: Session[]) {
  return sessions.filter(
    (session): session is Session & { results: ResultEntry[] } =>
      session.status === "finished" && Array.isArray(session.results),
  )
}

function time(date: Date | null | undefined) {
  return date ? date.getTime() : Number.MAX_SAFE_INTEGER
}
