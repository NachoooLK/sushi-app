import { useState, useEffect } from 'react'
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface Room {
  id: string
  name: string
  createdAt: any
  players: Player[]
  isActive: boolean
  photo?: string
  location?: string
  ratings?: RoomRating[]
}

export interface RoomRating {
  id: string
  playerId: string
  playerName: string
  rating: number // 1-5 estrellas
  comment?: string
  createdAt: any
}

export interface Player {
  id: string
  name: string
  sushiCount: number
  joinedAt: Date
}

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  // Obtener todas las salas activas
  useEffect(() => {
    const q = query(
      collection(db, 'rooms'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData: Room[] = []
      snapshot.forEach((doc) => {
        roomsData.push({ id: doc.id, ...doc.data() } as Room)
      })
      setRooms(roomsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Crear una nueva sala
  const createRoom = async (name: string, photo?: string, location?: string): Promise<string> => {
    try {
      const roomData = {
        name,
        createdAt: serverTimestamp(),
        players: [],
        isActive: true,
        photo: photo || null,
        location: location || null,
        ratings: []
      }
      
      const docRef = await addDoc(collection(db, 'rooms'), roomData)
      return docRef.id
    } catch (error) {
      console.error('Error creating room:', error)
      throw error
    }
  }

  // Obtener una sala específica
  const getRoom = async (roomId: string): Promise<Room | null> => {
    try {
      const docRef = doc(db, 'rooms', roomId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Room
      }
      return null
    } catch (error) {
      console.error('Error getting room:', error)
      throw error
    }
  }

  // Añadir un jugador a una sala
  const addPlayerToRoom = async (roomId: string, player: Omit<Player, 'joinedAt'>) => {
    try {
      const roomRef = doc(db, 'rooms', roomId)
      const roomSnap = await getDoc(roomRef)
      
      if (!roomSnap.exists()) {
        throw new Error('Room not found')
      }

      const roomData = roomSnap.data() as Room
      const newPlayer: Player = {
        ...player,
        joinedAt: new Date() // Usar Date() en lugar de serverTimestamp()
      }

      const updatedPlayers = [...roomData.players, newPlayer]
      
      await updateDoc(roomRef, {
        players: updatedPlayers
      })
    } catch (error) {
      console.error('Error adding player to room:', error)
      throw error
    }
  }

  // Actualizar el conteo de sushi de un jugador
  const updatePlayerSushiCount = async (roomId: string, playerId: string, newCount: number) => {
    try {
      const roomRef = doc(db, 'rooms', roomId)
      const roomSnap = await getDoc(roomRef)
      
      if (!roomSnap.exists()) {
        throw new Error('Room not found')
      }

      const roomData = roomSnap.data() as Room
      const updatedPlayers = roomData.players.map(player => 
        player.id === playerId 
          ? { ...player, sushiCount: newCount }
          : player
      )

      await updateDoc(roomRef, {
        players: updatedPlayers
      })
    } catch (error) {
      console.error('Error updating player sushi count:', error)
      throw error
    }
  }

  // Cerrar una sala
  const closeRoom = async (roomId: string) => {
    try {
      const roomRef = doc(db, 'rooms', roomId)
      await updateDoc(roomRef, {
        isActive: false
      })
    } catch (error) {
      console.error('Error closing room:', error)
      throw error
    }
  }

  // Remover un jugador de una sala
  const removePlayerFromRoom = async (roomId: string, playerId: string) => {
    try {
      const roomRef = doc(db, 'rooms', roomId)
      const roomSnap = await getDoc(roomRef)
      
      if (!roomSnap.exists()) {
        throw new Error('Room not found')
      }

      const roomData = roomSnap.data() as Room
      const updatedPlayers = roomData.players.filter(player => player.id !== playerId)
      
      await updateDoc(roomRef, {
        players: updatedPlayers
      })
    } catch (error) {
      console.error('Error removing player from room:', error)
      throw error
    }
  }

  // Agregar puntuación a una sala
  const addRoomRating = async (roomId: string, rating: Omit<RoomRating, 'id' | 'createdAt'>) => {
    try {
      const roomRef = doc(db, 'rooms', roomId)
      const roomSnap = await getDoc(roomRef)
      
      if (!roomSnap.exists()) {
        throw new Error('Room not found')
      }

      const roomData = roomSnap.data() as Room
      const newRating: RoomRating = {
        id: `${rating.playerId}-${Date.now()}`, // ID único
        ...rating,
        createdAt: serverTimestamp()
      }

      const updatedRatings = [...(roomData.ratings || []), newRating]
      
      await updateDoc(roomRef, {
        ratings: updatedRatings
      })
    } catch (error) {
      console.error('Error adding room rating:', error)
      throw error
    }
  }

  // Actualizar foto de la sala
  const updateRoomPhoto = async (roomId: string, photoUrl: string) => {
    try {
      const roomRef = doc(db, 'rooms', roomId)
      await updateDoc(roomRef, {
        photo: photoUrl
      })
    } catch (error) {
      console.error('Error updating room photo:', error)
      throw error
    }
  }

  // Actualizar ubicación de la sala
  const updateRoomLocation = async (roomId: string, location: string) => {
    try {
      const roomRef = doc(db, 'rooms', roomId)
      await updateDoc(roomRef, {
        location: location
      })
    } catch (error) {
      console.error('Error updating room location:', error)
      throw error
    }
  }

  return {
    rooms,
    loading,
    createRoom,
    getRoom,
    addPlayerToRoom,
    updatePlayerSushiCount,
    closeRoom,
    removePlayerFromRoom,
    addRoomRating,
    updateRoomPhoto,
    updateRoomLocation
  }
} 