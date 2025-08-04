"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useAlerts } from "@/hooks/use-alerts"
import { type User } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Bell, Eye, EyeOff, Shield, Volume2, VolumeX } from "lucide-react"

interface UserSettingsProps {
  user: User
  onClose: () => void
}

export default function UserSettings({ user, onClose }: UserSettingsProps) {
  const [displayName, setDisplayName] = useState(user.displayName || "")
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useAlerts()

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // Actualizar nombre de usuario en Firestore
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        settings: {
          notifications,
          soundEnabled,
          updatedAt: new Date()
        }
      })

      showSuccess(
        "Ajustes guardados",
        "Tus preferencias han sido actualizadas"
      )
      onClose()
    } catch (error: any) {
      showError(
        "Error al guardar ajustes",
        error.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Ajustes
          </CardTitle>
          <CardDescription>
            Configura tus preferencias personales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información del usuario */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Información personal</h3>
            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre de usuario</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre de usuario"
              />
            </div>
            <div className="text-xs text-gray-500">
              Email: {user.email}
            </div>
          </div>

          {/* Notificaciones */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Notificaciones</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm">Notificaciones push</span>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="text-sm">Sonidos</span>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </div>

          {/* Estadísticas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Estadísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">🍣</div>
                <div className="text-xs text-gray-600">Total Sushi</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">🏆</div>
                <div className="text-xs text-gray-600">Victorias</div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSaveSettings} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 