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

interface JoinRoomProps {
  user: User
}

export default function JoinRoom({ user }: JoinRoomProps) {
  const [roomId, setRoomId] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { getRoom, addPlayerToRoom } = useRooms()

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomId.trim()) return

    setLoading(true)

    try {
      // Buscar la sala por ID
      const room = await getRoom(roomId)

      if (!room) {
        toast({
          title: "Sala no encontrada",
          description: "Verifica el ID de la sala",
          variant: "destructive",
        })
        return
      }

      if (!room.isActive) {
        toast({
          title: "Sala cerrada",
          description: "Esta sala ya no está activa",
          variant: "destructive",
        })
        return
      }

      // Verificar si el usuario ya está en la sala
      const isAlreadyInRoom = room.players.some((player) => player.id === user.uid)

      if (isAlreadyInRoom) {
        router.push(`/room/${roomId}`)
        return
      }

      // Verificar si la sala está llena (máximo 6 jugadores)
      if (room.players.length >= 6) {
        toast({
          title: "Sala llena",
          description: "Esta sala ya tiene el máximo de jugadores",
          variant: "destructive",
        })
        return
      }

      // Agregar jugador a la sala
      await addPlayerToRoom(roomId, {
        id: user.uid,
        name: user.displayName || user.email || 'Anónimo',
        sushiCount: 0
      })

      toast({
        title: "¡Te has unido a la sala!",
        description: `Bienvenido a ${room.name}`,
      })

      router.push(`/room/${roomId}`)
    } catch (error: any) {
      toast({
        title: "Error al unirse a la sala",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleJoinRoom} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="roomId" className="text-sm font-medium text-purple-700">
          ID de la sala
        </Label>
        <Input
          id="roomId"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Pega el ID de la sala aquí"
          required
          className="h-12 px-4 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Pega el código que te compartió tu amigo
        </p>
      </div>
      <Button 
        type="submit" 
        className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105" 
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Uniéndose...</span>
          </div>
        ) : (
          "Unirse a Sala"
        )}
      </Button>
    </form>
  )
}
