# Tasks

## Agent 1 (Orchestrator)
- Ensure docs and environment templates cover `local`, `staging`, and `production`.
- Confirm any new configuration references `APP_ENV` and `NEXT_PUBLIC_APP_ENV`.

## Agent 2 (Backend + Realtime)
- Use `APP_ENV` to guard local-only behavior (e.g., auto-migrations).
- Respect `CORS_ORIGIN` and `SOCKET_IO_CORS_ORIGIN` per environment.
- Keep API base URLs and ports configurable via env.

## Agent 3 (Frontend)
- Read `NEXT_PUBLIC_APP_ENV` to display environment banners when needed.
- Use `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` for all network calls.
- Never hardcode localhost URLs in production paths.

## Agent 4 (Infra/DevOps)
- Provide environment-specific templates and CI/CD for staging and production.
- Ensure secrets are stored outside the repo and rotated per environment.

## Agent 5 (UX/UI)
- Include staging/production UI considerations (banners, labels, and safe defaults).
- Document UX differences between staging and production in design specs.

## Agent 6 (Safety/Trust)
- Note environment impacts on logging, retention, and monitoring.
- Ensure moderation tooling is clearly scoped per environment.
