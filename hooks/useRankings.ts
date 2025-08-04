import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  increment,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Room } from './use-rooms';

export interface GameResult {
  id: string;
  roomId: string;
  roomName: string;
  winner: string;
  winnerName: string;
  totalSushi: number;
  players: any[];
  finishedAt: any;
  date: string; // YYYY-MM-DD format
}

export interface UserStats {
  id?: string;
  totalSushi: number;
  gamesPlayed: number;
  wins: number;
  dailySushi: { [date: string]: number };
}

export const useRankings = () => {
  const [dailyRankings, setDailyRankings] = useState<GameResult[]>([]);
  const [globalRankings, setGlobalRankings] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener rankings del día
  const getDailyRankings = async (date: string) => {
    try {
      const q = query(
        collection(db, 'games'),
        where('date', '==', date),
        orderBy('totalSushi', 'desc')
      );

      const snapshot = await getDocs(q);
      const results: GameResult[] = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as GameResult);
      });
      setDailyRankings(results);
    } catch (error) {
      console.error('Error getting daily rankings:', error);
    }
  };

  // Obtener rankings globales
  const getGlobalRankings = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('totalSushi', 'desc')
      );

      const snapshot = await getDocs(q);
      const results: UserStats[] = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as UserStats);
      });
      setGlobalRankings(results);
    } catch (error) {
      console.error('Error getting global rankings:', error);
    }
  };

  // Finalizar un juego y guardar resultados
  const finishGame = async (room: Room) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Encontrar el ganador
      const winner = room.players.reduce((prev, current) => 
        (prev.sushiCount > current.sushiCount ? prev : current)
      );

      // Guardar el resultado del juego
      const gameResult: Omit<GameResult, 'id'> = {
        roomId: room.id,
        roomName: room.name,
        winner: winner.id,
        winnerName: winner.name,
        totalSushi: winner.sushiCount,
        players: room.players,
        finishedAt: serverTimestamp(),
        date: today
      };

      await addDoc(collection(db, 'games'), gameResult);

      // Actualizar estadísticas de usuarios
      for (const player of room.players) {
        const userRef = doc(db, 'users', player.id);
        await updateDoc(userRef, {
          totalSushi: increment(player.sushiCount),
          gamesPlayed: increment(1),
          [`dailySushi.${today}`]: increment(player.sushiCount),
          ...(player.id === winner.id && { wins: increment(1) }),
        });
      }

      return gameResult;
    } catch (error) {
      console.error('Error finishing game:', error);
      throw error;
    }
  };

  // Obtener estadísticas de un usuario
  const getUserStats = async (userId: string): Promise<UserStats | null> => {
    try {
      const userSnap = await getDocs(collection(db, 'users'));
      
      // Buscar el usuario específico
      let userStats: UserStats | null = null;
      userSnap.forEach((doc) => {
        if (doc.id === userId) {
          userStats = { id: doc.id, ...doc.data() } as UserStats;
        }
      });

      return userStats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    getDailyRankings(today);
    getGlobalRankings();
    setLoading(false);
  }, []);

  return {
    dailyRankings,
    globalRankings,
    loading,
    getDailyRankings,
    getGlobalRankings,
    finishGame,
    getUserStats
  };
}; 