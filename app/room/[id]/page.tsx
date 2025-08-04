"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Minus, Trophy, Users, Copy } from "lucide-react"
import { Loader2 } from "lucide-react"
import { useRoom } from "@/hooks/use-room"
import { useRooms } from "@/hooks/use-rooms"
import { useRankings } from "@/hooks/useRankings"
import RoomRatings from "@/components/room-ratings"

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [updating, setUpdating] = useState(false)
  
  const roomId = params.id as string
  const { room, loading, error } = useRoom(roomId)
  const { updatePlayerSushiCount, closeRoom, removePlayerFromRoom, addRoomRating } = useRooms()
  const { finishGame: finishGameWithStats } = useRankings()

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (!user) {
        router.push("/")
      }
    })

    return () => unsubscribeAuth()
  }, [router])

  // Agregar automáticamente al jugador a la sala si no está presente
  useEffect(() => {
    if (room && user && !room.players.find(p => p.id === user.uid)) {
      const addPlayer = async () => {
        try {
          await addPlayerToRoom(roomId, {
            id: user.uid,
            name: user.displayName || user.email || 'Jugador',
            sushiCount: 0
          })
        } catch (error) {
          console.error('Error adding player to room:', error)
        }
      }
      addPlayer()
    }
  }, [room, user, roomId])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      router.push("/")
    }
  }, [error, router])

  const updateSushiCount = async (increment: number) => {
    if (!room || !user || updating) return

    setUpdating(true)
    try {
      const currentPlayer = room.players.find((p) => p.id === user.uid)
      if (!currentPlayer) return

      const newCount = Math.max(0, currentPlayer.sushiCount + increment)
      await updatePlayerSushiCount(roomId, user.uid, newCount)
    } catch (error: any) {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const finishGame = async () => {
    if (!room || !user) return

    try {
      // Guardar estadísticas del juego
      await finishGameWithStats(room)
      
      // Cerrar la sala
      await closeRoom(roomId)

      // Encontrar el ganador para el mensaje
      const winner = room.players.reduce((prev, current) => 
        (prev.sushiCount > current.sushiCount ? prev : current)
      )

      toast({
        title: "¡Juego terminado!",
        description: `${winner.name} ganó con ${winner.sushiCount} piezas de sushi. Estadísticas actualizadas.`,
      })

      router.push("/")
    } catch (error: any) {
      console.error('Error finishing game:', error)
      toast({
        title: "Error al terminar juego",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const leaveRoom = async () => {
    if (!room || !user) return

    try {
      // Remover al jugador de la sala
      await removePlayerFromRoom(roomId, user.uid)
      
      // Si es el último jugador, cerrar la sala
      if (room.players.length <= 1) {
        await closeRoom(roomId)
        toast({
          title: "Sala cerrada",
          description: "Eras el último jugador, la sala ha sido cerrada",
        })
      } else {
        toast({
          title: "Has salido de la sala",
          description: "Te has removido exitosamente de la sala",
        })
      }
      
      router.push("/")
    } catch (error: any) {
      console.error('Error leaving room:', error)
      toast({
        title: "Error al salir de la sala",
        description: error.message,
        variant: "destructive",
      })
      // Aún redirigimos aunque haya error
      router.push("/")
    }
  }

  const copyRoomId = () => {
    if (room) {
      navigator.clipboard.writeText(room.id)
      toast({
        title: "ID copiado",
        description: "El ID de la sala ha sido copiado al portapapeles",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!room || !user) {
    return null
  }

  const currentPlayer = room.players.find((p) => p.id === user.uid)
  const sortedPlayers = [...room.players].sort((a, b) => b.sushiCount - a.sushiCount)
  const isCreator = room.players.length > 0 && room.players[0].id === user.uid

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-2 md:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header mejorado */}
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/")} 
            className="flex items-center gap-2 text-sm md:text-base hover:bg-orange-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={leaveRoom} 
            className="text-red-600 bg-transparent text-sm md:text-base hover:bg-red-50 border-red-300 hover:border-red-400 transition-all duration-200"
          >
            Salir de la sala
          </Button>
        </div>

        <div className="grid gap-3 md:gap-6">
          {/* Card de información de sala mejorada */}
          <Card className="shadow-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-2xl md:text-3xl">🍣</div>
                    <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {room.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">{room.players.length}/6</span>
                      <span>jugadores</span>
                    </div>
                    {room.location && (
                      <div className="flex items-center gap-1">
                        <span>📍</span>
                        <span className="font-medium">{room.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className="text-sm md:text-base cursor-pointer hover:bg-orange-100 border-orange-300 transition-all duration-200" 
                    onClick={copyRoomId}
                  >
                    <Copy className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    {room.id.slice(0, 8)}...
                  </Badge>
                </div>
              </div>
            </CardHeader>
            {room.photo && (
              <CardContent className="pt-0">
                <div className="relative aspect-video rounded-lg overflow-hidden shadow-md">
                  <img 
                    src={room.photo} 
                    alt={`Foto de ${room.name}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </CardContent>
            )}
          </Card>

          {currentPlayer && (
            <Card className="border-2 border-orange-200 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-2xl md:text-3xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Tu Contador de Sushi
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  ¡Cuenta cada pieza que comes! 🍣
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4 md:space-y-6">
                {/* Contador principal con animación */}
                <div className="relative">
                  <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                    {currentPlayer.sushiCount}
                  </div>
                  <div className="text-4xl md:text-6xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 animate-bounce">
                    🍣
                  </div>
                </div>
                
                {/* Botones de control mejorados */}
                <div className="flex justify-center gap-4 md:gap-6">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => updateSushiCount(-1)}
                    disabled={updating || currentPlayer.sushiCount === 0}
                    className="h-14 w-14 md:h-16 md:w-16 rounded-full border-2 hover:border-orange-300 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Minus className="h-6 w-6 md:h-8 md:w-8" />
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => updateSushiCount(1)}
                    disabled={updating}
                    className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Plus className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </Button>
                </div>
                
                {/* Estado de carga */}
                {updating && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Actualizando...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="shadow-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Ranking de la Sala
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                ¡Ve quién está comiendo más sushi! 🍣
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                      player.id === user.uid 
                        ? "bg-gradient-to-r from-orange-100 to-red-100 border-orange-300 shadow-md" 
                        : "bg-white border-gray-200 hover:border-orange-200"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Posición con medalla */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        index === 0 ? "bg-yellow-100 border-2 border-yellow-400" :
                        index === 1 ? "bg-gray-100 border-2 border-gray-400" :
                        index === 2 ? "bg-orange-100 border-2 border-orange-400" :
                        "bg-gray-100 border-2 border-gray-300"
                      }`}>
                        <span className={`font-bold text-sm ${
                          index === 0 ? "text-yellow-600" :
                          index === 1 ? "text-gray-600" :
                          index === 2 ? "text-orange-600" :
                          "text-gray-500"
                        }`}>
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                        </span>
                      </div>
                      
                      {/* Avatar y nombre */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-orange-200">
                          <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">
                            {player.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-base">{player.name}</p>
                          {player.id === user.uid && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                              Tú
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Contador de sushi */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-lg px-3 py-1 border-orange-300 bg-orange-50 text-orange-700">
                        🍣 {player.sushiCount.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {isCreator && (
            <Card className="border-2 border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 text-xl md:text-2xl">
                  <Trophy className="h-6 w-6 text-green-600" />
                  Controles del Creador
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Como creador de la sala, puedes terminar el juego y guardar las estadísticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={finishGame} 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  Terminar Juego y Guardar Estadísticas
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Puntuaciones */}
          <RoomRatings
            roomId={roomId}
            ratings={room.ratings || []}
            currentUserId={user.uid}
            currentUserName={user.displayName || user.email || 'Jugador'}
            onAddRating={(rating) => addRoomRating(roomId, rating)}
          />
        </div>
      </div>
    </div>
  )
}
