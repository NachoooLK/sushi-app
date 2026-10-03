export type SessionStatus = "live" | "finished"

export interface ResultEntry {
  uid: string
  name: string
  photoURL: string | null
  count: number
}

export interface Session {
  code: string
  name: string
  restaurant: string | null
  location: string | null
  hostId: string
  hostName: string
  status: SessionStatus
  createdAt: Date | null
  finishedAt: Date | null
  participantIds: string[]
  maxPlayers: number
  /** Foto fija de la clasificación final; sólo existe cuando la mesa está cerrada. */
  results: ResultEntry[] | null
  totalPieces: number
  /** Vacío si comiste solo o si nadie comió nada: en solitario no se cuentan victorias. */
  winnerIds: string[]
}

export interface Player {
  uid: string
  name: string
  photoURL: string | null
  count: number
  joinedAt: Date | null
  updatedAt: Date | null
  rating?: number
  comment?: string | null
}

export type Period = "today" | "week" | "month" | "all"
