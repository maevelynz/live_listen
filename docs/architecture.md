# Architecture

LiveListen is a web app for shared listening rooms with realtime chat and playback sync.

## High-level overview

- **Web**: Next.js application (UI, auth, room management).
- **API**: Node/Express API with Socket.IO for realtime events.
- **Database**: Postgres for persistent data (users, rooms, messages, playback state).

## Environment configuration strategy

The app uses explicit environment flags and public build-time variables.

### Server (API)
- `APP_ENV` controls server behavior: `local`, `staging`, or `production`.
- Environment-specific config (DB, CORS, logging) is provided via env vars.

### Client (Web)
- `NEXT_PUBLIC_APP_ENV` is exposed to the browser and should mirror `APP_ENV`.
- Public URLs are injected via `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`.
- The client must not rely on server-only env vars.

### Example mapping

| Environment | APP_ENV | NEXT_PUBLIC_APP_ENV |
| --- | --- | --- |
| Local | `local` | `local` |
| Staging | `staging` | `staging` |
| Production | `production` | `production` |
