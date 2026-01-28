# LiveListen - Runbook (Staging + Production)

This runbook describes how to deploy, promote, rollback, and monitor LiveListen.

## Deploy Staging

### Preconditions
- Staging DB exists and is reachable via SSL
- Staging API and Web env vars set in deployment platforms
- CI is green on the staging branch

### Steps
1. **Merge** changes into `staging` branch
2. **Vercel (Web)**:
   - Staging deployment triggers on push to `staging`
   - Verify build success and preview URL matches your staging domain (or stable staging project)
3. **Fly.io/Render (API)**:
   - Deploy the `apps/api` service for staging
   - Confirm `APP_ENV=staging`
4. **DB migrations**:
   - Run migrations against **staging DB**
   - Verify schema and basic queries
5. **Smoke test**:
   - `GET /health` returns 200
   - Create room → join room → chat message → playback update

## Promote to Production

### Preconditions (must be true)
- Staging smoke tests passed
- No open P0/P1 bugs
- Production env vars verified
- Production DB backup verified

### Steps
1. Create a **release tag** (recommended): `vX.Y.Z`
2. Merge `staging` → `main` (or create a PR into `main`)
3. **Vercel (Web)**:
   - Production deployment triggers from `main`
4. **Fly.io/Render (API)**:
   - Deploy production API
   - Confirm `APP_ENV=production`
5. **DB migrations (prod)**:
   - Create backup / PITR checkpoint
   - Run migrations
6. **Post-deploy validation** (first 15 minutes):
   - `GET /health`
   - Room create/join
   - Socket connect with auth token
   - Real-time chat across two clients
   - Playback sync update propagates

## Rollback

### When to rollback
- Elevated 5xx error rates
- Socket connection failures
- Data corruption or migration errors
- Critical functional regression (create/join/chat/playback)

### Rollback steps

#### 1) Web (Vercel)
- Use Vercel dashboard: **Promote previous deployment** to production

#### 2) API (Fly.io/Render)
- Roll back to previous release:
  - Fly: `fly releases` → `fly deploy -i <previous image>` (or `fly deploy` with prior version)
  - Render: rollback to previous deploy in dashboard

#### 3) Database rollback
- Prefer **transactional migrations**; if migration is destructive, you need restore.
- Options:
  - Restore from pre-deploy backup / PITR
  - Apply down-migrations (if supported)

#### 4) Verify
- `GET /health`
- Create/join room
- Socket connect and emit/join

## Observability (Minimal MVP)

### Logs

#### API
- Ensure structured logs for:
  - request start/finish (method, path, status, duration)
  - socket connect/disconnect
  - room join/leave
  - chat send + errors
  - playback updates
  - auth failures

#### Web
- Console errors should be minimal; capture critical errors with an error boundary.

### Basic alerts (recommended)
- API 5xx rate above threshold (e.g., >2% over 5 minutes)
- API latency p95 above threshold (e.g., >500ms)
- Socket connection error spikes
- Database connection failures

### Health checks
- API `/health` should be used by platform health checks.

## Operational Notes

### Secrets rotation
- Rotate `JWT_SECRET` on schedule (quarterly) or after incident.
- Rotating JWT secret invalidates existing tokens; announce in advance for pilots.

### CORS sanity
- Staging API must allow staging web origin only.
- Production API must allow production web origin only.

### Scaling notes
- If scaling API beyond 1 instance:
  - add sticky sessions or Socket.IO Redis adapter
  - ensure presence tracking is consistent across instances

