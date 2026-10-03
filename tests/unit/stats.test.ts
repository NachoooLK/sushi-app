import { describe, expect, it } from "vitest"
import {
  buildLeaderboard,
  buildResults,
  computeWinners,
  periodStart,
  personalStats,
  piecesPerHour,
  rankPlayers,
  standingLine,
  topPerformances,
} from "@/lib/stats"
import type { Player, ResultEntry, Session } from "@/lib/types"

const at = (minute: number) => new Date(2026, 9, 3, 21, minute)

function player(uid: string, count: number, updatedMinute = 0, name = uid): Player {
  return { uid, name, photoURL: null, count, joinedAt: at(0), updatedAt: at(updatedMinute) }
}

function finished(code: string, results: ResultEntry[], extra: Partial<Session> = {}): Session {
  return {
    code,
    name: `Mesa ${code}`,
    restaurant: null,
    location: null,
    hostId: results[0]?.uid ?? "",
    hostName: "",
    status: "finished",
    createdAt: at(0),
    finishedAt: at(90),
    participantIds: results.map((entry) => entry.uid),
    maxPlayers: 10,
    results,
    totalPieces: results.reduce((total, entry) => total + entry.count, 0),
    winnerIds: computeWinners(results),
    ...extra,
  }
}

const entry = (uid: string, count: number, name = uid): ResultEntry => ({ uid, name, photoURL: null, count })

describe("rankPlayers", () => {
  it("ordena por piezas y comparte posición en los empates", () => {
    const ranked = rankPlayers([player("ana", 10, 5), player("bea", 12), player("carl", 10, 3)])
    expect(ranked.map((p) => [p.uid, p.position])).toEqual([
      ["bea", 1],
      ["carl", 2],
      ["ana", 2],
    ])
  })

  it("a igualdad de piezas va delante quien llegó antes", () => {
    const ranked = rankPlayers([player("tarde", 8, 30), player("pronto", 8, 10)])
    expect(ranked[0].uid).toBe("pronto")
  })
})

describe("computeWinners", () => {
  it("no hay victoria en solitario", () => {
    expect(computeWinners([entry("solo", 40)])).toEqual([])
  })

  it("no hay ganador si nadie comió", () => {
    expect(computeWinners([entry("a", 0), entry("b", 0)])).toEqual([])
  })

  it("los empatados en cabeza ganan todos", () => {
    expect(computeWinners([entry("a", 20), entry("b", 20), entry("c", 5)])).toEqual(["a", "b"])
  })
})

describe("buildResults", () => {
  it("guarda sólo los campos públicos y en orden", () => {
    expect(buildResults([player("a", 3), player("b", 9)])).toEqual([entry("b", 9), entry("a", 3)])
  })
})

describe("standingLine", () => {
  it("anima a empezar cuando estás solo", () => {
    expect(standingLine(rankPlayers([player("me", 0)]), "me")).toMatch(/Pulsa/)
  })

  it("explica la ventaja cuando vas primero", () => {
    const line = standingLine(rankPlayers([player("me", 12), player("ana", 9, 0, "Ana")]), "me")
    expect(line).toBe("Vas primero, 3 piezas por delante de Ana")
  })

  it("explica la distancia al líder", () => {
    const line = standingLine(rankPlayers([player("me", 4), player("ana", 5, 0, "Ana"), player("bo", 1)]), "me")
    expect(line).toBe("Vas 2.º, a 1 pieza de Ana")
  })

  it("detecta el empate en cabeza", () => {
    const line = standingLine(rankPlayers([player("me", 7, 1), player("ana", 7, 2, "Ana")]), "me")
    expect(line).toBe("Empatas en cabeza con Ana")
  })
})

describe("buildLeaderboard", () => {
  const sessions = [
    finished("AAAAAA", [entry("ana", 30, "Ana"), entry("bo", 20, "Bo")]),
    finished("BBBBBB", [entry("bo", 25, "Bo"), entry("ana", 10, "Ana")]),
    finished("CCCCCC", [entry("ana", 40, "Ana Renombrada")], { finishedAt: at(200) }),
    { ...finished("DDDDDD", [entry("zz", 99)]), status: "live" as const },
  ]

  it("suma piezas, mesas, victorias y récord por persona", () => {
    const rows = buildLeaderboard(sessions)
    expect(rows.map((row) => [row.uid, row.pieces, row.sessions, row.wins, row.best])).toEqual([
      ["ana", 80, 3, 1, 40],
      ["bo", 45, 2, 1, 25],
    ])
  })

  it("usa el nombre más reciente", () => {
    expect(buildLeaderboard(sessions)[0].name).toBe("Ana Renombrada")
  })

  it("ignora las mesas que siguen en directo", () => {
    expect(buildLeaderboard(sessions).some((row) => row.uid === "zz")).toBe(false)
  })

  it("lista las mejores marcas individuales", () => {
    expect(topPerformances(sessions, 2).map((p) => [p.uid, p.count])).toEqual([
      ["ana", 40],
      ["ana", 30],
    ])
  })
})

describe("personalStats", () => {
  it("resume tu historial", () => {
    const stats = personalStats(
      [
        finished("AAAAAA", [entry("me", 30), entry("x", 20)], { restaurant: "Sakura" }),
        finished("BBBBBB", [entry("x", 25), entry("me", 10)], { restaurant: "Sakura" }),
        finished("CCCCCC", [entry("me", 41)], { restaurant: "Koi" }),
      ],
      "me",
    )
    expect(stats).toEqual({
      pieces: 81,
      sessions: 3,
      wins: 1,
      groupSessions: 2,
      best: 41,
      average: 27,
      favoriteRestaurant: "Sakura",
    })
  })
})

describe("periodStart", () => {
  const friday = new Date(2026, 9, 2, 23, 30)

  it("hoy empieza a medianoche local", () => {
    expect(periodStart("today", friday)).toEqual(new Date(2026, 9, 2))
  })

  it("la semana empieza el lunes", () => {
    expect(periodStart("week", friday)).toEqual(new Date(2026, 8, 28))
    expect(periodStart("week", new Date(2026, 9, 4, 12))).toEqual(new Date(2026, 8, 28))
  })

  it("el mes empieza el día 1 y 'siempre' no tiene límite", () => {
    expect(periodStart("month", friday)).toEqual(new Date(2026, 9, 1))
    expect(periodStart("all", friday)).toBeNull()
  })
})

describe("piecesPerHour", () => {
  it("no da ritmo en los primeros minutos", () => {
    expect(piecesPerHour(3, at(0), at(2))).toBeNull()
  })

  it("calcula piezas por hora", () => {
    expect(piecesPerHour(15, at(0), at(30))).toBe(30)
  })
})
