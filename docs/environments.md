# LiveListen - Environment Configuration

## Environment Matrix

| Environment | APP_ENV | NEXT_PUBLIC_APP_ENV | Purpose | Access |
|------------|---------|---------------------|---------|--------|
| **Local** | `local` | `local` | Development on developer machines | Developers only |
| **Staging** | `staging` | `staging` | Pre-production testing, QA, demos | Team + stakeholders |
| **Production** | `production` | `production` | Live user-facing application | Public |

## Environment URLs

### Local Development
- **Web Frontend**: `http://localhost:3000`
- **API Backend**: `http://localhost:3001`
- **WebSocket**: `ws://localhost:3001`
- **Database**: `localhost:5432` (via Docker Compose)

### Staging
- **Web Frontend**: `https://staging.livelisten.com` (or `https://livelisten-staging.vercel.app`)
- **API Backend**: `https://api-staging.livelisten.com` (or `https://livelisten-api-staging.railway.app`)
- **WebSocket**: `wss://api-staging.livelisten.com`
- **Database**: Managed PostgreSQL instance (separate from production)

### Production
- **Web Frontend**: `https://livelisten.com` (or `https://app.livelisten.com`)
- **API Backend**: `https://api.livelisten.com`
- **WebSocket**: `wss://api.livelisten.com`
- **Database**: Managed PostgreSQL instance (separate from staging/local)

## Environment Variables

### Required Secrets

#### API Backend (`apps/api/.env`)
| Variable | Local | Staging | Production | Description |
|----------|-------|---------|------------|-------------|
| `APP_ENV` | `local` | `staging` | `production` | Environment identifier |
| `PORT` | `3001` | `3001` | `3001` | API server port |
| `DATABASE_URL` | `postgresql://livelisten:livelisten@localhost:5432/livelisten` | Staging DB URL | Production DB URL | PostgreSQL connection string |
| `CORS_ORIGIN` | `http://localhost:3000` | `https://staging.livelisten.com` | `https://livelisten.com` | Allowed CORS origin |
| `NODE_ENV` | `development` | `production` | `production` | Node.js environment |
| `LOG_LEVEL` | `debug` | `info` | `warn` | Logging verbosity |
| `SOCKET_IO_CORS_ORIGIN` | `http://localhost:3000` | `https://staging.livelisten.com` | `https://livelisten.com` | Socket.IO CORS origin |
| `RATE_LIMIT_WINDOW_MS` | `60000` | `60000` | `60000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | `100` | `100` | Max requests per window |

#### Web Frontend (`apps/web/.env`)
| Variable | Local | Staging | Production | Description |
|----------|-------|---------|------------|-------------|
| `NEXT_PUBLIC_APP_ENV` | `local` | `staging` | `production` | Public environment identifier |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | `https://api-staging.livelisten.com` | `https://api.livelisten.com` | Public API base URL |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:3001` | `wss://api-staging.livelisten.com` | `wss://api.livelisten.com` | Public WebSocket URL |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://staging.livelisten.com` | `https://livelisten.com` | Public app URL (for invite links) |

### Optional/Feature Flags
| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_ANALYTICS` | `false` | Enable analytics tracking (staging/production only) |
| `ENABLE_ERROR_TRACKING` | `false` | Enable error tracking (Sentry, etc.) |
| `ENABLE_REDIS` | `false` | Enable Redis for caching/sessions (future) |

## Database Separation

### Local
- **Database**: `livelisten` (via Docker Compose)
- **User**: `livelisten`
- **Password**: `livelisten` (development only)
- **Host**: `localhost:5432`
- **Connection**: Direct connection, no SSL
- **Migrations**: Run manually via `npm run migrate` in `apps/api`

### Staging
- **Database**: `livelisten_staging` (separate instance)
- **Provider**: Managed PostgreSQL (Supabase, Neon, Railway, etc.)
- **Connection**: SSL required
- **Backups**: Daily automated backups
- **Migrations**: Run automatically on deploy (CI/CD) or manually via deployment script
- **Data**: Can be seeded with test data, reset periodically

### Production
- **Database**: `livelisten_production` (separate instance)
- **Provider**: Managed PostgreSQL (Supabase, Neon, Railway, etc.)
- **Connection**: SSL required
- **Backups**: Daily automated backups + point-in-time recovery
- **Migrations**: Run automatically on deploy (CI/CD) with manual approval gate
- **Data**: Production data, never reset

### Database Naming Convention
- Local: `livelisten`
- Staging: `livelisten_staging`
- Production: `livelisten_production`

## Deployment Triggers

### Local
- **Trigger**: Manual (`npm run dev`)
- **Process**: Developer runs locally
- **Database Migrations**: Manual (`npm run migrate`)
- **Build**: Development mode (hot reload)

### Staging
- **Trigger**: Push to `staging` branch OR merge to `main` (auto-deploy)
- **Process**: 
  1. CI/CD pipeline runs tests
  2. Build production bundles
  3. Run database migrations (automatic)
  4. Deploy to staging infrastructure
  5. Run smoke tests
  6. Notify team on success/failure
- **Database Migrations**: Automatic on deploy (before app restart)
- **Rollback**: Automatic on deployment failure, or manual via deployment platform

### Production
- **Trigger**: Push to `production` branch OR manual approval after staging validation
- **Process**:
  1. CI/CD pipeline runs full test suite
  2. Build production bundles
  3. **Manual approval gate** (requires team lead approval)
  4. Run database migrations (with backup verification)
  5. Deploy to production infrastructure (blue-green or rolling)
  6. Run smoke tests
  7. Monitor for 15 minutes
  8. Notify team on success/failure
- **Database Migrations**: Automatic on deploy (with pre-migration backup)
- **Rollback**: Manual trigger via deployment platform (with database rollback script)

## Database Migrations

### Migration Strategy

#### Local
```bash
cd apps/api
npm run migrate
```

#### Staging
- Migrations run automatically as part of deployment
- Pre-deployment: Create database backup
- Run migrations in transaction (rollback on failure)
- Post-deployment: Verify migration success

#### Production
- Migrations run automatically as part of deployment
- **Pre-deployment**:
  1. Create full database backup
  2. Test migration on staging database copy
  3. Manual approval required
- **During deployment**:
  1. Run migrations in transaction
  2. Verify all migrations succeed
  3. If failure: rollback transaction, abort deployment
- **Post-deployment**:
  1. Verify application health
  2. Monitor for 15 minutes
  3. If issues: trigger rollback

### Migration Commands
```bash
# Local development
npm run migrate:dev

# Staging (via CI/CD)
npm run migrate:staging

# Production (via CI/CD with approval)
npm run migrate:production
```

### Migration Rollback

#### Automatic Rollback
- If migration fails during deployment, transaction rollback is automatic
- Deployment is aborted
- Previous version remains running

#### Manual Rollback
```bash
# Rollback last migration
npm run migrate:rollback

# Rollback to specific version
npm run migrate:rollback -- --to VERSION
```

#### Production Rollback Procedure
1. **Database Rollback**:
   - Restore from pre-migration backup
   - OR run reverse migration scripts
2. **Application Rollback**:
   - Revert to previous deployment via platform (Vercel/Railway)
   - OR manually deploy previous git commit
3. **Verification**:
   - Verify application health
   - Check database integrity
   - Monitor error logs

## Environment-Specific Configuration

### Local
- **Logging**: Console output, debug level
- **Error Tracking**: Disabled
- **Analytics**: Disabled
- **Caching**: In-memory only
- **Rate Limiting**: Relaxed (for development)
- **CORS**: Permissive (localhost origins)

### Staging
- **Logging**: Structured logs, info level, sent to logging service
- **Error Tracking**: Enabled (Sentry staging project)
- **Analytics**: Enabled (test events only)
- **Caching**: Redis (if enabled)
- **Rate Limiting**: Production-like limits
- **CORS**: Restricted to staging domain
- **Feature Flags**: Can enable experimental features

### Production
- **Logging**: Structured logs, warn/error level, sent to logging service
- **Error Tracking**: Enabled (Sentry production project)
- **Analytics**: Enabled (real user events)
- **Caching**: Redis (if enabled)
- **Rate Limiting**: Strict production limits
- **CORS**: Restricted to production domain
- **Feature Flags**: Only stable features enabled

## Secrets Management

### Local
- Store in `.env` files (gitignored)
- Use `.env.example` as template
- No secret rotation required

### Staging
- Store in deployment platform secrets (Vercel/Railway environment variables)
- Use separate secret store from production
- Rotate secrets quarterly or on security incident

### Production
- Store in deployment platform secrets (Vercel/Railway environment variables)
- Use separate secret store from staging
- Rotate secrets quarterly or on security incident
- Enable secret versioning/audit logging

## Environment Validation

### Startup Checks
Both API and Web apps should validate environment on startup:

1. **Required variables present**: Fail fast if missing
2. **Database connectivity**: Verify connection before accepting requests
3. **Environment consistency**: Verify `APP_ENV` matches expected values
4. **URL format validation**: Verify URLs are valid and match environment

### Health Checks
- `/health` endpoint should verify:
  - Database connectivity
  - Environment variables loaded
  - Application ready state

## Deployment Checklist

See `/docs/launch-checklist.md` for detailed staging and production deployment checklists.

## Troubleshooting

### Common Issues

#### Environment Variable Not Found
- Check `.env` file exists and is in correct location
- Verify variable name matches exactly (case-sensitive)
- Check deployment platform secrets are set

#### Database Connection Failed
- Verify `DATABASE_URL` is correct for environment
- Check database is running (local) or accessible (staging/production)
- Verify SSL settings match environment requirements

#### CORS Errors
- Verify `CORS_ORIGIN` matches frontend URL
- Check `NEXT_PUBLIC_API_URL` matches backend URL
- Ensure WebSocket URL uses correct protocol (ws/wss)

#### Migration Failures
- Check migration scripts are valid
- Verify database backup exists (production)
- Review migration logs for specific errors
- Consider manual rollback if automatic rollback fails
