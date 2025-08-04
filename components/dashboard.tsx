"use client"

import { useState, useEffect } from "react"
import type { User } from "firebase/auth"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import TabNavigation from "@/components/tab-navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { LogOut } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import AdminPanel from "@/components/admin-panel"
import Credits from "@/components/credits"

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

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme?.colors.background} p-4 transition-all duration-300`}>
      <div className="max-w-6xl mx-auto">
        {/* Header compacto */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="text-2xl md:text-3xl animate-pulse">🍣</div>
              <div>
                <h1 className={`text-xl md:text-3xl font-bold bg-gradient-to-r ${currentTheme?.colors.primary} bg-clip-text text-transparent`}>
                  Sushi Rush
                </h1>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  ¡Hola <span className={`font-semibold ${currentTheme?.colors.text}`}>{user.displayName || user.email}</span>! 👋
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <ThemeSelector />
              <UserProfile user={user} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards compactos */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
            <Card className={`${currentTheme?.colors.card} hover:shadow-lg transition-all duration-300 p-3`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-lg font-bold ${currentTheme?.colors.text}`}>{userStats.totalSushi.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total Sushi</div>
                </div>
                <div className="text-2xl">🍣</div>
              </div>
            </Card>

            <Card className={`${currentTheme?.colors.card} hover:shadow-lg transition-all duration-300 p-3`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-lg font-bold ${currentTheme?.colors.text}`}>{userStats.gamesPlayed}</div>
                  <div className="text-xs text-gray-500">Partidas</div>
                </div>
                <Users className={`h-4 w-4 ${currentTheme?.colors.text}`} />
              </div>
            </Card>

            <Card className={`${currentTheme?.colors.card} hover:shadow-lg transition-all duration-300 p-3`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-lg font-bold ${currentTheme?.colors.text}`}>{userStats.wins}</div>
                  <div className="text-xs text-gray-500">Victorias</div>
                </div>
                <Trophy className={`h-4 w-4 ${currentTheme?.colors.text}`} />
              </div>
            </Card>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Contenido de las pestañas */}
        {activeTab === "rooms" && (
          <div className="space-y-4 mt-4">
            {/* Cards de acción compactos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <Card className={`${currentTheme?.colors.card} hover:shadow-xl transition-all duration-300`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${currentTheme?.colors.text}`}>
                    <Plus className="h-5 w-5" />
                    Crear Sala
                  </CardTitle>
                  <CardDescription className={currentTheme?.colors.text}>
                    Crea una nueva sala para jugar con tus amigos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateRoom user={user} />
                </CardContent>
              </Card>

              <Card className={`${currentTheme?.colors.card} hover:shadow-xl transition-all duration-300`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${currentTheme?.colors.text}`}>
                    <Search className="h-5 w-5" />
                    Unirse a Sala
                  </CardTitle>
                  <CardDescription className={currentTheme?.colors.text}>
                    Únete a una sala existente con el ID
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JoinRoom user={user} />
                </CardContent>
              </Card>

              <Card className={`${currentTheme?.colors.card} hover:shadow-xl transition-all duration-300`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${currentTheme?.colors.text}`}>
                    <Target className="h-5 w-5" />
                    Modo Solitario
                  </CardTitle>
                  <CardDescription className={currentTheme?.colors.text}>
                    Juega solo y mejora tus habilidades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => router.push('/solo')} 
                    className={`w-full ${currentTheme?.colors.button}`}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Jugar Solo
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Salas Activas compactas */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Salas Activas ({rooms.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Cargando...</p>
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-4xl mb-2">🏠</div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">No hay salas activas</h3>
                    <p className="text-xs text-gray-500 mb-3">¡Sé el primero en crear una sala!</p>
                    <Button 
                      size="sm"
                      onClick={() => setActiveTab("rooms")}
                      className={currentTheme?.colors.button}
                    >
                      Crear Sala
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rooms.slice(0, 3).map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-800 text-sm truncate">{room.name}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {room.players.length} jugadores
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant="outline" 
                            className="cursor-pointer hover:bg-orange-50 border-orange-200 text-orange-700 transition-colors text-xs px-2 py-1" 
                            onClick={() => copyRoomId(room.id)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            {room.id.slice(0, 6)}...
                          </Badge>
                          <Button 
                            size="sm" 
                            onClick={() => joinRoom(room.id)}
                            className={`${currentTheme?.colors.button} text-xs px-3 py-1`}
                          >
                            Unirse
                          </Button>
                        </div>
                      </div>
                    ))}
                    {rooms.length > 3 && (
                      <div className="text-center pt-2">
                        <p className="text-xs text-gray-500">+{rooms.length - 3} salas más</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contenido de rankings */}
        {activeTab === "rankings" && (
          <div className="mt-4">
            <Rankings />
          </div>
        )}

        {/* Contenido de historial */}
        {activeTab === "history" && (
          <div className="mt-4 space-y-4">
            <GameHistory />
            <AdminPanel userEmail={user.email} />
          </div>
        )}

        {/* Contenido de créditos */}
        {activeTab === "credits" && (
          <div className="mt-4">
            <Credits />
          </div>
        )}
      </div>
    </div>
  )
}
