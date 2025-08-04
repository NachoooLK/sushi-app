# 🍣 Instrucciones para ejecutar Sushi Counter Mobile

## 📱 Cómo ejecutar la aplicación móvil

### Prerrequisitos
1. **Node.js** (versión 16 o superior)
2. **npm** o **yarn**
3. **Expo CLI**: `npm install -g @expo/cli`
4. **Expo Go** app en tu dispositivo móvil (iOS/Android)

### Pasos para ejecutar

1. **Navegar al directorio de la app móvil**
```bash
cd /Users/usuario/projects/sushi-counter-mobile
```

2. **Instalar dependencias** (si no están instaladas)
```bash
npm install
```

3. **Ejecutar la aplicación**
```bash
npm start
# o
npm run dev
```

4. **Conectar tu dispositivo**
- Abre la app **Expo Go** en tu dispositivo móvil
- Escanea el código QR que aparece en la terminal
- La app se cargará automáticamente

### Alternativas para ejecutar

#### Para iOS Simulator
```bash
npm run ios
```

#### Para Android Emulator
```bash
npm run android
```

#### Para desarrollo web
```bash
npm run web
```

## 🔧 Solución de problemas

### Si aparece "next: command not found"
- Asegúrate de estar en el directorio correcto: `/Users/usuario/projects/sushi-counter-mobile`
- No estés en el directorio de la app web (`sushi-counter-app`)

### Si hay errores de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

### Si Expo no funciona
```bash
npm install -g @expo/cli
expo start
```

## 📱 Funcionalidades de la app

### 🔐 Autenticación
- **Registro**: Crea una cuenta con email y contraseña
- **Login**: Inicia sesión con tu cuenta
- **Logout**: Cierra sesión desde el dashboard

### 🏠 Salas
- **Crear sala**: Toca "➕ Crear Sala" y escribe un nombre
- **Unirse a sala**: Usa "🔗 Unirse a Sala" con el ID
- **Lista de salas**: Ve las salas activas en el dashboard

### 🍣 Contador de Sushi
- **Botones + y -**: Incrementa/decrementa tu contador
- **Tiempo real**: Los cambios se sincronizan instantáneamente
- **Ranking en vivo**: Ve quién va ganando en la sala

### 🏆 Rankings
- **Ranking por sesión**: Quién va ganando en la sala actual
- **Ranking diario**: Mejores jugadores del día
- **Ranking general**: Estadísticas globales

## 🚀 Características técnicas

- **React Native** con Expo
- **Firebase** para autenticación y base de datos
- **Tiempo real** con Firestore listeners
- **TypeScript** para tipado seguro
- **Navegación** con React Navigation

## 📊 Base de datos

La app usa Firebase con las siguientes colecciones:
- `users`: Perfiles y estadísticas de usuarios
- `rooms`: Salas activas en tiempo real
- `games`: Historial de juegos terminados

## 🎮 Cómo jugar

1. **Regístrate** o inicia sesión
2. **Crea una sala** o únete a una existente
3. **Comparte el ID** de la sala con tus amigos
4. **Cuenta tu sushi** usando los botones + y -
5. **Ve el ranking** en tiempo real
6. **Termina el juego** cuando quieras (solo el creador)

¡Disfruta contando sushi con tus amigos! 🍣 