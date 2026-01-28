# Launch checklist

## Staging smoke tests

1. **Health check**
   - `GET /health` returns `200` with `{ ok: true }`.
2. **Auth**
   - Register a user and receive a token.
3. **Rooms**
   - Create a room, then join it with a second user.
4. **Chat**
   - Send and receive realtime chat messages.
5. **Playback sync**
   - Host updates playback state; participants see updates.
6. **Presence**
   - Join/leave updates presence list.
7. **CORS/Socket**
   - No CORS errors from the staging web domain.
8. **Logs**
   - Verify API logs contain structured request info.

## Production launch gates

### Product readiness
- All staging smoke tests are green.
- Error tracking configured (Sentry or equivalent).
- Rate limits configured for prod traffic.

### Security
- Secrets stored in managed secret managers (no plain text in CI).
- JWT signing secret rotated and documented.
- DB access restricted by IP or private networking.

### Data & migrations
- Migration plan reviewed and backed up.
- Rollback plan approved and rehearsed.

### Ops
- Dashboard for API uptime + latency.
- Log retention configured.
- On-call rotation and escalation defined.
