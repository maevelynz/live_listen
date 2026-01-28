# Architecture

LiveListen consists of a Next.js web app and a Node/Express API with Socket.IO.

## Environment Configuration Strategy

- `APP_ENV` (API/server) defines runtime environment: `local`, `staging`, `production`.
- `NEXT_PUBLIC_APP_ENV` (web) exposes the runtime environment to the client for UI banners or feature gating.
- API reads `CORS_ORIGIN` and `SOCKET_IO_CORS_ORIGIN` per environment to restrict access.
- Web reads `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` to route requests to the correct environment.

**Local defaults**

- Web: `http://localhost:3000`
- API: `http://localhost:3001`

**Staging/Production**

- Environment variables are provided by the deployment platform.
- Never commit `.env` files with secrets to the repo.
