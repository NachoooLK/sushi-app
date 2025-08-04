"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Calendar, Clock } from "lucide-react"

interface GameResult {
  id: string
  roomId: string
  roomName: string
  winner: string
  winnerName: string
  totalSushi: number
  players: any[]
  finishedAt: any
  date: string
}

export default function GameHistory() {
  const [games, setGames] = useState<GameResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        const q = query(
          collection(db, 'games'),
          orderBy('finishedAt', 'desc')
        )
        
        const snapshot = await getDocs(q)
        const gameResults: GameResult[] = []
        snapshot.forEach((doc) => {
          gameResults.push({ id: doc.id, ...doc.data() } as GameResult)
        })
        
        setGames(gameResults)
      } catch (error) {
        console.error('Error fetching game history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGameHistory()
  }, [])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Fecha desconocida'
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Historial de Partidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando historial...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (games.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Historial de Partidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📜</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay partidas registradas</h3>
            <p className="text-gray-500">¡Juega algunas partidas para ver tu historial aquí!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Historial de Partidas ({games.length})
        </CardTitle>
        <CardDescription>Partidas terminadas recientemente</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-lg">{game.roomName}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-yellow-600">{game.winnerName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{game.players.length} jugadores</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(game.finishedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="text-lg">
                  🍣 {game.totalSushi}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 