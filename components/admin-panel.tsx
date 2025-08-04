"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Trash2, 
  Users, 
  Trophy, 
  AlertTriangle, 
  Shield, 
  Database,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { toast } from "@/hooks/use-toast"
import { isAdmin } from "@/lib/admin"
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

interface AdminStats {
  totalUsers: number
  totalGames: number
  totalRooms: number
}

interface AdminPanelProps {
  userEmail: string | null
}

export default function AdminPanel({ userEmail }: AdminPanelProps) {
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalGames: 0, totalRooms: 0 })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<string>("")
  const [deleting, setDeleting] = useState(false)
  const { theme, themes } = useTheme()
  const currentTheme = themes.find(t => t.id === theme)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (userEmail) {
        const adminStatus = await isAdmin(userEmail)
        setIsAdminUser(adminStatus)
      }
      setLoading(false)
    }

    checkAdminStatus()
  }, [userEmail])

  useEffect(() => {
    if (isAdminUser) {
      fetchStats()
    }
  }, [isAdminUser])

  const fetchStats = async () => {
    try {
      const [usersSnapshot, gamesSnapshot, roomsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'games')),
        getDocs(query(collection(db, 'rooms'), orderBy('createdAt', 'desc')))
      ])

      setStats({
        totalUsers: usersSnapshot.size,
        totalGames: gamesSnapshot.size,
        totalRooms: roomsSnapshot.size
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    }
  }

  const handleDeleteAll = async (type: string) => {
    setDeleteType(type)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteType) return

    setDeleting(true)
    try {
      let collectionName = ""
      let successMessage = ""

      switch (deleteType) {
        case "users":
          collectionName = "users"
          successMessage = "Todos los usuarios han sido eliminados"
          break
        case "games":
          collectionName = "games"
          successMessage = "Todo el historial de partidas ha sido eliminado"
          break
        case "rooms":
          collectionName = "rooms"
          successMessage = "Todas las salas han sido eliminadas"
          break
        case "all":
          // Eliminar todo
          const [usersSnapshot, gamesSnapshot, roomsSnapshot] = await Promise.all([
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'games')),
            getDocs(collection(db, 'rooms'))
          ])

          const deletePromises = [
            ...usersSnapshot.docs.map(doc => deleteDoc(doc.ref)),
            ...gamesSnapshot.docs.map(doc => deleteDoc(doc.ref)),
            ...roomsSnapshot.docs.map(doc => deleteDoc(doc.ref))
          ]

          await Promise.all(deletePromises)
          successMessage = "Todos los datos han sido eliminados"
          break
      }

      if (deleteType !== "all") {
        const snapshot = await getDocs(collection(db, collectionName))
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)
      }

      toast({
        title: "Eliminación completada",
        description: successMessage,
      })

      // Actualizar estadísticas
      await fetchStats()
    } catch (error) {
      console.error('Error deleting data:', error)
      toast({
        title: "Error al eliminar",
        description: "No se pudieron eliminar los datos",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setDeleteType("")
    }
  }

  if (loading) {
    return (
      <Card className={`${currentTheme?.colors.card} transition-all duration-300`}>
        <CardContent className="p-6">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Verificando permisos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isAdminUser) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card className={`${currentTheme?.colors.card} border-orange-200`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${currentTheme?.colors.text}`}>
            <Shield className="h-5 w-5 text-orange-500" />
            Panel de Administrador
          </CardTitle>
          <CardDescription>Gestión avanzada de datos del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
              <div className="text-sm text-blue-500">Usuarios</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{stats.totalGames}</div>
              <div className="text-sm text-green-500">Partidas</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Database className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{stats.totalRooms}</div>
              <div className="text-sm text-purple-500">Salas</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <h3 className="font-semibold text-red-700">Eliminar Datos</h3>
                  <p className="text-sm text-red-600">Acciones destructivas - ¡Cuidado!</p>
                </div>
              </div>
              <Badge variant="destructive">ADMIN</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleDeleteAll("users")}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Usuarios ({stats.totalUsers})
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleDeleteAll("games")}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Partidas ({stats.totalGames})
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleDeleteAll("rooms")}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Salas ({stats.totalRooms})
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => handleDeleteAll("all")}
                className="font-bold"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                ELIMINAR TODO
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar Eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar {deleteType === "all" ? "TODOS los datos" : 
                deleteType === "users" ? "todos los usuarios" :
                deleteType === "games" ? "todo el historial de partidas" :
                "todas las salas"}? 
              <br /><br />
              <strong>Esta acción es irreversible y eliminará permanentemente los datos.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 