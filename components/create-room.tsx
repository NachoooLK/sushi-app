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
        <Label htmlFor="roomName">Nombre de la sala</Label>
        <Input
          id="roomName"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Ej: Cena de sushi con amigos"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creando..." : "Crear Sala"}
      </Button>
    </form>
  )
}
