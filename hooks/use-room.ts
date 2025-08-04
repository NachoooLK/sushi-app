import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Room, Player } from './use-rooms'

export const useRoom = (roomId: string) => {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomId) {
      setLoading(false)
      return
    }

    const roomRef = doc(db, 'rooms', roomId)
    
    const unsubscribe = onSnapshot(
      roomRef,
      (doc) => {
        if (doc.exists()) {
          const roomData = { id: doc.id, ...doc.data() } as Room
          setRoom(roomData)
          setError(null)
        } else {
          setRoom(null)
          setError('Room not found')
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error listening to room:', error)
        setError('Error loading room')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [roomId])

  return { room, loading, error }
} 