# LiveListen - Launch Checklist

This checklist ensures safe deployments to staging and production environments.

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass locally (`npm test` in both `apps/api` and `apps/web`)
- [ ] No linter errors (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Code review completed and approved
- [ ] All environment variables documented in `.env.example` files

### Environment Configuration
- [ ] Environment variables set in deployment platform (Vercel/Railway)
- [ ] `APP_ENV` set correctly (`staging` or `production`)
- [ ] `NEXT_PUBLIC_APP_ENV` set correctly (`staging` or `production`)
- [ ] Database connection strings verified
- [ ] CORS origins configured correctly
- [ ] API/WebSocket URLs match environment
- [ ] Secrets rotated (if applicable)

### Database
- [ ] Database migrations tested locally
- [ ] Migration rollback tested
- [ ] Database backup created (staging/production)
- [ ] Database connection verified
- [ ] Migration scripts ready

---

## Staging Deployment Checklist

### Pre-Deployment
- [ ] Branch merged to `staging` (or `main` if auto-deploy)
- [ ] CI/CD pipeline passed
- [ ] Environment variables verified in staging deployment platform
- [ ] Database backup created for staging database

### Deployment
- [ ] Trigger staging deployment
- [ ] Monitor deployment logs
- [ ] Verify database migrations ran successfully
- [ ] Check application startup logs
- [ ] Verify health check endpoint responds

### Post-Deployment Smoke Tests

#### Basic Functionality
- [ ] **Health Check**: `GET /health` returns 200
- [ ] **Frontend Loads**: Staging URL loads without errors
- [ ] **API Responds**: API base URL responds
- [ ] **Database Connected**: Health check shows database connected

#### Room Management
- [ ] **Create Room**: Can create a room via API
  - `POST /api/rooms` with host names
  - Returns room with invite code
  - Invite link uses correct staging URL
- [ ] **Get Room**: Can retrieve room details
  - `GET /api/rooms/:roomId`
  - Returns room data
- [ ] **Join Room**: Can join room via API
  - `POST /api/rooms/:roomId/join`
  - Returns user and room data

#### Frontend Flow
- [ ] **Landing Page**: Landing page loads
- [ ] **Create Room UI**: Can create room from UI
  - Form accepts host names
  - Displays invite link
  - Invite link uses staging URL
- [ ] **Join Room UI**: Can join room from UI
  - Form accepts invite code and user names
  - Redirects to room page

#### Real-Time Features
- [ ] **Socket.IO Connection**: Can connect to WebSocket
  - Connection uses staging WebSocket URL
  - Receives connection acknowledgment
- [ ] **Join Room (Socket)**: Can join room via Socket.IO
  - `room:join` event works
  - Receives `room:joined` with room state
- [ ] **User Presence**: User joined event broadcasts
  - Other clients see `user:joined` event

#### Episode Management
- [ ] **Parse RSS**: Can parse RSS feed
  - `POST /api/episodes/rss` with valid RSS URL
  - Returns episode list
- [ ] **Get Episode**: Can retrieve episode details
  - `GET /api/episodes/:id`
  - Returns episode data

#### Chat (Basic)
- [ ] **Send Message**: Can send chat message
  - `chat:message` event works
  - Message broadcasts to all clients
  - Message persists (visible after refresh)

#### Playback (Basic)
- [ ] **Playback Events**: Host can emit playback events
  - `playback:play` works
  - `playback:pause` works
  - `playback:seek` works
  - Events broadcast to all clients

### Staging Validation
- [ ] All smoke tests pass
- [ ] No errors in application logs
- [ ] No errors in browser console
- [ ] Database queries working
- [ ] Real-time features working
- [ ] Performance acceptable (<2s page load, <100ms message latency)

### Staging Sign-Off
- [ ] Team lead reviews staging deployment
- [ ] Stakeholders test staging (if applicable)
- [ ] Issues documented and resolved
- [ ] Ready for production deployment

---

## Production Deployment Checklist

### Pre-Deployment
- [ ] Staging deployment validated and signed off
- [ ] All staging smoke tests pass
- [ ] No critical bugs found in staging
- [ ] Production environment variables verified
- [ ] Production database backup created
- [ ] Migration rollback plan documented
- [ ] Rollback procedure tested (if possible)
- [ ] Team lead approval obtained

### Deployment
- [ ] **Manual Approval Gate**: Team lead approves production deployment
- [ ] Trigger production deployment
- [ ] Monitor deployment logs closely
- [ ] Verify database migrations ran successfully
  - Pre-migration backup verified
  - Migration completed without errors
  - Post-migration verification passed
- [ ] Check application startup logs
- [ ] Verify health check endpoint responds

### Post-Deployment Smoke Tests

#### Critical Path Tests (Must Pass)
- [ ] **Health Check**: `GET /health` returns 200
- [ ] **Frontend Loads**: Production URL loads without errors
- [ ] **API Responds**: Production API URL responds
- [ ] **Database Connected**: Health check shows database connected
- [ ] **Create Room**: Can create room (API + UI)
- [ ] **Join Room**: Can join room (API + UI)
- [ ] **Socket.IO Connection**: Can connect to WebSocket
- [ ] **Chat Message**: Can send and receive messages
- [ ] **Playback Sync**: Playback events work (host can control)

#### Extended Tests (Run within 15 minutes)
- [ ] **RSS Parsing**: Can parse RSS feed
- [ ] **Episode Management**: Can set episode on room
- [ ] **User Presence**: User joined/left events work
- [ ] **Moderation**: Host can mute user (if moderation implemented)
- [ ] **Invite Links**: Invite links use production URL
- [ ] **Error Handling**: Errors display appropriately (not exposing internals)

### Production Monitoring (First 15 Minutes)
- [ ] Monitor error rates (should be <1%)
- [ ] Monitor response times (API <500ms p95)
- [ ] Monitor WebSocket connection success rate (>99%)
- [ ] Check application logs for errors
- [ ] Check database connection pool usage
- [ ] Monitor server resource usage (CPU, memory)

### Production Validation
- [ ] All critical path tests pass
- [ ] No errors in application logs
- [ ] No errors in browser console (spot check)
- [ ] Error rate within acceptable range (<1%)
- [ ] Response times acceptable
- [ ] Database performance acceptable
- [ ] Real-time features working
- [ ] No user-reported issues

### Production Sign-Off
- [ ] Team lead confirms production deployment successful
- [ ] Monitoring shows healthy metrics
- [ ] No immediate rollback needed
- [ ] Deployment documented

---

## Rollback Procedure

### When to Rollback
- Critical bugs discovered in production
- Error rate >5%
- Database migration failures
- Application crashes or unavailability
- Security vulnerabilities discovered

### Rollback Steps

#### 1. Database Rollback (if migration ran)
```bash
# Restore from pre-migration backup
# OR run reverse migration scripts
npm run migrate:rollback -- --to PREVIOUS_VERSION
```

#### 2. Application Rollback
- **Vercel (Frontend)**: Revert to previous deployment via dashboard
- **Railway/Render (Backend)**: Revert to previous deployment or previous git commit
- **Manual**: Deploy previous git commit/tag

#### 3. Verification
- [ ] Previous version deployed
- [ ] Application health check passes
- [ ] Database integrity verified
- [ ] Critical functionality works
- [ ] Error rates return to normal

#### 4. Post-Rollback
- [ ] Document rollback reason
- [ ] Create issue for root cause analysis
- [ ] Plan fix for next deployment
- [ ] Notify team of rollback

---

## Emergency Contacts

### Deployment Issues
- Team Lead: [Contact Info]
- DevOps: [Contact Info]
- On-Call Engineer: [Contact Info]

### Database Issues
- Database Admin: [Contact Info]
- Backup/Restore: [Contact Info]

---

## Post-Deployment Tasks

### Immediate (Within 1 hour)
- [ ] Verify monitoring alerts are working
- [ ] Check error tracking (Sentry) for new errors
- [ ] Review application logs for anomalies
- [ ] Confirm analytics are tracking (if enabled)

### Short-term (Within 24 hours)
- [ ] Review deployment metrics
- [ ] Gather user feedback (if applicable)
- [ ] Document any issues encountered
- [ ] Update runbooks if needed

### Long-term (Within 1 week)
- [ ] Review performance metrics
- [ ] Analyze error patterns
- [ ] Plan improvements for next deployment
- [ ] Update documentation based on learnings

---

## Environment-Specific Notes

### Staging
- Staging is for testing and validation
- Can be reset/cleared if needed
- Test data is acceptable
- More verbose logging is acceptable

### Production
- Production is user-facing
- Never reset or clear production data
- Real user data only
- Minimal logging (warn/error only)
- All changes require approval

---

## Checklist Template

Copy this template for each deployment:

```
Deployment Date: ___________
Deployed By: ___________
Environment: [ ] Staging [ ] Production
Git Commit: ___________
Deployment Platform: ___________

Pre-Deployment: [ ] Complete
Deployment: [ ] Complete
Smoke Tests: [ ] Complete
Monitoring: [ ] Complete
Sign-Off: [ ] Complete

Issues Encountered:
___________________
___________________
___________________

Notes:
___________________
___________________
___________________
```
