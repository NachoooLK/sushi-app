# Sushi Rush

Cuenta cada pieza del libre de sushi con tus amigos, con ranking en directo.

1. Alguien crea una **mesa** y comparte el código de 6 caracteres o el QR.
2. Cada comensal pulsa **+ Una pieza** cada vez que se come una. El ranking se mueve en tiempo real y avisa cuando alguien te adelanta.
3. El anfitrión **cierra la mesa**: se guarda la clasificación, se ve el podio y cada uno puede valorar el restaurante.
4. **Rankings** (hoy, semana, mes, siempre), **historial** y **estadísticas personales** salen de las mesas cerradas.

El modo solitario es una mesa sin invitados: cuenta para tus récords pero no como victoria.

## Diseño

La interfaz sigue el handoff "Sushi Rush (app web móvil)": diseño clean con neutros cálidos y un único acento verde, tipografía Geist, modo claro y oscuro (según el sistema) y versión de escritorio a dos columnas. Los tokens viven en `src/app/globals.css` y los componentes base en `src/components/ui.tsx`.

Rutas: `/` (inicio), `/mesa/nueva`, `/mesa/[código]` (mesa en directo o invitación), `/mesa/[código]/resultado`, `/rankings`, `/historial`, `/perfil`. El acceso se muestra en la misma URL, así un enlace de invitación sigue funcionando tras entrar.

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind CSS 4, desplegado en Vercel.
- Firebase Auth (Google, email y, opcionalmente, invitado anónimo) y Cloud Firestore con caché offline.
- Sin backend propio: la integridad la garantizan las reglas de `firestore.rules`.

## Modelo de datos

```
sessions/{CODE}                 Mesa. CODE = 6 caracteres sin 0/O/1/I.
  name, restaurant, location, hostId, hostName, status ('live' | 'finished'),
  createdAt, finishedAt, participantIds[], maxPlayers (10),
  results[] (foto final al cerrar), totalPieces, winnerIds[]

sessions/{CODE}/players/{uid}   Contador de cada comensal.
  name, photoURL, count, joinedAt, updatedAt, rating? (1-5), comment?
```

Cada comensal sólo escribe **su propio** documento con `increment()`, así dos personas sumando a la vez nunca se pisan. Las consultas no necesitan índices compuestos.

## Desarrollo

```bash
npm install
npm run dev            # contra el proyecto real de Firebase (sushi-e3a2b)
```

Con los emuladores de Firebase (necesitan Java 11+):

```bash
npm run emulators      # Auth en :9099, Firestore en :8080
npm run dev:emu        # la app apuntando a los emuladores, con acceso de invitado
npm run seed         # datos de ejemplo: entra con marta@test.dev / sushi123
npm run bot -- K7P2QX "Ana" 15 1500   # un comensal simulado se une y suma piezas
```

## Comprobaciones

```bash
npm run typecheck
npm test               # lógica de rankings, ganadores, códigos
npm run test:rules     # reglas de seguridad contra el emulador de Firestore
npm run build
```

## Despliegue

1. **Reglas de Firestore** (imprescindible, una vez):
   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore --project sushi-e3a2b
   ```
   O copia `firestore.rules` en Firebase Console → Firestore → Reglas → Publicar.
2. **Vercel**: el proyecto se despliega solo al hacer push a `main`. No hace falta ninguna variable de entorno.
3. **Opcional, acceso de invitado**: activa el proveedor *Anónimo* en Firebase Console → Authentication y añade `NEXT_PUBLIC_ENABLE_GUEST=1` en Vercel.
4. **Google**: el dominio de Vercel debe estar en Authentication → Settings → Dominios autorizados (las URLs de *preview* no lo están; el email sí funciona en ellas).

Los datos de la versión 1 (`users`, `rooms`, `games`) no se borran, pero las nuevas reglas los dejan inaccesibles desde la app.
