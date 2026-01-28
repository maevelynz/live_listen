# Architecture

## Overview

LiveListen is composed of:

- **Web**: Next.js app in `apps/web`.
- **API**: Node.js/Express + Socket.IO in `apps/api`.
- **Shared contracts**: types and event contracts in `packages/shared`.
- **Postgres**: primary datastore for users, rooms, chat, and playback state.

## Environment configuration strategy

Environment configuration is standardized across the stack:

- `APP_ENV` identifies the runtime environment (`local`, `staging`, `production`).
- `NEXT_PUBLIC_APP_ENV` mirrors `APP_ENV` for client-side behavior and badges.
- API and Web read their env vars from `.env` files in local development.
- Staging/production rely on hosting platform environment variables.

### API

The API uses `APP_ENV` for environment gating (e.g., local-only bootstrap or dev-only logging). It should always read connection and security settings from env vars.

### Web

The web app reads `NEXT_PUBLIC_*` vars at build time. `NEXT_PUBLIC_APP_ENV` is used to drive UI cues (e.g., staging banner) and to select the correct API/WS endpoints.

### Shared contracts

Contracts are environment-agnostic and should not include env-specific defaults. Env-derived behavior should live at the application layer.
