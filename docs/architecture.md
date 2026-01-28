# LiveListen MVP - Architecture Document

## System Overview

LiveListen is a real-time synchronized podcast listening application with chat and discussion features. The MVP is designed as a monorepo with clear separation between frontend, backend, and shared code.

## High-Level Architecture

```
┌─────────────────┐
│   Next.js Web   │  (apps/web)
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/REST
         │ WebSocket (Socket.IO)
         │
┌────────▼────────┐
│   Node.js API   │  (apps/api)
│   (Backend)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Postgres│ │ Redis │ (Optional, future)
│   DB   │ │ Cache │
└────────┘ └───────┘
```

## Tech Stack

### Frontend (apps/web)
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **State Management**: React Context + Hooks (or Zustand for complex state)
- **Real-time**: Socket.IO Client
- **UI**: Tailwind CSS + shadcn/ui (or similar component library)
- **Audio**: HTML5 Audio API or Howler.js

### Backend (apps/api)
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Real-time**: Socket.IO Server
- **ORM**: Prisma or TypeORM
- **Validation**: Zod (shared from packages/shared)

### Database
- **Primary DB**: PostgreSQL (via Docker Compose)
- **Future**: Redis for caching and session management

### Infrastructure
- **Containerization**: Docker Compose for local development
- **Deployment**: TBD (Vercel for frontend, Railway/Render for backend)

## System Components

### 1. Frontend (apps/web)

#### Pages/Routes
- `/` - Landing page (room creation/join)
- `/room/[roomId]` - Main room interface
  - Audio player (synchronized)
  - Chat panel
  - Discussion prompts panel
  - Evidence lookup panel
  - User list

#### Key Components
- `RoomProvider` - Context for room state
- `AudioPlayer` - Synchronized audio player
- `ChatPanel` - Real-time chat interface
- `PromptCards` - Discussion prompt cards
- `EvidencePanel` - Evidence lookup interface
- `UserList` - Active users in room
- `HostControls` - Host-only moderation controls

#### State Management
- Room state (current episode, playback position, users)
- Chat state (messages, typing indicators)
- User state (identity, role, permissions)
- Playback state (playing, position, duration)

### 2. Backend (apps/api)

#### API Structure
```
/api
  /rooms
    POST   /rooms              - Create room
    GET    /rooms/:roomId      - Get room details
    POST   /rooms/:roomId/join - Join room (validate invite)
  /episodes
    POST   /episodes/rss       - Parse RSS feed
    GET    /episodes/:id       - Get episode details
  /users
    POST   /users              - Create/register user (name only)
```

#### Socket.IO Namespaces
- `/room/:roomId` - Room-specific namespace
  - All room events (playback, chat, moderation)

#### Key Services
- `RoomService` - Room CRUD, user management
- `PlaybackService` - Playback state synchronization
- `ChatService` - Message handling, moderation
- `RSSService` - RSS feed parsing
- `ModerationService` - Host actions (mute/kick/ban)

### 3. Shared Package (packages/shared)

#### Types & DTOs
- Room types
- User types
- Episode types
- Chat message types
- Playback state types
- Socket event types

#### Validators
- Zod schemas for all DTOs
- Validation utilities

#### Constants
- Socket event names
- API endpoints
- Error codes

## Data Model

### Database Schema (PostgreSQL)

#### `rooms`
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code VARCHAR(255) UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  episode_id UUID,
  episode_url TEXT,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb, -- slow_mode, etc.
  is_active BOOLEAN DEFAULT true
);
```

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  session_id VARCHAR(255), -- Temporary session identifier
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `room_users` (Join table)
```sql
CREATE TABLE room_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  is_muted BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  role VARCHAR(20) DEFAULT 'participant', -- 'host' | 'participant'
  UNIQUE(room_id, user_id)
);
```

#### `episodes`
```sql
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  duration INTEGER, -- seconds
  published_at TIMESTAMP,
  podcast_title VARCHAR(500),
  podcast_author VARCHAR(255),
  rss_feed_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `bans`
```sql
CREATE TABLE bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);
```

### Indexes
```sql
CREATE INDEX idx_rooms_invite_code ON rooms(invite_code);
CREATE INDEX idx_room_users_room_id ON room_users(room_id);
CREATE INDEX idx_room_users_user_id ON room_users(user_id);
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_bans_room_user ON bans(room_id, user_id);
```

## Real-time Architecture

### Socket.IO Structure

#### Connection Flow
1. Client connects to Socket.IO server
2. Client joins room namespace: `/room/:roomId`
3. Server validates user can join (not banned, room exists)
4. Server emits room state to client
5. Client subscribes to room events

#### Event Categories
- **Playback events**: `play`, `pause`, `seek`, `sync`
- **Chat events**: `message`, `typing`, `message_pinned`
- **User events**: `user_joined`, `user_left`, `user_muted`
- **Moderation events**: `user_kicked`, `user_banned`, `slow_mode_toggled`
- **System events**: `error`, `room_state`, `sync_request`

### Playback Synchronization

#### Strategy
1. Host controls playback (play/pause/seek)
2. Host emits events to server
3. Server broadcasts to all clients in room
4. Clients update local player state
5. Periodic sync checks (every 5-10 seconds) to correct drift

#### Sync Protocol
- Host sends `playback_state` events with timestamp
- Clients compare local time with server time
- Clients adjust playback position if drift > 500ms

## Security Considerations

### MVP Security
- **Invite codes**: Cryptographically random, unguessable (UUID-based)
- **Input validation**: All inputs validated with Zod schemas
- **SQL injection**: Use parameterized queries (ORM handles this)
- **XSS prevention**: Sanitize chat messages, use React's built-in escaping
- **Rate limiting**: Basic rate limiting on API endpoints
- **CORS**: Configured for frontend domain only

### Future Security Enhancements
- User authentication (JWT tokens)
- HTTPS/WSS only
- Content Security Policy
- Rate limiting per user/IP
- DDoS protection

## Scalability Design

### Current (MVP)
- Single Node.js server instance
- Single PostgreSQL database
- Socket.IO with in-memory adapter
- <50 users per room, <10 concurrent rooms

### Future Scaling Path
- **Horizontal scaling**: Multiple API servers behind load balancer
- **Socket.IO scaling**: Redis adapter for multi-server Socket.IO
- **Database**: Read replicas, connection pooling
- **Caching**: Redis for frequently accessed data
- **CDN**: Static assets and audio files
- **Message queue**: For async tasks (episode processing, etc.)

## Environment Configuration Strategy

### Environment Variables

#### Backend (apps/api)
- **`APP_ENV`**: Environment identifier (`local`, `staging`, `production`)
  - Used for environment-specific logic (logging, error handling, feature flags)
  - Not exposed to client
- **`NODE_ENV`**: Node.js environment (`development`, `production`)
  - Controls Node.js optimizations and behavior
- **`DATABASE_URL`**: PostgreSQL connection string (environment-specific)
- **`CORS_ORIGIN`**: Allowed CORS origin (matches frontend URL per environment)
- **`SOCKET_IO_CORS_ORIGIN`**: Socket.IO CORS origin (matches frontend URL per environment)
- **`LOG_LEVEL`**: Logging verbosity (`debug`, `info`, `warn`, `error`)

#### Frontend (apps/web)
- **`NEXT_PUBLIC_APP_ENV`**: Public environment identifier (`local`, `staging`, `production`)
  - Exposed to browser (Next.js `NEXT_PUBLIC_*` prefix)
  - Used for environment-specific API URLs, feature flags, analytics
- **`NEXT_PUBLIC_API_URL`**: Public API base URL (environment-specific)
- **`NEXT_PUBLIC_WS_URL`**: Public WebSocket URL (environment-specific)
- **`NEXT_PUBLIC_APP_URL`**: Public app URL for generating invite links

### Environment Detection

#### Backend
```typescript
const APP_ENV = process.env.APP_ENV || 'local';
const isLocal = APP_ENV === 'local';
const isStaging = APP_ENV === 'staging';
const isProduction = APP_ENV === 'production';
```

#### Frontend
```typescript
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'local';
const isLocal = APP_ENV === 'local';
const isStaging = APP_ENV === 'staging';
const isProduction = APP_ENV === 'production';
```

### Environment-Specific Behavior

#### Local
- Hot reload enabled
- Debug logging
- Permissive CORS
- No error tracking
- No analytics
- Development database

#### Staging
- Production builds
- Info-level logging
- Restricted CORS
- Error tracking enabled (staging project)
- Analytics enabled (test events)
- Staging database (separate from production)

#### Production
- Production builds (optimized)
- Warn/error logging only
- Restricted CORS
- Error tracking enabled (production project)
- Analytics enabled (real events)
- Production database (separate from staging)

### Configuration Loading

#### Backend
1. Load `.env` file (if exists)
2. Override with environment variables (deployment platform)
3. Validate required variables on startup
4. Fail fast if critical variables missing

#### Frontend
1. Load `.env.local` file (if exists, gitignored)
2. Override with environment variables (deployment platform)
3. `NEXT_PUBLIC_*` variables are embedded at build time
4. Validate required variables at build time

### Environment Validation

Both apps should validate environment configuration on startup:

```typescript
// Required variables check
const requiredVars = ['APP_ENV', 'DATABASE_URL', 'CORS_ORIGIN'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

// Environment consistency check
const validEnvs = ['local', 'staging', 'production'];
if (!validEnvs.includes(process.env.APP_ENV!)) {
  throw new Error(`Invalid APP_ENV: ${process.env.APP_ENV}`);
}
```

See `/docs/environments.md` for complete environment configuration details.

## Deployment Architecture

### Development (Local)
- Docker Compose for local PostgreSQL
- Frontend: `npm run dev` (Next.js dev server on port 3000)
- Backend: `npm run dev` (nodemon/ts-node-dev on port 3001)
- Environment: `APP_ENV=local`, `NEXT_PUBLIC_APP_ENV=local`

### Staging
- Frontend: Vercel (staging branch → staging deployment)
- Backend: Railway/Render (staging environment)
- Database: Managed PostgreSQL (separate staging instance)
- Environment: `APP_ENV=staging`, `NEXT_PUBLIC_APP_ENV=staging`
- Auto-deploy on push to `staging` branch

### Production
- Frontend: Vercel (production branch → production deployment)
- Backend: Railway, Render, or AWS ECS (production environment)
- Database: Managed PostgreSQL (separate production instance)
- Redis: Managed Redis (Upstash, Redis Cloud) - future
- Environment: `APP_ENV=production`, `NEXT_PUBLIC_APP_ENV=production`
- Manual approval gate before deployment

## Error Handling

### Client-Side
- Network errors: Retry with exponential backoff
- Socket disconnection: Auto-reconnect with state recovery
- Playback errors: Fallback UI, error messages

### Server-Side
- Validation errors: Return 400 with error details
- Not found errors: Return 404
- Server errors: Return 500, log to console (future: error tracking service)
- Socket errors: Emit error events to clients

## Monitoring & Logging (Future)

### Metrics to Track
- API response times
- Socket.IO connection count
- Message delivery latency
- Playback sync accuracy
- Error rates
- Room creation/join rates

### Logging
- Structured logging (Winston or Pino)
- Log levels: error, warn, info, debug
- Request/response logging
- Socket event logging
