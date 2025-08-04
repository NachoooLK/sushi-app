export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface Player {
  id: string;
  name: string;
  sushiCount: number;
  joinedAt: any;
}

export interface Room {
  id: string;
  name: string;
  createdAt: any;
  players: Player[];
  isActive: boolean;
  createdBy: string;
}

export interface GameResult {
  id: string;
  roomId: string;
  roomName: string;
  winner: string;
  winnerName: string;
  totalSushi: number;
  players: Player[];
  finishedAt: any;
  date: string; // YYYY-MM-DD format
}

export interface UserStats {
  totalSushi: number;
  gamesPlayed: number;
  wins: number;
  dailySushi: { [date: string]: number };
} 