"use client"

import { useState, useEffect } from "react"
import type { User } from "firebase/auth"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CreateRoom from "@/components/create-room"
import JoinRoom from "@/components/join-room"
import Rankings from "@/components/rankings"
import UserProfile from "@/components/user-profile"
import GameHistory from "@/components/game-history"
import { Trophy, Users, Plus, Search, Clock, Copy, Target, Calendar } from "lucide-react"
import { useRooms } from "@/hooks/use-rooms"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import ThemeSelector from "@/components/theme-selector"

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
  const { theme, themes } = useTheme()
  const currentTheme = themes.find(t => t.id === theme)

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
      } else {
        // Si no existe el documento, crear uno con valores iniciales
        setUserStats({
          totalSushi: 0,
          gamesPlayed: 0,
          wins: 0,
        })
      }
    }

    fetchUserStats()
    
    // Escuchar cambios en las estadísticas del usuario
    const userRef = doc(db, "users", user.uid)
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setUserStats({
          totalSushi: data.totalSushi || 0,
          gamesPlayed: data.gamesPlayed || 0,
          wins: data.wins || 0,
        })
      }
    })

    return () => unsubscribe()
  }, [user.uid])

  const copyRoomId = (roomId: string) => {
    navigator.clipboard.writeText(roomId)
    // Aquí podrías mostrar un toast de confirmación
  }

  const joinRoom = (roomId: string) => {
    router.push(`/room/${roomId}`)
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme?.colors.background} p-4 transition-all duration-300`}>
      <div className="max-w-6xl mx-auto">
        {/* Header mejorado */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl md:text-4xl animate-pulse">🍣</div>
              <div>
                <h1 className={`text-2xl md:text-4xl font-bold bg-gradient-to-r ${currentTheme?.colors.primary} bg-clip-text text-transparent`}>
                  Sushi Counter
                </h1>
                <p className="text-sm md:text-lg text-gray-600 mt-1">
                  ¡Hola <span className={`font-semibold ${currentTheme?.colors.text}`}>{user.displayName || user.email}</span>! 👋
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <ThemeSelector />
              <UserProfile user={user} />
            </div>
          </div>

          {/* Stats Cards mejorados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className={`${currentTheme?.colors.card} hover:shadow-lg transition-all duration-300`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${currentTheme?.colors.text}`}>Total Sushi</CardTitle>
                <div className="text-3xl animate-bounce">🍣</div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${currentTheme?.colors.text}`}>{userStats.totalSushi.toLocaleString()}</div>
                <p className={`text-xs ${currentTheme?.colors.text} mt-1`}>Piezas consumidas</p>
              </CardContent>
            </Card>

            <Card className={`${currentTheme?.colors.card} hover:shadow-lg transition-all duration-300`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${currentTheme?.colors.text}`}>Partidas Jugadas</CardTitle>
                <Users className={`h-5 w-5 ${currentTheme?.colors.text}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${currentTheme?.colors.text}`}>{userStats.gamesPlayed}</div>
                <p className={`text-xs ${currentTheme?.colors.text} mt-1`}>Sesiones completadas</p>
              </CardContent>
            </Card>

            <Card className={`${currentTheme?.colors.card} hover:shadow-lg transition-all duration-300`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${currentTheme?.colors.text}`}>Victorias</CardTitle>
                <Trophy className={`h-5 w-5 ${currentTheme?.colors.text}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${currentTheme?.colors.text}`}>{userStats.wins}</div>
                <p className={`text-xs ${currentTheme?.colors.text} mt-1`}>Partidas ganadas</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs mejorados */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl text-xs md:text-sm">
            <TabsTrigger 
              value="rooms" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all rounded-lg"
            >
              <Users className="h-4 w-4" />
              Salas
            </TabsTrigger>
            <TabsTrigger 
              value="rankings" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all rounded-lg"
            >
              <Trophy className="h-4 w-4" />
              Rankings
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all rounded-lg"
            >
              <Calendar className="h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="space-y-6 mt-6">
            {/* Cards de acción mejorados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Plus className="h-5 w-5" />
                    Crear Sala
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    Crea una nueva sala para jugar con tus amigos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateRoom user={user} />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Search className="h-5 w-5" />
                    Unirse a Sala
                  </CardTitle>
                  <CardDescription className="text-purple-600">
                    Únete a una sala existente con el ID
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JoinRoom user={user} />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <Target className="h-5 w-5" />
                    Modo Solitario
                  </CardTitle>
                  <CardDescription className="text-orange-600">
                    Juega solo y mejora tus habilidades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => router.push('/solo')} 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Jugar Solo
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Salas Activas mejoradas */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Salas Activas ({rooms.length})
                </CardTitle>
                <CardDescription>Salas disponibles para unirse</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando salas...</p>
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🏠</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay salas activas</h3>
                    <p className="text-gray-500 mb-4">¡Sé el primero en crear una sala!</p>
                    <Button 
                      onClick={() => setActiveTab("rooms")}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      Crear Sala
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-md gap-3"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-base md:text-lg">{room.name}</h3>
                          <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                            <Users className="h-3 w-3 md:h-4 md:w-4" />
                            {room.players.length} jugadores
                          </p>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                          <Badge 
                            variant="outline" 
                            className="cursor-pointer hover:bg-orange-50 border-orange-200 text-orange-700 transition-colors text-xs" 
                            onClick={() => copyRoomId(room.id)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            {room.id.slice(0, 8)}...
                          </Badge>
                          <Button 
                            size="sm" 
                            onClick={() => joinRoom(room.id)}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xs"
                          >
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

          <TabsContent value="rankings" className="mt-6">
            <Rankings />
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <GameHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
