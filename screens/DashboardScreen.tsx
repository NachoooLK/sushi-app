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
import { useRooms } from '../hooks/useRooms';

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

  const handleRankings = () => {
    navigation.navigate('Rankings');
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
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rankings' && styles.activeTab]}
          onPress={() => setActiveTab('rankings')}
        >
          <Text style={[styles.tabText, activeTab === 'rankings' && styles.activeTabText]}>
            Rankings
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'rooms' ? (
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
        ) : (
          <View>
            <TouchableOpacity style={styles.rankingsButton} onPress={handleRankings}>
              <Text style={styles.rankingsButtonText}>🏆 Ver Rankings</Text>
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
  rankingsButton: {
    backgroundColor: '#ff6b35',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  rankingsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 