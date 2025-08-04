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
import { useRooms } from '../hooks/useRooms';
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
      // Buscar la sala
      const room = await getRoom(roomId);

      if (!room) {
        Alert.alert('Error', 'Sala no encontrada. Verifica el ID');
        return;
      }

      if (!room.isActive) {
        Alert.alert('Error', 'Esta sala ya no está activa');
        return;
      }

      // Verificar si el usuario ya está en la sala
      const isAlreadyInRoom = room.players.some((player: any) => player.id === user.uid);
      if (isAlreadyInRoom) {
        navigation.navigate('Room', { roomId });
        return;
      }

      // Verificar si la sala está llena (máximo 6 jugadores)
      if (room.players.length >= 6) {
        Alert.alert('Error', 'Esta sala ya tiene el máximo de jugadores');
        return;
      }

      // Añadir jugador a la sala
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