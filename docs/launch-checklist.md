# Launch Checklist

## Staging smoke tests

Run after each staging deploy:

- ✅ API health: `GET /health` returns `{ ok: true, env: "staging" }`.
- ✅ Auth: register/login flow works.
- ✅ Room flow: create room, join by invite, list rooms.
- ✅ Chat: send and receive realtime messages between two sessions.
- ✅ Playback sync: host updates propagate to participants.
- ✅ CORS: no browser console errors when connecting to API/Socket.
- ✅ DB: write/read operations for rooms and messages succeed.

## Production gates

Must be satisfied before production release:

### Release readiness

- ✅ All staging smoke tests pass.
- ✅ Release notes written and reviewed.
- ✅ Monitoring/alerting configured (health checks + error rate).
- ✅ Backup and PITR confirmed for production database.

### Security & compliance

- ✅ Secrets stored in the production secret manager.
- ✅ CORS locked down to production web origin.
- ✅ Rate limiting enabled.
- ✅ Data retention policy documented and approved.

### Rollback readiness

- ✅ Prior release artifacts are available.
- ✅ Rollback playbook is current and tested.
- ✅ On-call owner assigned for release window.
