# Arquitectura V2

## Objetivo

Plataforma web de encuestas informales de intención de voto para Ecuador, con resultados en tiempo real y una vista inmersiva para proyección pública.

La versión original del prompt es una buena base visual, pero requiere algunos ajustes para que sea consistente en producción:

- El voto debe deduplicarse por encuesta, no por candidato.
- La verificación y la escritura del voto no deben hacerse con `query + batch`, sino con transacción para evitar carreras.
- No conviene persistir IPs en claro en Firestore.
- La jerarquía de datos debe agruparse por encuesta para soportar múltiples procesos electorales sin mezclar resultados.

## Decisiones principales

### 1. La encuesta es la unidad raíz

En vez de colecciones globales planas, el agregado principal será `polls/{pollId}`.

Esto evita mezclar:

- presidencia vs alcaldía
- una provincia vs otra
- encuestas activas vs archivadas

### 2. Un voto por encuesta

La validación no debe ser `IP + fingerprint + candidateId`, porque eso permite votar una vez por cada candidato.

La regla correcta es:

- un voto por `pollId` y `fingerprintHash`
- la IP se usa para rate limiting y señales de fraude, no como identidad principal

### 3. Persistir hashes, no IPs en claro

Para reducir riesgo legal y de privacidad:

- usar `fingerprintHash = sha256(APP_SECRET + fingerprint)`
- usar `ipHash = sha256(APP_SECRET + ipNormalizada)`
- almacenar ubicación aproximada, no coordenadas exactas si no son estrictamente necesarias

La IP en claro puede vivir solo en Redis para rate limiting temporal y en logs efímeros del backend.

### 4. Cloud Function como única fuente de escritura

El cliente no escribe votos directo en Firestore.

Flujo correcto:

1. cliente captura fingerprint y geolocalización
2. cliente llama `registerVote`
3. Cloud Function valida, deduplica y escribe en transacción
4. Firestore listeners actualizan vistas públicas

La API Route de Next.js es opcional. Si existe, debe ser solo un proxy o fachada, no una segunda ruta de negocio.

### 5. Middleware no sustituye validación

El `middleware.ts` puede frenar abuso general del sitio, pero el límite real de votos debe validarse dentro de `registerVote`.

## Arquitectura propuesta

### Frontend

- `Next.js 14+` con App Router
- `Tailwind CSS` para layout y tokens visuales
- `Framer Motion` para podio, reorder y microanimaciones
- RSC para landing y shell
- Client Components para listeners de Firestore y UX de votación

### Backend

- `Firebase Firestore` para datos transaccionales y realtime
- `Firebase Authentication` para panel admin
- `Firebase Storage` para fotos de candidatos
- `Firebase Cloud Functions` para registrar votos y automatizaciones
- `Upstash Redis` para rate limit y contadores efímeros por IP

## Modelo de datos revisado

### `polls/{pollId}`

```ts
interface Poll {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  electionType: 'presidencia' | 'prefectura' | 'alcaldia';
  province: string | null;
  status: 'draft' | 'live' | 'paused' | 'closed' | 'archived';
  isPublic: boolean;
  startsAt: Timestamp | null;
  endsAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `polls/{pollId}/candidates/{candidateId}`

```ts
interface Candidate {
  id: string;
  fullName: string;
  party: string;
  photoUrl: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Timestamp;
}
```

### `polls/{pollId}/voteCounts/{candidateId}`

```ts
interface VoteCount {
  candidateId: string;
  totalVotes: number;
  percentage: number;
  lastUpdated: Timestamp;
}
```

### `polls/{pollId}/stats/current`

```ts
interface PollStats {
  totalVotes: number;
  totalVotersToday: number;
  uniqueProvinces: number;
  lastVoteAt: Timestamp | null;
  lastVoteCity: string | null;
  lastVoteCandidateId: string | null;
}
```

### `polls/{pollId}/statsDaily/{yyyyMMdd}`

```ts
interface PollDailyStats {
  dateKey: string;
  totalVotes: number;
  uniqueVoters: number;
  uniqueProvinces: number;
  updatedAt: Timestamp;
}
```

### `polls/{pollId}/votes/{voteId}`

Documento de auditoría del voto emitido.

```ts
interface Vote {
  id: string;
  candidateId: string;
  fingerprintHash: string;
  ipHash: string;
  city: string | null;
  province: string | null;
  country: string;
  latitudeApprox: number | null;
  longitudeApprox: number | null;
  userAgent: string;
  createdAt: Timestamp;
}
```

### `polls/{pollId}/voterLocks/{fingerprintHash}`

Documento determinístico usado para impedir más de un voto por encuesta.

```ts
interface VoterLock {
  fingerprintHash: string;
  candidateId: string;
  createdAt: Timestamp;
}
```

### `candidateRequests/{requestId}`

```ts
interface CandidateRequest {
  id: string;
  pollId: string | null;
  requesterName: string;
  requesterContact: string;
  candidateName: string;
  candidateParty: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}
```

### `fraudSignals/{signalId}`

Colección opcional solo de backend para registrar rechazo, repetición o picos sospechosos.

```ts
interface FraudSignal {
  pollId: string;
  fingerprintHash?: string;
  ipHash?: string;
  reason:
    | 'duplicate_vote'
    | 'rate_limited'
    | 'inactive_candidate'
    | 'closed_poll'
    | 'bot_user_agent'
    | 'geo_anomaly';
  createdAt: Timestamp;
  metadata?: Record<string, string | number | boolean | null>;
}
```

## Flujo de voto correcto

### Cliente

1. carga candidatos y resultados en tiempo real
2. obtiene `visitorId` y geolocalización
3. llama `registerVote({ pollId, candidateId, fingerprint, geo })`

### `registerVote`

1. validar payload
2. resolver IP de forma confiable
3. normalizar `user-agent`
4. aplicar rate limit por IP en Redis
5. hashear `fingerprint` e IP con secreto del servidor
6. abrir transacción Firestore
7. leer `poll`, `candidate`, `voterLocks/{fingerprintHash}`, `stats/current`
8. abortar si:
   - encuesta no existe o no está `live`
   - candidato no existe o está inactivo
   - ya existe `voterLock`
9. escribir en la misma transacción:
   - crear `votes/{voteId}`
   - crear `voterLocks/{fingerprintHash}`
   - incrementar `voteCounts/{candidateId}.totalVotes`
   - actualizar `stats/current`
   - actualizar `statsDaily/{yyyyMMdd}`
10. recalcular porcentajes o delegar a una segunda función de agregación
11. devolver totales actualizados

### Por qué transacción y no batch

`query + batch` no evita doble voto cuando entran dos requests simultáneos.

La transacción con documento determinístico sí lo evita porque una de las dos operaciones fallará al encontrar el lock ya creado.

## Realtime para resultados

### Landing

Escucha:

- `polls/{pollId}/candidates`
- `polls/{pollId}/voteCounts`
- `polls/{pollId}/stats/current`

### Fullscreen `/resultados/[slug]`

Misma base, pero con:

- podio top 3
- ranking completo reordenable
- confetti al detectar aumento de `lastVoteCandidateId`
- ticker con `lastVoteCity`

### Recomendación de implementación

El hook debe fusionar candidatos con conteos en memoria y no depender de que ambos snapshots lleguen en el mismo orden.

También conviene ignorar la primera emisión para no disparar confetti en el montaje inicial.

## Seguridad

### Firestore

- lectura pública solo para encuesta activa, candidatos activos, conteos y stats públicos
- escrituras públicas prohibidas para votos y agregados
- solicitudes de candidatos con `create` público y gestión solo admin

### Admin

- `Firebase Auth` con email
- claim `admin: true`
- verificación de ID token en server components, route handlers o middleware del área admin
- debe estar escondida detrás de ruta no obvia y sin enlaces visibles en la UI pública

### Storage

- uploads solo desde área admin autenticada
- rutas por encuesta y candidato
- validación de mime type y tamaño

## Reglas operativas

### Dedupe

- una vez por encuesta por `fingerprintHash`
- fallback: si no hay fingerprint, usar `ipHash + userAgentHash` con confianza menor y marcación de riesgo

### Rate limit

- `5 votos / hora / IP` en `registerVote`
- `20 requests / minuto / IP` en middleware para endpoints públicos

### Bot filtering

- bloquear user agents conocidos de automatización básica
- marcar patrones sospechosos, no necesariamente rechazar todos

### Geolocalización

- preferir permiso del navegador
- fallback por IP solo si el usuario no otorga permiso
- almacenar aproximación, no precisión total, salvo caso justificado

## Vista inmersiva

La propuesta visual es válida. Para mantener performance:

- usar canvas o DOM controlado para confetti, no librerías pesadas si no son necesarias
- limitar listeners a una sola encuesta activa
- animar solo propiedades GPU-friendly
- no recalcular layout completo en cada frame

## Riesgos que corrige esta versión

1. Doble voto por carrera concurrente.
2. Doble voto por votar una vez por cada candidato.
3. Mezcla de resultados de distintas elecciones o provincias.
4. Persistencia innecesaria de IP en claro.
5. Reset diario destructivo sin historial.
6. Dependencia de middleware para reglas que deben vivir en backend.

## Estructura sugerida

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── encuestas/[slug]/page.tsx
│   │   └── resultados/[slug]/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── encuestas/page.tsx
│   │   ├── encuestas/[pollId]/candidatos/page.tsx
│   │   └── solicitudes/page.tsx
│   └── api/
│       └── health/route.ts
├── components/
│   ├── results/
│   ├── voting/
│   ├── forms/
│   └── ui/
├── hooks/
├── lib/
│   ├── firebase/
│   ├── analytics/
│   ├── anti-fraud/
│   ├── rate-limit/
│   └── validation/
├── types/
└── middleware.ts

functions/
├── src/
│   ├── registerVote.ts
│   ├── onVoteCreated.ts
│   └── index.ts
├── firestore.rules
└── firestore.indexes.json
```

## Orden recomendado de implementación

1. Inicializar `Next.js`, Tailwind y Firebase.
2. Modelar `polls`, `candidates`, `voteCounts`, `stats`.
3. Implementar `registerVote` con transacción y dedupe.
4. Montar landing con resultados inline y grid de candidatos.
5. Montar `/resultados/[slug]`.
6. Montar admin y uploads.
7. Afinar anti-fraude y observabilidad.

## Decisión final

La combinación `Next.js + Firestore + Functions + Upstash` sí encaja con este producto.

Pero para que sea robusta, la clave no está en la UI sino en estas tres decisiones:

- modelar por encuesta
- deduplicar por lock transaccional
- no almacenar identificadores sensibles en claro
