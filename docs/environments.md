# Environments

This document defines the environment strategy for LiveListen across local, staging, and production.

## Environment matrix

| Environment | APP_ENV | Web URL | API URL | DB | Secrets handling | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Local | `local` | http://localhost:3000 | http://localhost:3001 | Local Postgres (docker compose) | `.env` files committed as examples only | Single developer machine, no shared data |
| Staging | `staging` | https://staging.live-listen.app | https://api-staging.live-listen.app | Managed Postgres (staging cluster) | Managed secrets (Vercel/Fly/Render) | Mirrors prod settings with non-prod data |
| Production | `production` | https://live-listen.app | https://api.live-listen.app | Managed Postgres (prod cluster) | Managed secrets with rotation | Customer data, strict change control |

## Required configuration

### Shared
- `APP_ENV`: `local`, `staging`, or `production`.

### API
- `PORT`: API server port.
- `DATABASE_URL`: Postgres connection string.
- `CORS_ORIGIN`: Comma-separated list of allowed web origins.
- `SOCKET_IO_CORS_ORIGIN`: Allowed Socket.IO origins (same as web origins).
- `LOG_LEVEL`: `debug`, `info`, `warn`, `error`.
- `JWT_SECRET`: Secret used to sign auth tokens.
- `RATE_LIMIT_WINDOW_MS`: Rate limit window.
- `RATE_LIMIT_MAX`: Max requests per window.

### Web
- `NEXT_PUBLIC_API_URL`: API base URL.
- `NEXT_PUBLIC_WS_URL`: WebSocket/Socket.IO base URL.
- `NEXT_PUBLIC_APP_ENV`: `local`, `staging`, or `production` (publicly exposed).

## Secrets management

- Local: use `.env` files (never commit real secrets).
- Staging/Production: store secrets in platform secret managers (Vercel, Fly, Render).
- Rotate `JWT_SECRET` and DB passwords on a regular schedule.

## Database separation

- Local DB is disposable and should never connect to staging or production.
- Staging and production use distinct managed Postgres clusters.
- Avoid cross-environment access: firewalls and credentials must be isolated.

## Deploy triggers

- Local: manual `npm run dev`.
- Staging: deploy from the `main` branch when the staging release flag is enabled, or via a dedicated `staging` branch.
- Production: deploy from tagged releases (e.g., `v1.2.0`).

## Migrations

- Local: apply migrations on startup or via a migration script.
- Staging: run migrations in CI/CD before deploying the API.
- Production: run migrations as a separate, audited step before the deploy.

## Rollback

- Web: rollback to the last successful deployment (Vercel “Instant Rollback”).
- API: redeploy the previous container image or release.
- DB: only roll back schema when safe; prefer forward-only migrations with toggles.
- Always capture logs/metrics before rollback to preserve incident context.
