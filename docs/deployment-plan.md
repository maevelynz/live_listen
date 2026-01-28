# LiveListen - Deployment Plan (Staging + Production)

This document describes the recommended deployment architecture for LiveListen with **Local / Staging / Production** environments, focusing on **Vercel (web)** + **Fly.io or Render (api)** + **managed Postgres (Neon/Supabase/Railway)**.

## Environment Strategy

### `APP_ENV` values
- **`local`**: Developer machines, docker-compose Postgres
- **`staging`**: Pre-production environment, production-like config, separate DB
- **`production`**: Real users, strictest configuration, separate DB

### Required environment variables

#### API (`apps/api`)
- **`APP_ENV`**: `local|staging|production`
- **`NODE_ENV`**: `development` (local) / `production` (staging+prod)
- **`PORT`**: API port (typically `3001` locally; Fly/Render may override)
- **`DATABASE_URL`**: Postgres connection string
  - Staging/prod must use `sslmode=require` or platform SSL config
- **`CORS_ORIGIN`**: allowed browser origin for REST requests
- **`SOCKET_IO_CORS_ORIGIN`**: allowed browser origin for Socket.IO
- **`LOG_LEVEL`**: `debug|info|warn|error`
- **`JWT_SECRET`**: signing key for auth tokens (must differ per env)
- **Optional**: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`

#### Web (`apps/web`)
- **`NEXT_PUBLIC_APP_ENV`**: `local|staging|production`
- **`NEXT_PUBLIC_API_URL`**: base URL for REST calls
- **`NEXT_PUBLIC_WS_URL`**: base URL for Socket.IO (use `https://...` for socket.io-client)
- **`NEXT_PUBLIC_APP_URL`**: used for generating invite links

### Env templates
- API:
  - `apps/api/.env.staging.example`
  - `apps/api/.env.production.example`
- Web:
  - `apps/web/.env.staging.example`
  - `apps/web/.env.production.example`

## Recommended Stack

### Web: Vercel
- **Staging**: Vercel Project (staging env vars) pointing to `staging` branch
- **Production**: Vercel Production deployment from `main` (or `production`) branch

**Why Vercel**:
- Best-in-class Next.js hosting, previews, and env management.

### API: Fly.io OR Render

#### Option A: Fly.io (Recommended for sockets)
- Good long-lived connections for Socket.IO
- Regions close to users
- Simple scale-out path

#### Option B: Render
- Works well for Node services
- Ensure **WebSocket support** and **sticky sessions** if scaling beyond 1 instance

### Database: Managed Postgres (Neon / Supabase / Railway)
- **Staging DB** separate from **Production DB**
- Enforce SSL (required for most managed providers)
- Enable backups + point-in-time recovery for prod

## DNS & URLs

### Suggested domains
- Web:
  - Staging: `https://staging.livelisten.com`
  - Production: `https://livelisten.com`
- API:
  - Staging: `https://api-staging.livelisten.com`
  - Production: `https://api.livelisten.com`

### CORS rules

#### Staging
- API `CORS_ORIGIN`: `https://staging.livelisten.com`
- API `SOCKET_IO_CORS_ORIGIN`: `https://staging.livelisten.com`

#### Production
- API `CORS_ORIGIN`: `https://livelisten.com`
- API `SOCKET_IO_CORS_ORIGIN`: `https://livelisten.com`

**Notes**:
- Do **not** use `*` for credentials-based requests.
- Keep a single stable staging domain; avoid CORS chaos from PR preview domains unless you design for it.

## Socket.IO Compatibility Notes

### Use HTTPS URL for Socket.IO client
Socket.IO clients expect an `http(s)` base URL; WebSocket upgrades happen automatically.

Recommended:
- `NEXT_PUBLIC_WS_URL=https://api-staging.livelisten.com` (staging)
- `NEXT_PUBLIC_WS_URL=https://api.livelisten.com` (prod)

### Scaling / sticky sessions
If running multiple API instances:
- Socket.IO requires either:
  - Sticky sessions at the load balancer **or**
  - A shared adapter (e.g., Redis adapter)

For MVP:
- Prefer **single API instance** per env (simplifies presence tracking and chat).

## Secrets & Separation
- Use distinct `JWT_SECRET` per environment.
- Never point staging to production DB.
- Keep separate managed Postgres projects or databases.

## Data migrations
- For staging/prod: run migrations as part of deploy pipeline (manual gate for prod).
- Ensure rollback strategy is documented (see `docs/runbook.md`).

