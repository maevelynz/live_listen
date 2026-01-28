# Tasks

## Environment awareness (applies to all agents)

- Respect `APP_ENV` for server behavior and `NEXT_PUBLIC_APP_ENV` for client behavior.
- Use environment-specific base URLs and CORS rules.
- Never hardcode production URLs or secrets into code or docs.
- Prefer `.env.example` templates as the canonical list of required variables.
- Document any new env variables in `/docs/environments.md` and relevant `.env.example` files.

## Agent 2 (Backend + Realtime)

- Ensure API behavior is gated by `APP_ENV` (local vs staging vs production).
- Use `CORS_ORIGIN` and `SOCKET_IO_CORS_ORIGIN` for per-env CORS.
- Database init/migrations must be safe for staging/production.

## Agent 3 (Frontend)

- Use `NEXT_PUBLIC_APP_ENV` to indicate environment (e.g., banners).
- Use `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` for environment-specific endpoints.
- Avoid calling localhost URLs outside local env.

## Agent 4 (Infra/DevOps)

- Provide per-environment deployment configs and env templates.
- Define staging/production CORS and domain settings.
- Include explicit rollback and migration steps per env.

## Agent 5 (UX/UI)

- Provide UI guidance for environment indicators (e.g., staging banner).
- Consider environment-specific behavior in UX flows.

## Agent 6 (Safety/Trust)

- Document environment differences for moderation tools (staging vs production).
- Ensure any logging/retention policies are environment-aware.
