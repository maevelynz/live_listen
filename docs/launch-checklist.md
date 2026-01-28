# Launch Checklist

## Staging smoke tests

Run these after each staging deploy:

1. **Health check**: `GET /health` returns `{ ok: true }`.
2. **Auth**: register a user and receive a token.
3. **Rooms**: create a room, join by invite code, list rooms.
4. **Realtime**: open two browsers and verify:
   - presence updates
   - chat messages propagate
   - playback state syncs
5. **CORS/WS**: no CORS errors in browser console.
6. **DB**: verify tables exist and data persists after restart.

## Production gates

Must be satisfied before production release:

- ✅ Staging smoke tests pass.
- ✅ Production environment variables validated (APP_ENV, DB, JWT).
- ✅ Database backups enabled and verified.
- ✅ Observability configured (logs + alerts).
- ✅ Rollback plan reviewed and tested.
- ✅ Stakeholders sign off.

## Post-release verification

- Run production smoke tests (read-only where possible).
- Monitor logs and error rates for at least 30 minutes.
- Confirm analytics/metrics dashboards show expected traffic.
