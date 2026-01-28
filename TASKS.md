# TASKS

## Global environment rules (all agents)

- Use **`APP_ENV`** (`local`, `staging`, `production`) for server-side environment checks.
- Use **`NEXT_PUBLIC_APP_ENV`** for client-side environment cues.
- Do not hardcode URLs; use env vars from templates.
- Ensure staging/production are **DB-isolated** and never share secrets.

## Agent 2 — Backend + Realtime (environment-aware)

- Read all configuration from env vars (see `apps/api/.env.example`).
- Gate any local-only bootstrap logic with `APP_ENV=local`.
- Use `CORS_ORIGIN` and `SOCKET_IO_CORS_ORIGIN` for CORS settings.
- Log environment at startup (`APP_ENV`) but do not print secrets.

## Agent 3 — Frontend (environment-aware)

- Use `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_API_URL`, and `NEXT_PUBLIC_WS_URL`.
- Show a **staging banner** when `NEXT_PUBLIC_APP_ENV=staging`.
- Ensure the web app works without code changes across envs (build-time envs only).

## Agent 4 — Infra/DevOps (environment-aware)

- Provide staging + production env templates and CI/CD steps.
- Ensure deployment plans include DB separation and CORS by env.

## Agent 5 — UX/UI (environment-aware)

- Document staging banner and environment-specific UI cues.
- Avoid references to localhost-only flows in final UX docs.

## Agent 6 — Safety/Moderation (environment-aware)

- Ensure logging/retention guidance distinguishes staging vs production.
- Avoid storing PII in staging beyond what is needed for tests.
