"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, limit, getDocs, where, type Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

interface RankingUser {
  id: string
  displayName: string
  email: string
  totalSushi: number
  wins: number
  gamesPlayed: number
}

interface DailyGame {
  id: string
  roomName: string
  winner: string
  winnerName: string
  totalSushi: number
  playedAt: Timestamp
}

export default function Rankings() {
  const [globalRanking, setGlobalRanking] = useState<RankingUser[]>([])
  const [dailyGames, setDailyGames] = useState<DailyGame[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        // Ranking global por total de sushi
        const globalQuery = query(collection(db, "users"), orderBy("totalSushi", "desc"), limit(10))
        const globalSnapshot = await getDocs(globalQuery)
        const globalData = globalSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as RankingUser[]
        setGlobalRanking(globalData)

        // Juegos del día actual
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const dailyQuery = query(
          collection(db, "games"),
          where("finishedAt", ">=", today),
          where("finishedAt", "<", tomorrow),
          orderBy("finishedAt", "desc"),
        )
        const dailySnapshot = await getDocs(dailyQuery)
        const dailyData = dailySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DailyGame[]
        setDailyGames(dailyData)
      } catch (error) {
        console.error("Error fetching rankings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRankings()
  }, [])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="global" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="global">Ranking Global</TabsTrigger>
        <TabsTrigger value="daily">Partidas de Hoy</TabsTrigger>
      </TabsList>

      <TabsContent value="global">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top 10 Global
            </CardTitle>
            <CardDescription>Los mejores comedores de sushi de todos los tiempos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {globalRanking.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">{getRankIcon(index)}</div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{user.displayName?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.displayName || user.email}</p>
                      <p className="text-sm text-gray-500">
                        {user.wins} victorias de {user.gamesPlayed} partidas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-lg">
                      🍣 {user.totalSushi}
                    </Badge>
                  </div>
                </div>
              ))}
              {globalRanking.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay datos de ranking aún</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="daily">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-blue-500" />
              Partidas de Hoy
            </CardTitle>
            <CardDescription>Resultados de las partidas jugadas hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyGames.map((game, index) => (
                <div key={game.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">{getRankIcon(index)}</div>
                    <div>
                      <p className="font-medium">{game.winnerName}</p>
                      <p className="text-sm text-gray-500">{game.roomName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-lg">
                      🍣 {game.totalSushi}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{game.playedAt?.toDate().toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {dailyGames.length === 0 && (
                <p className="text-center text-gray-500 py-8">No se han jugado partidas hoy</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
