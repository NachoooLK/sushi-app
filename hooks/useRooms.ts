import { useState, useEffect } from 'react';
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
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Room, Player } from '../types';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener todas las salas activas
  useEffect(() => {
    const q = query(
      collection(db, 'rooms'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData: Room[] = [];
      snapshot.forEach((doc) => {
        roomsData.push({ id: doc.id, ...doc.data() } as Room);
      });
      setRooms(roomsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Crear una nueva sala
  const createRoom = async (name: string, userId: string, userName: string): Promise<string> => {
    try {
      const roomData = {
        name,
        createdAt: serverTimestamp(),
        players: [{
          id: userId,
          name: userName,
          sushiCount: 0,
          joinedAt: serverTimestamp(),
        }],
        isActive: true,
        createdBy: userId
      };
      
      const docRef = await addDoc(collection(db, 'rooms'), roomData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  // Obtener una sala específica
  const getRoom = async (roomId: string): Promise<Room | null> => {
    try {
      const docRef = doc(db, 'rooms', roomId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Room;
      }
      return null;
    } catch (error) {
      console.error('Error getting room:', error);
      throw error;
    }
  };

  // Añadir un jugador a una sala
  const addPlayerToRoom = async (roomId: string, player: Omit<Player, 'joinedAt'>) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const newPlayer: Player = {
        ...player,
        joinedAt: serverTimestamp()
      };

      await updateDoc(roomRef, {
        players: arrayUnion(newPlayer)
      });
    } catch (error) {
      console.error('Error adding player to room:', error);
      throw error;
    }
  };

  // Actualizar el conteo de sushi de un jugador
  const updatePlayerSushiCount = async (roomId: string, playerId: string, newCount: number) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        throw new Error('Room not found');
      }

      const roomData = roomSnap.data() as Room;
      const updatedPlayers = roomData.players.map(player => 
        player.id === playerId 
          ? { ...player, sushiCount: newCount }
          : player
      );

      await updateDoc(roomRef, {
        players: updatedPlayers
      });
    } catch (error) {
      console.error('Error updating player sushi count:', error);
      throw error;
    }
  };

  // Remover un jugador de una sala
  const removePlayerFromRoom = async (roomId: string, playerId: string) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        throw new Error('Room not found');
      }

      const roomData = roomSnap.data() as Room;
      const playerToRemove = roomData.players.find(p => p.id === playerId);
      
      if (playerToRemove) {
        await updateDoc(roomRef, {
          players: arrayRemove(playerToRemove)
        });
      }
    } catch (error) {
      console.error('Error removing player from room:', error);
      throw error;
    }
  };

  // Cerrar una sala
  const closeRoom = async (roomId: string) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        isActive: false
      });
    } catch (error) {
      console.error('Error closing room:', error);
      throw error;
    }
  };

  return {
    rooms,
    loading,
    createRoom,
    getRoom,
    addPlayerToRoom,
    updatePlayerSushiCount,
    removePlayerFromRoom,
    closeRoom
  };
}; 