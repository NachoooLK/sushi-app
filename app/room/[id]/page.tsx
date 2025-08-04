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

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [updating, setUpdating] = useState(false)
  
  const roomId = params.id as string
  const { room, loading, error } = useRoom(roomId)
  const { updatePlayerSushiCount, closeRoom } = useRooms()

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (!user) {
        router.push("/")
      }
    })

    return () => unsubscribeAuth()
  }, [router])

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
      // Encontrar el ganador
      const winner = room.players.reduce((prev, current) => 
        (prev.sushiCount > current.sushiCount ? prev : current)
      )

      // Cerrar la sala
      await closeRoom(roomId)

      toast({
        title: "¡Juego terminado!",
        description: `${winner.name} ganó con ${winner.sushiCount} piezas de sushi`,
      })

      router.push("/")
    } catch (error: any) {
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
      // Por ahora simplemente redirigimos, en el futuro podríamos implementar
      // la lógica para remover al jugador de la sala
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Error al salir de la sala",
        description: error.message,
        variant: "destructive",
      })
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <Button variant="outline" onClick={leaveRoom} className="text-red-600 bg-transparent">
            Salir de la sala
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{room.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Users className="h-4 w-4" />
                    {room.players.length}/6 jugadores
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-lg cursor-pointer" onClick={copyRoomId}>
                    <Copy className="h-4 w-4 mr-1" />
                    {room.id.slice(0, 8)}...
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {currentPlayer && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-center text-3xl">Tu contador</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="text-8xl font-bold text-orange-600">{currentPlayer.sushiCount}</div>
                <div className="text-6xl">🍣</div>
                <div className="flex justify-center gap-4">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => updateSushiCount(-1)}
                    disabled={updating || currentPlayer.sushiCount === 0}
                    className="h-16 w-16 rounded-full"
                  >
                    <Minus className="h-8 w-8" />
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => updateSushiCount(1)}
                    disabled={updating}
                    className="h-16 w-16 rounded-full bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="h-8 w-8" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Ranking de la sala
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      player.id === user.uid ? "bg-orange-50 border-orange-200" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                        <span className="font-bold text-sm">#{index + 1}</span>
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{player.name}</p>
                        {player.id === user.uid && <p className="text-sm text-orange-600">Tú</p>}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg">
                      🍣 {player.sushiCount}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {isCreator && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-600">Controles del creador</CardTitle>
                <CardDescription>Como creador de la sala, puedes terminar el juego</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={finishGame} className="w-full bg-green-600 hover:bg-green-700">
                  <Trophy className="h-4 w-4 mr-2" />
                  Terminar juego
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
