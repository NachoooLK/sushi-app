# 🍣 Sushi Counter Mobile App

Una aplicación móvil para contar piezas de sushi en tiempo real con amigos. Compite por ver quién come más sushi en cada sesión.

## ✨ Características

- **Autenticación de usuarios** con Firebase Auth
- **Salas en tiempo real** para jugar con amigos
- **Contador de sushi** sincronizado en tiempo real
- **Ranking por sesión** para ver quién va ganando
- **Ranking diario** y **ranking general**
- **Base de datos Firebase** para persistencia
- **Interfaz móvil** optimizada para iOS y Android

## 🚀 Funcionalidades

### 🔐 Autenticación
- Registro de usuarios con email y contraseña
- Inicio de sesión
- Perfil de usuario personalizado

### 🏠 Salas
- **Crear salas**: Los usuarios pueden crear nuevas salas de juego
- **Unirse a salas**: Usando el ID único de la sala
- **Máximo 6 jugadores** por sala
- **Tiempo real**: Todos los cambios se sincronizan instantáneamente

### 🍣 Contador de Sushi
- **Botones + y -** para incrementar/decrementar el contador
- **Sincronización en tiempo real** entre todos los jugadores
- **Ranking en vivo** que se actualiza automáticamente
- **Contador personal** destacado para cada jugador

### 🏆 Rankings
- **Ranking por sesión**: Quién va ganando en la sala actual
- **Ranking diario**: Mejores jugadores del día
- **Ranking general**: Estadísticas globales
- **Estadísticas personales**: Total de sushi, partidas jugadas, victorias

### 📊 Estadísticas
- **Total de sushi** consumido por usuario
- **Partidas jugadas** y **victorias**
- **Sushi por día** para seguimiento diario
- **Historial de juegos** terminados

## 🛠️ Tecnologías

- **React Native** con Expo
- **Firebase** (Auth, Firestore)
- **React Navigation** para navegación
- **TypeScript** para tipado seguro
- **Real-time updates** con Firestore listeners

## 📱 Instalación

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Expo CLI: `npm install -g @expo/cli`

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd sushi-counter-mobile
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**
- Asegúrate de que las credenciales de Firebase estén configuradas en `lib/firebase.ts`
- Las credenciales ya están incluidas en el código

4. **Ejecutar la aplicación**
```bash
# Para iOS
npm run ios

# Para Android
npm run android

# Para desarrollo web
npm run web
```

## 🎮 Cómo usar la app

### 1. Registro/Login
- Abre la app
- Regístrate con tu email y contraseña
- O inicia sesión si ya tienes cuenta

### 2. Crear una sala
- En el dashboard, toca "➕ Crear Sala"
- Escribe un nombre para la sala
- Se creará automáticamente y te llevará a la sala

### 3. Unirse a una sala
- En el dashboard, toca "🔗 Unirse a Sala"
- Pega el ID de la sala que te compartió un amigo
- O selecciona una sala de la lista de salas activas

### 4. Jugar
- Usa los botones + y - para contar tu sushi
- Ve el ranking en tiempo real
- El creador puede terminar el juego cuando quiera

### 5. Ver rankings
- Ve a la pestaña "Rankings" en el dashboard
- Consulta rankings diarios y generales

## 🏗️ Estructura del proyecto

```
sushi-counter-mobile/
├── lib/
│   └── firebase.ts          # Configuración de Firebase
├── hooks/
│   ├── useAuth.ts           # Hook de autenticación
│   ├── useRooms.ts          # Hook para manejar salas
│   └── useRankings.ts       # Hook para rankings
├── screens/
│   ├── LoginScreen.tsx      # Pantalla de login
│   ├── DashboardScreen.tsx  # Pantalla principal
│   ├── CreateRoomScreen.tsx # Crear sala
│   ├── JoinRoomScreen.tsx   # Unirse a sala
│   └── RoomScreen.tsx       # Pantalla de juego
├── types/
│   └── index.ts             # Tipos TypeScript
└── App.tsx                  # Componente principal
```

## 🔥 Base de datos Firebase

### Colecciones

#### `users`
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  totalSushi: number,
  gamesPlayed: number,
  wins: number,
  dailySushi: { [date: string]: number }
}
```

#### `rooms`
```typescript
{
  id: string,
  name: string,
  createdAt: timestamp,
  players: Player[],
  isActive: boolean,
  createdBy: string
}
```

#### `games`
```typescript
{
  id: string,
  roomId: string,
  roomName: string,
  winner: string,
  winnerName: string,
  totalSushi: number,
  players: Player[],
  finishedAt: timestamp,
  date: string
}
```

## 📱 Características móviles

- **Diseño responsive** para diferentes tamaños de pantalla
- **Navegación intuitiva** con gestos
- **Interfaz optimizada** para uso táctil
- **Notificaciones** para cambios importantes
- **Modo offline** básico (datos en caché)

## 🚀 Despliegue

### Para desarrollo
```bash
npm run dev
```

### Para producción
```bash
# Build para iOS
expo build:ios

# Build para Android
expo build:android
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo
- Consulta la documentación de Firebase

---

¡Disfruta contando sushi con tus amigos! 🍣 