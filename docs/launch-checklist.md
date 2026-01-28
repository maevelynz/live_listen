# Launch Checklist

## Staging Smoke Tests

- [ ] Web app loads at staging URL without errors.
- [ ] API health check returns 200 (GET `/health`).
- [ ] User can register and receive a token.
- [ ] Create room succeeds and invite code is displayed.
- [ ] Join room with invite code succeeds.
- [ ] Presence list updates when a second user joins.
- [ ] Chat messages send and receive in realtime.
- [ ] Playback state syncs between two clients.
- [ ] CORS and Socket.IO CORS allow staging web origin only.

## Production Gates

- [ ] All staging smoke tests pass within 24 hours.
- [ ] Production secrets set in hosting provider (no plaintext files).
- [ ] Database backups enabled and verified.
- [ ] Error monitoring configured (logs, alerting, uptime checks).
- [ ] Rate limits configured for production traffic.
- [ ] Rollback plan verified (previous build redeploy).
- [ ] GDPR/CCPA considerations reviewed (data retention and deletion).
- [ ] Launch communication plan approved.
