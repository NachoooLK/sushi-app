#!/bin/bash

# Crear DashboardScreen
cat > screens/DashboardScreen.tsx << 'EOF'
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useRooms } from '../hooks/use-rooms';

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { rooms, loading } = useRooms();
  const [activeTab, setActiveTab] = useState('rooms');

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleCreateRoom = () => {
    navigation.navigate('CreateRoom');
  };

  const handleJoinRoom = () => {
    navigation.navigate('JoinRoom');
  };

  const handleRoomPress = (roomId: string) => {
    navigation.navigate('Room', { roomId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🍣 Sushi Counter</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.welcomeText}>
        ¡Hola {user?.displayName || user?.email}!
      </Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rooms' && styles.activeTab]}
          onPress={() => setActiveTab('rooms')}
        >
          <Text style={[styles.tabText, activeTab === 'rooms' && styles.activeTabText]}>
            Salas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCreateRoom}>
              <Text style={styles.actionButtonText}>➕ Crear Sala</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleJoinRoom}>
              <Text style={styles.actionButtonText}>🔗 Unirse a Sala</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Salas Activas ({rooms.length})</Text>
          
          {loading ? (
            <Text style={styles.loadingText}>Cargando salas...</Text>
          ) : rooms.length === 0 ? (
            <Text style={styles.emptyText}>No hay salas activas. ¡Crea una nueva!</Text>
          ) : (
            <View style={styles.roomsList}>
              {rooms.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={styles.roomCard}
                  onPress={() => handleRoomPress(room.id)}
                >
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <Text style={styles.roomPlayers}>
                      {room.players.length} jugadores
                    </Text>
                  </View>
                  <Text style={styles.roomId}>{room.id.slice(0, 8)}...</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#ff6b35',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
    padding: 20,
    paddingTop: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#eee',
  },
  activeTab: {
    borderBottomColor: '#ff6b35',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#ff6b35',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ff6b35',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  roomsList: {
    marginBottom: 20,
  },
  roomCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  roomPlayers: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  roomId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
});
EOF

# Crear CreateRoomScreen
cat > screens/CreateRoomScreen.tsx << 'EOF'
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRooms } from '../hooks/use-rooms';
import { useAuth } from '../hooks/useAuth';

export default function CreateRoomScreen({ navigation }: any) {
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const { createRoom } = useRooms();
  const { user } = useAuth();

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la sala');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Debes estar autenticado para crear una sala');
      return;
    }

    setLoading(true);
    try {
      const roomId = await createRoom(roomName);
      Alert.alert(
        '¡Sala creada!',
        'Tu sala ha sido creada exitosamente',
        [{ text: 'OK', onPress: () => navigation.navigate('Room', { roomId }) }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Crear Sala</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Nombre de la sala</Text>
          <TextInput
            style={styles.input}
            value={roomName}
            onChangeText={setRoomName}
            placeholder="Ej: Cena de sushi con amigos"
            autoFocus
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleCreateRoom}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creando...' : 'Crear Sala'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#ff6b35',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
EOF

# Crear JoinRoomScreen
cat > screens/JoinRoomScreen.tsx << 'EOF'
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRooms } from '../hooks/use-rooms';
import { useAuth } from '../hooks/useAuth';

export default function JoinRoomScreen({ navigation }: any) {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const { getRoom, addPlayerToRoom } = useRooms();
  const { user } = useAuth();

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      Alert.alert('Error', 'Por favor ingresa el ID de la sala');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Debes estar autenticado para unirte a una sala');
      return;
    }

    setLoading(true);
    try {
      const room = await getRoom(roomId);

      if (!room) {
        Alert.alert('Error', 'Sala no encontrada. Verifica el ID');
        return;
      }

      if (!room.isActive) {
        Alert.alert('Error', 'Esta sala ya no está activa');
        return;
      }

      const isAlreadyInRoom = room.players.some((player: any) => player.id === user.uid);
      if (isAlreadyInRoom) {
        navigation.navigate('Room', { roomId });
        return;
      }

      if (room.players.length >= 6) {
        Alert.alert('Error', 'Esta sala ya tiene el máximo de jugadores');
        return;
      }

      await addPlayerToRoom(roomId, {
        id: user.uid,
        name: user.displayName,
        sushiCount: 0
      });

      Alert.alert(
        '¡Te has unido!',
        `Bienvenido a ${room.name}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Room', { roomId }) }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Unirse a Sala</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>ID de la sala</Text>
          <TextInput
            style={styles.input}
            value={roomId}
            onChangeText={setRoomId}
            placeholder="Pega el ID de la sala aquí"
            autoFocus
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleJoinRoom}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Uniéndose...' : 'Unirse a Sala'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            Pide el ID de la sala al creador para unirte
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#ff6b35',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
});
EOF

# Crear RoomScreen
cat > screens/RoomScreen.tsx << 'EOF'
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
import { useRooms } from '../hooks/use-rooms';
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
EOF

echo "Todas las pantallas han sido creadas exitosamente!" 