# LiveListen MVP - Agent Tasks

This document outlines tasks for Agents 2-6, with explicit environment awareness requirements.

## Environment Awareness Requirements

**All agents must:**
1. **Respect environment variables**: Use `APP_ENV` (backend) and `NEXT_PUBLIC_APP_ENV` (frontend) to determine current environment
2. **Environment-specific behavior**: Implement different behavior/logging/config for `local`, `staging`, and `production`
3. **Database separation**: Use environment-specific `DATABASE_URL` (never mix environments)
4. **URL configuration**: Use environment-specific API/WebSocket URLs from environment variables
5. **Testing strategy**: Test in local first, validate in staging before production
6. **Migration safety**: Ensure migrations work across all environments with proper rollback support

See `/docs/environments.md` for complete environment configuration details.

---

## Agent 2: Backend API Implementation

### Scope
Implement REST API endpoints for rooms, users, and episodes as defined in `/docs/api.md`.

### Environment-Aware Requirements
- ✅ Load environment variables from `.env` file (local) or deployment platform (staging/production)
- ✅ Validate `APP_ENV` on startup (must be `local`, `staging`, or `production`)
- ✅ Use `DATABASE_URL` from environment (different per environment)
- ✅ Configure CORS using `CORS_ORIGIN` environment variable
- ✅ Set logging level based on `LOG_LEVEL` environment variable
- ✅ Use environment-specific error handling (detailed errors in local, sanitized in production)
- ✅ Implement health check endpoint that verifies database connectivity

### Tasks

#### 2.1 Database Setup
- [ ] Set up database connection using `DATABASE_URL` from environment
- [ ] Implement connection pooling (environment-specific pool sizes)
- [ ] Add connection health checks
- [ ] Handle SSL requirements for staging/production databases
- [ ] Implement graceful shutdown on connection errors

#### 2.2 Room Management API
- [ ] `POST /api/rooms` - Create room
  - Generate cryptographically random invite code
  - Create host user
  - Return room with invite link (use `NEXT_PUBLIC_APP_URL` from frontend env or construct from `CORS_ORIGIN`)
- [ ] `GET /api/rooms/:roomId` - Get room details
  - Include episode, users, settings
  - Handle 404 for non-existent rooms
  - Handle 410 for inactive rooms
- [ ] `POST /api/rooms/:roomId/join` - Join room
  - Validate invite code
  - Check room capacity (50 users max)
  - Check if user is banned
  - Create/retrieve user
  - Return user and room data

#### 2.3 Episode Management API
- [ ] `POST /api/episodes/rss` - Parse RSS feed
  - Validate RSS URL
  - Parse feed and extract episodes
  - Store episodes in database
  - Handle RSS parsing errors gracefully
- [ ] `GET /api/episodes/:id` - Get episode details
- [ ] `POST /api/episodes` - Create episode from MP3 URL
- [ ] `POST /api/rooms/:roomId/episode` - Set room episode (host only)

#### 2.4 User Management API
- [ ] `POST /api/users` - Create/register user (name only)
- [ ] `GET /api/users/:userId` - Get user details

#### 2.5 Chat API
- [ ] `GET /api/rooms/:roomId/messages` - Get chat history
  - Support pagination (limit, before timestamp)
  - Return last 50 messages by default

#### 2.6 Environment-Specific Features
- [ ] Implement rate limiting (environment-specific limits)
- [ ] Add request logging (detailed in local, structured in staging/production)
- [ ] Implement error tracking integration (Sentry - staging/production only)
- [ ] Add API versioning headers
- [ ] Implement graceful error responses (detailed in local, sanitized in production)

### Testing Requirements
- [ ] Unit tests for all endpoints (test with `APP_ENV=local`)
- [ ] Integration tests with test database (use separate test DB, not production)
- [ ] Test environment variable validation
- [ ] Test database connection handling per environment
- [ ] Test CORS configuration per environment

### Deliverables
- Complete REST API implementation in `apps/api/src/`
- Environment-aware configuration module
- Database models/ORM setup
- API route handlers
- Error handling middleware
- Request validation (Zod schemas from `packages/shared`)

---

## Agent 3: Real-Time Features (Socket.IO)

### Scope
Implement Socket.IO server for real-time playback synchronization, chat, and moderation as defined in `/docs/sockets.md`.

### Environment-Aware Requirements
- ✅ Use `SOCKET_IO_CORS_ORIGIN` from environment for CORS configuration
- ✅ Configure Socket.IO adapter based on environment (in-memory for local, Redis adapter for staging/production if enabled)
- ✅ Implement environment-specific connection limits
- ✅ Use environment-specific logging for Socket.IO events
- ✅ Handle reconnection logic (different strategies per environment)

### Tasks

#### 3.1 Socket.IO Server Setup
- [ ] Configure Socket.IO server with CORS from `SOCKET_IO_CORS_ORIGIN`
- [ ] Set up room namespace `/room/:roomId`
- [ ] Implement connection authentication/validation
- [ ] Add connection health monitoring
- [ ] Configure adapter (in-memory for local, Redis for staging/production if `ENABLE_REDIS=true`)

#### 3.2 Room Management (Socket.IO)
- [ ] `room:join` - Join room namespace
  - Validate user can join (not banned, room exists, not at capacity)
  - Emit `room:joined` with full room state
  - Broadcast `user:joined` to other clients
- [ ] Handle disconnection (cleanup, broadcast `user:left`)
- [ ] Implement room state persistence

#### 3.3 Playback Synchronization
- [ ] `playback:play` - Host plays episode
  - Validate host permissions
  - Broadcast `playback:state` to all clients
  - Store playback state in memory/database
- [ ] `playback:pause` - Host pauses episode
- [ ] `playback:seek` - Host seeks to position
- [ ] `playback:sync_request` - Client requests sync
  - Return current playback state with server timestamp
- [ ] Implement periodic sync checks (every 5-10 seconds)
- [ ] Handle playback drift correction (<500ms target)

#### 3.4 Real-Time Chat
- [ ] `chat:message` - Send message
  - Validate user not muted
  - Check slow mode (if enabled)
  - Validate message length
  - Save to database
  - Broadcast to all clients
- [ ] `chat:typing` - Typing indicators (optional)
- [ ] Implement message rate limiting
- [ ] Handle message errors (`chat:message_error`)

#### 3.5 User Events
- [ ] `user:joined` - Broadcast when user joins
- [ ] `user:left` - Broadcast when user leaves
- [ ] `user:updated` - Broadcast user state changes

#### 3.6 Moderation (Host Only)
- [ ] `moderation:mute` - Mute/unmute user
  - Validate host permissions
  - Update database
  - Broadcast `moderation:user_muted`
- [ ] `moderation:kick` - Kick user from room
  - Emit `moderation:kicked` to target
  - Broadcast `moderation:user_kicked` to others
- [ ] `moderation:ban` - Ban user from room
  - Create ban record in database
  - Emit `moderation:banned` to target
  - Broadcast `moderation:user_banned` to others
- [ ] `moderation:slow_mode` - Toggle slow mode
  - Update room settings
  - Broadcast `moderation:slow_mode_updated`
- [ ] `moderation:pin_message` - Pin/unpin message
  - Update message in database
  - Broadcast `moderation:message_pinned`

#### 3.7 System Events
- [ ] `ping/pong` - Heartbeat for connection health
- [ ] `error` - Error event handling
- [ ] `room:state` - Full room state sync

#### 3.8 Environment-Specific Features
- [ ] Implement connection limits (higher in local, strict in production)
- [ ] Add Socket.IO event logging (debug in local, info in staging/production)
- [ ] Implement reconnection backoff (different strategies per environment)
- [ ] Add metrics collection (staging/production only)

### Testing Requirements
- [ ] Unit tests for Socket.IO event handlers
- [ ] Integration tests with Socket.IO client
- [ ] Test playback synchronization accuracy
- [ ] Test moderation permissions
- [ ] Test environment-specific CORS configuration
- [ ] Test reconnection logic per environment

### Deliverables
- Socket.IO server implementation in `apps/api/src/socket/`
- Room namespace handlers
- Playback synchronization service
- Chat service
- Moderation service
- Event validation (Zod schemas from `packages/shared`)

---

## Agent 4: Frontend Implementation

### Scope
Implement Next.js frontend with room interface, audio player, chat, and moderation UI as defined in `/docs/architecture.md`.

### Environment-Aware Requirements
- ✅ Use `NEXT_PUBLIC_APP_ENV` to determine environment
- ✅ Use `NEXT_PUBLIC_API_URL` for API calls (never hardcode URLs)
- ✅ Use `NEXT_PUBLIC_WS_URL` for WebSocket connections
- ✅ Use `NEXT_PUBLIC_APP_URL` for generating invite links
- ✅ Implement environment-specific error handling (detailed errors in local, user-friendly in production)
- ✅ Add environment indicator in development (local/staging only, never in production)
- ✅ Configure analytics/error tracking based on environment

### Tasks

#### 4.1 Project Setup
- [ ] Configure Next.js with environment variables
- [ ] Set up Tailwind CSS and component library (shadcn/ui)
- [ ] Create environment configuration utility
- [ ] Set up API client with base URL from `NEXT_PUBLIC_API_URL`
- [ ] Set up Socket.IO client with URL from `NEXT_PUBLIC_WS_URL`

#### 4.2 Landing Page (`/`)
- [ ] Room creation form
  - Host name input (first name, last name)
  - Create room button
  - Display invite link after creation (use `NEXT_PUBLIC_APP_URL`)
- [ ] Room join form
  - Invite code input
  - User name input (first name, last name)
  - Join room button

#### 4.3 Room Page (`/room/[roomId]`)
- [ ] Room layout with panels:
  - Audio player (main area)
  - Chat panel (side)
  - Discussion prompts panel (side)
  - Evidence lookup panel (side)
  - User list (side)
  - Host controls (host only)

#### 4.4 Audio Player Component
- [ ] Synchronized audio player
  - Connect to Socket.IO for playback events
  - Sync playback position with host
  - Handle play/pause/seek events
  - Display current position and duration
  - Show sync status
- [ ] Host controls (play/pause/seek buttons - host only)
- [ ] Participant view (read-only, synced)

#### 4.5 Chat Panel Component
- [ ] Message list with history
- [ ] Message input
- [ ] Send message button
- [ ] Display user names, timestamps
- [ ] Show pinned messages prominently
- [ ] Handle typing indicators (optional)
- [ ] Show slow mode indicator
- [ ] Display message errors (muted, slow mode, etc.)

#### 4.6 User List Component
- [ ] Display active users in room
- [ ] Show user roles (host/participant)
- [ ] Show muted status
- [ ] Update in real-time (user joined/left events)

#### 4.7 Host Controls Component
- [ ] Mute user button (per user)
- [ ] Kick user button (per user)
- [ ] Ban user button (per user)
- [ ] Toggle slow mode
- [ ] Pin message button
- [ ] Room settings panel

#### 4.8 Discussion Features
- [ ] Discussion prompt cards
  - Display prompts from server
  - Show timestamp if applicable
- [ ] Evidence lookup panel
  - Search interface
  - Display results
  - Link to external sources

#### 4.9 State Management
- [ ] Room context provider
  - Room state
  - User state
  - Playback state
  - Chat state
- [ ] Socket.IO connection management
- [ ] Reconnection handling
- [ ] State persistence (localStorage for local state)

#### 4.10 Environment-Specific Features
- [ ] Add environment indicator banner (local/staging only)
- [ ] Implement error boundary with environment-aware error messages
- [ ] Configure analytics (only in staging/production)
- [ ] Configure error tracking (Sentry - staging/production only)
- [ ] Add development tools (React DevTools, etc. - local only)

### Testing Requirements
- [ ] Component unit tests
- [ ] Integration tests for room flow
- [ ] Test Socket.IO connection handling
- [ ] Test playback synchronization
- [ ] Test environment variable usage
- [ ] Test error handling per environment

### Deliverables
- Next.js pages and components in `apps/web/src/`
- Room context provider
- Audio player component
- Chat components
- Host moderation UI
- Socket.IO client integration
- API client with environment-aware URLs

---

## Agent 5: Database & Migrations

### Scope
Set up database schema, ORM (Prisma or TypeORM), and migration system with environment-aware configuration.

### Environment-Aware Requirements
- ✅ Use `DATABASE_URL` from environment (different per environment)
- ✅ Support SSL connections for staging/production
- ✅ Implement migration scripts that work across all environments
- ✅ Create separate migration commands per environment
- ✅ Implement rollback support for all environments
- ✅ Never run migrations against wrong environment database

### Tasks

#### 5.1 ORM Setup
- [ ] Choose and set up ORM (Prisma recommended)
- [ ] Configure database connection using `DATABASE_URL`
- [ ] Set up SSL configuration for staging/production
- [ ] Create database client with connection pooling
- [ ] Implement connection health checks

#### 5.2 Database Schema
- [ ] Define schema for all tables:
  - `rooms`
  - `users`
  - `room_users` (join table)
  - `episodes`
  - `messages`
  - `bans`
- [ ] Define indexes (as per architecture doc)
- [ ] Set up foreign key constraints
- [ ] Configure timestamps (created_at, updated_at)

#### 5.3 Migration System
- [ ] Set up migration tooling (Prisma Migrate or TypeORM migrations)
- [ ] Create initial migration
- [ ] Implement migration commands:
  - `npm run migrate:dev` - Local development
  - `npm run migrate:staging` - Staging environment
  - `npm run migrate:production` - Production environment
- [ ] Add migration validation (check environment before running)
- [ ] Implement migration rollback support

#### 5.4 Environment-Specific Migration Handling
- [ ] Local: Manual migration execution
- [ ] Staging: Automatic migration on deploy (with backup)
- [ ] Production: Automatic migration on deploy (with backup + approval gate)
- [ ] Implement pre-migration backup (staging/production)
- [ ] Implement post-migration verification
- [ ] Add migration logging per environment

#### 5.5 Database Seeds (Optional)
- [ ] Create seed script for local development
- [ ] Create test data seed for staging
- [ ] Never seed production database

#### 5.6 Database Utilities
- [ ] Connection health check utility
- [ ] Database reset utility (local only)
- [ ] Migration status checker
- [ ] Backup utility (staging/production)

### Testing Requirements
- [ ] Test migrations on local database
- [ ] Test migration rollback
- [ ] Test environment validation
- [ ] Test SSL connection (staging/production)
- [ ] Test migration with different database states

### Deliverables
- ORM schema definition
- Migration scripts
- Database client configuration
- Migration commands in `package.json`
- Environment-aware migration utilities

---

## Agent 6: Testing & QA

### Scope
Implement comprehensive testing strategy with environment-aware test configuration.

### Environment-Aware Requirements
- ✅ Use separate test database (never test against production)
- ✅ Configure test environment variables
- ✅ Run tests in `local` environment by default
- ✅ Implement environment-specific test configurations
- ✅ Test environment variable validation
- ✅ Test environment-specific behavior

### Tasks

#### 6.1 Test Setup
- [ ] Set up testing framework (Jest/Vitest)
- [ ] Configure test environment variables
- [ ] Set up test database (separate from dev/prod)
- [ ] Create test utilities and helpers
- [ ] Set up test data factories

#### 6.2 Backend API Tests
- [ ] Unit tests for all API endpoints
- [ ] Integration tests with test database
- [ ] Test environment variable validation
- [ ] Test CORS configuration per environment
- [ ] Test error handling per environment
- [ ] Test rate limiting
- [ ] Test database connection handling

#### 6.3 Socket.IO Tests
- [ ] Unit tests for Socket.IO event handlers
- [ ] Integration tests with Socket.IO client
- [ ] Test playback synchronization
- [ ] Test chat message handling
- [ ] Test moderation actions
- [ ] Test reconnection logic
- [ ] Test environment-specific CORS

#### 6.4 Frontend Tests
- [ ] Component unit tests (React Testing Library)
- [ ] Integration tests for room flow
- [ ] Test Socket.IO client integration
- [ ] Test API client with different URLs
- [ ] Test environment variable usage
- [ ] Test error boundaries

#### 6.5 End-to-End Tests
- [ ] E2E test setup (Playwright/Cypress)
- [ ] Test room creation and joining flow
- [ ] Test playback synchronization
- [ ] Test chat functionality
- [ ] Test moderation actions
- [ ] Test error scenarios

#### 6.6 Environment-Specific Test Suites
- [ ] Local test suite (full test coverage)
- [ ] Staging smoke tests (critical paths only)
- [ ] Production readiness tests
- [ ] Test environment configuration validation

#### 6.7 Test Data Management
- [ ] Create test data factories
- [ ] Implement test database cleanup
- [ ] Create test fixtures
- [ ] Mock external services (RSS feeds, etc.)

#### 6.8 CI/CD Integration
- [ ] Set up test runs in CI/CD pipeline
- [ ] Configure test environment variables in CI
- [ ] Run tests on pull requests
- [ ] Run full test suite before deployment
- [ ] Run smoke tests after staging deployment

### Testing Requirements
- [ ] All tests must pass in local environment
- [ ] Tests must use test database (never production)
- [ ] Tests must validate environment configuration
- [ ] Tests must cover environment-specific behavior
- [ ] E2E tests must run against staging before production

### Deliverables
- Test suite for backend API
- Test suite for Socket.IO
- Test suite for frontend
- E2E test suite
- Test configuration files
- CI/CD test integration
- Test documentation

---

## General Requirements for All Agents

### Environment Validation
- All agents must validate environment variables on startup
- Fail fast if required variables are missing
- Log environment configuration on startup (sanitize secrets)

### Documentation
- Update relevant documentation with environment considerations
- Document environment-specific behavior
- Add troubleshooting guides for environment issues

### Security
- Never commit `.env` files
- Use `.env.example` as template
- Rotate secrets per environment
- Use different secrets for staging and production

### Deployment
- Test in local first
- Deploy to staging and run smoke tests
- Only deploy to production after staging validation
- Follow deployment checklist in `/docs/launch-checklist.md`
