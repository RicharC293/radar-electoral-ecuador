# Election Radar

Base inicial de una plataforma de encuestas de intencion de voto sobre Firebase.

## Stack

- Next.js App Router
- Firebase Firestore, Auth, Storage y Functions
- Tailwind CSS
- Framer Motion

## Requisitos

- Node.js `20.9+`
- Firebase CLI

## Primer arranque

1. Copia `.env.example` a `.env.local`.
2. Completa variables Firebase y Upstash.
3. Para `firebase-admin`, puedes usar el JSON inline en `FIREBASE_SERVICE_ACCOUNT_KEY` o una ruta local en `FIREBASE_SERVICE_ACCOUNT_KEY_PATH`.
4. Crea el usuario admin en Firebase Authentication con proveedor `Email/Password`.
5. Opcional: define `ADMIN_EMAIL` si quieres restringir todavia mas el panel a un correo exacto.
6. Define `APP_SECRET` para hashear fingerprint e IP en el backend.
7. Instala dependencias del root y de `functions/`.
8. Despliega reglas e indices.
9. Despliega functions.

## Deploys

- Deploy completo de Firebase:
  `npm run firebase:deploy`
- Deploy automatico al detectar cambios en reglas, indices o `functions/`:
  `npm run firebase:deploy:watch`

## Estructura

- `src/`: frontend y hooks realtime
- `functions/`: backend transaccional de Firebase
- `firestore.rules`: reglas Firestore
- `storage.rules`: reglas de Storage

## Nota

- Las solicitudes de candidatos quedan registradas y moderadas desde Firestore en el panel admin.
- El panel admin usa login `email/password` y no expone registro publico.
- Si no defines `ADMIN_EMAIL`, el panel acepta usuarios creados manualmente en Firebase Authentication con proveedor `password`.
# radar-electoral-ecuador
