"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Calendar, Clock, Medal, Star, Crown, Trash2, MoreVertical, Eye } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { toast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [gameToDelete, setGameToDelete] = useState<GameResult | null>(null)
  const { theme, themes } = useTheme()
  const currentTheme = themes.find(t => t.id === theme)

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

  const handleDeleteGame = async (game: GameResult) => {
    setGameToDelete(game)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!gameToDelete) return

    try {
      await deleteDoc(doc(db, 'games', gameToDelete.id))
      setGames(games.filter(game => game.id !== gameToDelete.id))
      toast({
        title: "Partida eliminada",
        description: "La partida se ha eliminado del historial",
      })
    } catch (error) {
      console.error('Error deleting game:', error)
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la partida",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setGameToDelete(null)
    }
  }

  const showGameDetails = (game: GameResult) => {
    toast({
      title: `Detalles de ${game.roomName}`,
      description: `Ganador: ${game.winnerName} | Jugadores: ${game.players.length} | Sushi: ${game.totalSushi} piezas`,
    })
  }

  if (loading) {
    return (
      <Card className={`${currentTheme?.colors.card} transition-all duration-300`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${currentTheme?.colors.text}`}>
            <Trophy className="h-5 w-5" />
            Historial de Partidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className={`w-8 h-8 border-4 ${currentTheme?.colors.text} border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
            <p className="text-gray-600">Cargando historial...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (games.length === 0) {
    return (
      <Card className={`${currentTheme?.colors.card} transition-all duration-300`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${currentTheme?.colors.text}`}>
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
    <Card className={`${currentTheme?.colors.card} transition-all duration-300`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${currentTheme?.colors.text}`}>
          <Trophy className="h-5 w-5" />
          Historial de Partidas ({games.length})
        </CardTitle>
        <CardDescription>Partidas terminadas recientemente</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {games.slice(0, 5).map((game, index) => (
            <div
              key={game.id}
              className="group relative overflow-hidden border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
            >
              {/* Background gradient effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme?.colors.primary} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Position indicator */}
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentTheme?.colors.primary} bg-opacity-10`}>
                        {index === 0 ? (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        ) : index === 1 ? (
                          <Medal className="h-4 w-4 text-gray-400" />
                        ) : index === 2 ? (
                          <Star className="h-4 w-4 text-orange-400" />
                        ) : (
                          <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-gray-900 transition-colors">
                          {game.roomName}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-600">{game.winnerName}</span>
                          <span className="text-xs text-gray-400">• Ganador</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{game.players.length} jugador{game.players.length !== 1 ? 'es' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(game.finishedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className={`text-lg ${currentTheme?.colors.text} bg-opacity-10`}>
                      🍣 {game.totalSushi}
                    </Badge>
                    <div className="text-xs text-gray-400">
                      {game.totalSushi === 1 ? 'pieza' : 'piezas'}
                    </div>
                    
                    {/* Action menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => showGameDetails(game)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteGame(game)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {/* Progress bar for visual appeal */}
                <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full ${currentTheme?.colors.primary} transition-all duration-300`}
                    style={{ width: `${Math.min((game.totalSushi / 50) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
          {games.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">+{games.length - 5} partidas más</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Delete confirmation dialog */}
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar partida?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres eliminar la partida "{gameToDelete?.roomName}"? 
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={confirmDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 