"use client"

import type React from "react"

import { useState } from "react"
import type { User } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useRooms } from "@/hooks/use-rooms"

interface CreateRoomProps {
  user: User
}

export default function CreateRoom({ user }: CreateRoomProps) {
  const [roomName, setRoomName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { createRoom, addPlayerToRoom } = useRooms()

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomName.trim()) return

    setLoading(true)

    try {
      // Crear la sala
      const roomId = await createRoom(roomName)
      
      // Añadir al usuario como primer jugador
      await addPlayerToRoom(roomId, {
        id: user.uid,
        name: user.displayName || user.email || 'Anónimo',
        sushiCount: 0
      })

      toast({
        title: "¡Sala creada!",
        description: "Tu sala ha sido creada exitosamente",
      })

      router.push(`/room/${roomId}`)
    } catch (error: any) {
      toast({
        title: "Error al crear sala",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleCreateRoom} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="roomName" className="text-sm font-medium text-green-700">
          Nombre de la sala
        </Label>
        <Input
          id="roomName"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Ej: Cena de sushi con amigos"
          required
          className="h-12 px-4 border-gray-200 focus:border-green-500 focus:ring-green-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Elige un nombre descriptivo para tu sala
        </p>
      </div>
      <Button 
        type="submit" 
        className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105" 
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creando sala...</span>
          </div>
        ) : (
          "Crear Sala"
        )}
      </Button>
    </form>
  )
}
