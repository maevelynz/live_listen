# Environments

This document defines how LiveListen environments are separated, configured, and deployed.

## Environment Matrix

| Environment | `APP_ENV` | `NEXT_PUBLIC_APP_ENV` | Base Web URL | Base API URL | Notes |
| --- | --- | --- | --- | --- | --- |
| Local | `local` | `local` | `http://localhost:3000` | `http://localhost:3001` | Local dev via docker compose + npm scripts. |
| Staging | `staging` | `staging` | `https://staging.live-listen.example.com` | `https://api.staging.live-listen.example.com` | Pre-prod validation with production-like config. |
| Production | `production` | `production` | `https://live-listen.example.com` | `https://api.live-listen.example.com` | Customer-facing environment. |

## URLs and Routing

- Web app should target the API URL via `NEXT_PUBLIC_API_URL` and the Socket URL via `NEXT_PUBLIC_WS_URL`.
- API should enforce CORS based on `CORS_ORIGIN` and Socket.IO CORS based on `SOCKET_IO_CORS_ORIGIN`.

## Secrets and Configuration

**Required secrets per environment:**

- API:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `CORS_ORIGIN`
  - `SOCKET_IO_CORS_ORIGIN`
  - `LOG_LEVEL`
  - `RATE_LIMIT_*` (if enabled)
- Web:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_WS_URL`
  - `NEXT_PUBLIC_APP_ENV`

**Secret handling principles:**

- Never commit secrets to the repo.
- Local dev uses `.env` files, while staging/prod use managed secret stores (Vercel/Fly/Render/etc).
- Rotate secrets per environment; do not reuse production credentials in staging.

## Database Separation

- Each environment has its own isolated Postgres instance.
- Never share data between staging and production.
- Local dev uses docker compose Postgres with disposable data.
- Staging and production use managed Postgres with backups enabled.

## Deploy Triggers

- **Local:** `npm run dev` per app.
- **Staging:** merge to `main` (or `develop`) triggers staging deployment.
- **Production:** tagged release (e.g., `vX.Y.Z`) or manual promote from staging.

## Migrations

- Migrations run automatically in staging and production before app start (CI/CD step).
- Local dev can run migrations on startup or via a `npm run db:migrate` script.
- Use a one-way migration strategy; no destructive changes without a backwards-compatible plan.

## Rollback Strategy

- **Web:** rollback by redeploying the previous build (Vercel/Fly/Render rollback).
- **API:** rollback by redeploying the last known good container/image.
- **DB:** restore from backups; use forward-only migrations with rollback scripts where possible.
- If a migration is unsafe to rollback, deploy a compatibility patch first, then migrate.
