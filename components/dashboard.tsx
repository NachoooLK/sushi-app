"use client"

import { useState, useEffect } from "react"
import type { User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CreateRoom from "@/components/create-room"
import JoinRoom from "@/components/join-room"
import Rankings from "@/components/rankings"
import UserProfile from "@/components/user-profile"
import { Trophy, Users, Plus, Search, Clock, Copy } from "lucide-react"
import { useRooms } from "@/hooks/use-rooms"
import { useRouter } from "next/navigation"

interface UserStats {
  totalSushi: number
  gamesPlayed: number
  wins: number
}

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("rooms")
  const [userStats, setUserStats] = useState<UserStats>({ totalSushi: 0, gamesPlayed: 0, wins: 0 })
  const { rooms, loading } = useRooms()
  const router = useRouter()

  useEffect(() => {
    const fetchUserStats = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setUserStats({
          totalSushi: data.totalSushi || 0,
          gamesPlayed: data.gamesPlayed || 0,
          wins: data.wins || 0,
        })
      }
    }

    fetchUserStats()
  }, [user.uid])

  const copyRoomId = (roomId: string) => {
    navigator.clipboard.writeText(roomId)
    // Aquí podrías mostrar un toast de confirmación
  }

  const joinRoom = (roomId: string) => {
    router.push(`/room/${roomId}`)
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-orange-600 flex items-center gap-2">🍣 Sushi Counter</h1>
              <p className="text-gray-600">¡Hola {user.displayName || user.email}!</p>
            </div>
            <UserProfile user={user} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sushi</CardTitle>
                <div className="text-2xl">🍣</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalSushi}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Partidas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.gamesPlayed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Victorias</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.wins}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Salas
            </TabsTrigger>
            <TabsTrigger value="rankings" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Rankings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Crear Sala
                  </CardTitle>
                  <CardDescription>Crea una nueva sala para jugar con tus amigos</CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateRoom user={user} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Unirse a Sala
                  </CardTitle>
                  <CardDescription>Únete a una sala existente con el ID</CardDescription>
                </CardHeader>
                <CardContent>
                  <JoinRoom user={user} />
                </CardContent>
              </Card>
            </div>

            {/* Salas Activas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Salas Activas ({rooms.length})
                </CardTitle>
                <CardDescription>Salas disponibles para unirse</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Cargando salas...</div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No hay salas activas. ¡Crea una nueva!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">{room.name}</h3>
                          <p className="text-sm text-gray-500">
                            {room.players.length} jugadores
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="cursor-pointer" onClick={() => copyRoomId(room.id)}>
                            <Copy className="h-3 w-3 mr-1" />
                            {room.id.slice(0, 8)}...
                          </Badge>
                          <Button size="sm" onClick={() => joinRoom(room.id)}>
                            Unirse
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rankings">
            <Rankings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
