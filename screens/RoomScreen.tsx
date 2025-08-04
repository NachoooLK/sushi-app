import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRooms } from '../hooks/useRooms';
import { useAuth } from '../hooks/useAuth';
import { useRankings } from '../hooks/useRankings';

export default function RoomScreen({ route, navigation }: any) {
  const { roomId } = route.params;
  const { user } = useAuth();
  const { getRoom, updatePlayerSushiCount, closeRoom, removePlayerFromRoom } = useRooms();
  const { finishGame } = useRankings();
  
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const roomData = await getRoom(roomId);
        if (roomData) {
          setRoom(roomData);
        } else {
          Alert.alert('Error', 'Sala no encontrada');
          navigation.goBack();
        }
      } catch (error: any) {
        Alert.alert('Error', error.message);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomId]);

  // Escuchar cambios en la sala en tiempo real
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = getRoom(roomId).then((roomData) => {
      if (roomData) {
        setRoom(roomData);
      }
    });

    return () => {
      // Cleanup si es necesario
    };
  }, [roomId]);

  const handleSushiCount = async (increment: number) => {
    if (!room || !user || updating) return;

    const currentPlayer = room.players.find((p: any) => p.id === user.uid);
    if (!currentPlayer) return;

    const newCount = Math.max(0, currentPlayer.sushiCount + increment);
    setUpdating(true);

    try {
      await updatePlayerSushiCount(roomId, user.uid, newCount);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleFinishGame = async () => {
    if (!room || !user) return;

    Alert.alert(
      'Terminar juego',
      '¿Estás seguro de que quieres terminar el juego?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Terminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await finishGame(room);
              Alert.alert(
                '¡Juego terminado!',
                'Los resultados han sido guardados',
                [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleLeaveRoom = async () => {
    if (!room || !user) return;

    Alert.alert(
      'Salir de la sala',
      '¿Estás seguro de que quieres salir de la sala?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await removePlayerFromRoom(roomId, user.uid);
              navigation.navigate('Dashboard');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b35" />
        <Text style={styles.loadingText}>Cargando sala...</Text>
      </View>
    );
  }

  if (!room || !user) {
    return null;
  }

  const currentPlayer = room.players.find((p: any) => p.id === user.uid);
  const sortedPlayers = [...room.players].sort((a: any, b: any) => b.sushiCount - a.sushiCount);
  const isCreator = room.createdBy === user.uid;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.roomName}>{room.name}</Text>
        <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveRoom}>
          <Text style={styles.leaveButtonText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Contador personal */}
        {currentPlayer && (
          <View style={styles.counterContainer}>
            <Text style={styles.counterTitle}>Tu contador</Text>
            <Text style={styles.counterNumber}>{currentPlayer.sushiCount}</Text>
            <Text style={styles.sushiEmoji}>🍣</Text>
            
            <View style={styles.counterButtons}>
              <TouchableOpacity
                style={[styles.counterButton, currentPlayer.sushiCount === 0 && styles.disabledButton]}
                onPress={() => handleSushiCount(-1)}
                disabled={updating || currentPlayer.sushiCount === 0}
              >
                <Text style={styles.counterButtonText}>-</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => handleSushiCount(1)}
                disabled={updating}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Ranking */}
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingTitle}>🏆 Ranking de la sala</Text>
          <View style={styles.playersList}>
            {sortedPlayers.map((player: any, index: number) => (
              <View
                key={player.id}
                style={[
                  styles.playerCard,
                  player.id === user.uid && styles.currentPlayerCard
                ]}
              >
                <View style={styles.playerInfo}>
                  <Text style={styles.playerRank}>#{index + 1}</Text>
                  <Text style={styles.playerName}>{player.name}</Text>
                  {player.id === user.uid && <Text style={styles.youText}>Tú</Text>}
                </View>
                <Text style={styles.playerSushi}>🍣 {player.sushiCount}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Controles del creador */}
        {isCreator && (
          <View style={styles.creatorContainer}>
            <Text style={styles.creatorTitle}>Controles del creador</Text>
            <TouchableOpacity style={styles.finishButton} onPress={handleFinishGame}>
              <Text style={styles.finishButtonText}>🏆 Terminar juego</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#ff6b35',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  leaveButton: {
    padding: 8,
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  counterContainer: {
    backgroundColor: '#fff8f0',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff6b35',
  },
  counterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  counterNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  sushiEmoji: {
    fontSize: 60,
    marginVertical: 10,
  },
  counterButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  counterButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  counterButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  rankingContainer: {
    marginBottom: 20,
  },
  rankingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  playersList: {
    gap: 10,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  currentPlayerCard: {
    backgroundColor: '#fff0e6',
    borderWidth: 2,
    borderColor: '#ff6b35',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    width: 30,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  youText: {
    fontSize: 12,
    color: '#ff6b35',
    fontWeight: 'bold',
  },
  playerSushi: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  creatorContainer: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  creatorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  finishButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 