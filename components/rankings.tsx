"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, limit, getDocs, where, type Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Crown, Star, TrendingUp, Calendar, Users } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

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
  const [activeTab, setActiveTab] = useState("global")
  const { theme, themes } = useTheme()
  const currentTheme = themes.find(t => t.id === theme)

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
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <Star className="h-4 w-4 text-blue-500" />
    }
  }

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1">🥇</Badge>
      case 1:
        return <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-white px-2 py-1">🥈</Badge>
      case 2:
        return <Badge className="bg-gradient-to-r from-amber-500 to-amber-700 text-white px-2 py-1">🥉</Badge>
      default:
        return <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
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
    <div className="space-y-4">
      {/* Navegación por pestañas */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "global" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("global")}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
            ${activeTab === "global" 
              ? `${currentTheme?.colors.button} text-white shadow-md` 
              : 'bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900'
            }
          `}
        >
          <Trophy className="h-4 w-4" />
          Ranking Global
        </Button>
        <Button
          variant={activeTab === "daily" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("daily")}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
            ${activeTab === "daily" 
              ? `${currentTheme?.colors.button} text-white shadow-md` 
              : 'bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900'
            }
          `}
        >
          <Calendar className="h-4 w-4" />
          Partidas de Hoy
        </Button>
      </div>

      {/* Contenido del ranking global */}
      {activeTab === "global" && (
        <Card className={`${currentTheme?.colors.card} shadow-lg`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-yellow-500" />
              Top 10 Global
            </CardTitle>
            <CardDescription className="text-sm">Los mejores comedores de sushi de todos los tiempos</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {globalRanking.map((user, index) => (
                <div 
                  key={user.id} 
                  className={`
                    flex items-center justify-between p-3 rounded-xl border transition-all duration-200 hover:shadow-md
                    ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 
                      index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200' :
                      index === 2 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' :
                      'bg-white/80 border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankBadge(index)}
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-gray-200">
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold">
                        {user.displayName?.charAt(0) || user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 truncate">{user.displayName || user.email}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {user.wins} victorias de {user.gamesPlayed} partidas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm px-3 py-1">
                      🍣 {user.totalSushi.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              ))}
              {globalRanking.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="text-gray-500 text-sm">No hay datos de ranking aún</p>
                  <p className="text-gray-400 text-xs">¡Juega partidas para aparecer aquí!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido de partidas del día */}
      {activeTab === "daily" && (
        <Card className={`${currentTheme?.colors.card} shadow-lg`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
              Partidas de Hoy
            </CardTitle>
            <CardDescription className="text-sm">Resultados de las partidas jugadas hoy</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {dailyGames.map((game, index) => (
                <div 
                  key={game.id} 
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white/80 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankBadge(index)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 truncate">{game.winnerName}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {game.roomName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-3 py-1">
                      🍣 {game.totalSushi.toLocaleString()}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {game.playedAt?.toDate().toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {dailyGames.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-gray-500 text-sm">No se han jugado partidas hoy</p>
                  <p className="text-gray-400 text-xs">¡Crea una sala y empieza a jugar!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
