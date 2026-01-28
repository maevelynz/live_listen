# Environments

This project supports three environments with clear separation of data, secrets, and deployment controls.

## Environment matrix

| Environment | APP_ENV | Web URL | API URL | WS URL | DB | Secrets source |
| --- | --- | --- | --- | --- | --- | --- |
| Local | `local` | http://localhost:3000 | http://localhost:3001 | ws://localhost:3001 | Local Postgres (docker compose) | `.env` files on disk |
| Staging | `staging` | https://staging.live-listen.app | https://api.staging.live-listen.app | wss://api.staging.live-listen.app | Managed Postgres (staging) | Vercel/Fly/Render env vars |
| Production | `production` | https://live-listen.app | https://api.live-listen.app | wss://api.live-listen.app | Managed Postgres (prod) | Vercel/Fly/Render env vars |

> Notes:
> - `NEXT_PUBLIC_APP_ENV` mirrors `APP_ENV` for the web bundle.
> - Staging and production must never share the same database.

## Secrets and configuration

- **Local**: use `.env` files (see `apps/api/.env.example`, `apps/web/.env.example`).
- **Staging/Production**: set env vars in the hosting platform (Vercel/Fly/Render) and keep secrets out of Git.
- **Critical secrets**: database URLs, JWT secrets, third-party keys (if added later).

## Database separation

- **Local**: a docker-compose Postgres instance.
- **Staging**: a dedicated managed Postgres database with its own credentials, schema, and backups.
- **Production**: a separate managed Postgres database (never re-used by staging).

## Deploy triggers

- **Local**: manual `npm run dev` workflows.
- **Staging**: deploy on merge to `main` or on tagged staging releases (e.g., `staging-*`).
- **Production**: deploy on release tags (e.g., `v*`) or manual promotion from staging.

## Migrations

- **Local**: migrations/bootstraps run on `npm run dev` or a dedicated script.
- **Staging**: migrations run during deploy (release phase) with an explicit log entry.
- **Production**: migrations must be run before switching traffic; use a release checklist and verify app health.

## Rollback strategy

1. **Revert deploy**: roll back to the last successful build on the hosting platform.
2. **DB rollback**: if a migration is unsafe, restore from backup or use a down migration.
3. **Feature flags** (future): disable risky features without redeploying.
4. **Post-rollback verification**: re-run smoke tests and verify logs.
