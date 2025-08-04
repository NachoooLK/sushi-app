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
      const roomId = await createRoom(roomName, user.uid, user.displayName);
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