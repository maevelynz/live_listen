# Environments

## Environment matrix

| Environment | APP_ENV | NEXT_PUBLIC_APP_ENV | Base URLs | Ownership | Notes |
| --- | --- | --- | --- | --- | --- |
| Local | `local` | `local` | Web: `http://localhost:3000` API: `http://localhost:3001` | Developer machine | Uses local Postgres (docker compose). No shared data. |
| Staging | `staging` | `staging` | Web: `https://staging.<your-domain>` API: `https://api-staging.<your-domain>` | Shared QA | Production-like data shape, but synthetic or scrubbed. |
| Production | `production` | `production` | Web: `https://<your-domain>` API: `https://api.<your-domain>` | Real users | Highest safeguards and strict change control. |

## URLs and CORS

- **Web** must call the API at the environment-specific base URL.
- **API CORS** should allow only the web origin for each environment.
- **Socket.IO CORS** should match the same origin as the web client.

Example mapping:

| Environment | Web Origin | API Allowed Origin | Socket Allowed Origin |
| --- | --- | --- | --- |
| Local | `http://localhost:3000` | `http://localhost:3000` | `http://localhost:3000` |
| Staging | `https://staging.<your-domain>` | `https://staging.<your-domain>` | `https://staging.<your-domain>` |
| Production | `https://<your-domain>` | `https://<your-domain>` | `https://<your-domain>` |

## Secrets and configuration

Keep secrets out of git. Use environment-specific secret stores (Vercel/Fly/Render/GitHub Actions).

**API secrets** (examples):
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `SOCKET_IO_CORS_ORIGIN`

**Web secrets** (examples):
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`
- `NEXT_PUBLIC_APP_ENV`

## Database separation

- **Local**: developer-owned Postgres via Docker compose.
- **Staging**: dedicated managed Postgres instance (isolated from production).
- **Production**: separate managed Postgres instance with backups + PITR.

**Rules**:
- Never point staging at production DB.
- Restrict credentials to minimum required privileges.
- Rotate credentials for staging/production when staff changes.

## Deploy triggers

Recommended triggers per environment:

- **Local**: manual `npm run dev` for API and web.
- **Staging**: deploy from `main` branch or `release/*` tag.
- **Production**: deploy from versioned tags (e.g. `v1.2.3`) with approvals.

## Migrations

- **Local**: migrations can run automatically on app start.
- **Staging**: run migrations as a release step in CI/CD.
- **Production**: migrations run as a gated release step with rollback plan.

## Rollback

- **Web**: revert to the prior deployment (Vercel rollback or previous build).
- **API**: redeploy previous image/release.
- **DB**:
  - If migration is backward compatible, roll back code only.
  - If migration is destructive, restore from backup/PITR.

## Monitoring and alerts

Minimum checks per environment:

- API health endpoint check (`/health`).
- 5xx error rate alerting.
- Database connection saturation alert.

## Ownership

- Staging changes are allowed for QA/review.
- Production changes require release approval and change log entry.
