# Architecture

## Overview

LiveListen is split into a web client and an API server with shared contracts.

- **Web**: Next.js app in `apps/web`
- **API**: Node/Express app in `apps/api`
- **Shared**: TypeScript types in `packages/shared`

## Environment configuration strategy

The application must be environment-aware across local, staging, and production.

### Server-side env (API)

- `APP_ENV` controls runtime behavior and feature toggles at the API layer.
- Expected values: `local`, `staging`, `production`.

### Client-side env (Web)

- `NEXT_PUBLIC_APP_ENV` is exposed to the browser for environment-specific UI cues.
- Expected values: `local`, `staging`, `production`.

### Shared rules

- All services must fail fast if required environment variables are missing.
- Never expose secrets to the browser; only `NEXT_PUBLIC_*` variables are safe.
- Use environment-specific `.env` templates as the source of truth.
