# TASKS

This task list coordinates multi-agent work. All agents must remain environment-aware and use `APP_ENV` / `NEXT_PUBLIC_APP_ENV` as defined in `docs/environments.md`.

## Agent 1 (Orchestrator)
- Provide environment documentation and templates.
- Ensure all docs include `local`, `staging`, `production` guidance.

## Agent 2 (Backend + Realtime)
- Respect `APP_ENV` for local-only bootstrapping logic.
- Use CORS + Socket.IO origins that map to environment URLs.
- Do not hardcode environment-specific URLs; always use env vars.

## Agent 3 (Frontend)
- Read `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL` at runtime.
- Show a subtle staging banner when `NEXT_PUBLIC_APP_ENV=staging`.
- Avoid production-only behavior in local/staging builds.

## Agent 4 (Infra/DevOps)
- Maintain separate staging/prod deployments with isolated secrets and DBs.
- CI/CD must validate environment variables for each target.
- Provide rollback guidance for each environment.

## Agent 5 (UX/UI)
- Document environment-aware UI states (e.g., staging ribbon).
- Ensure UX flows explicitly call out staging vs prod differences.

## Agent 6 (Safety/Trust)
- Define moderation and logging requirements per environment.
- Ensure staging/testing data never mixes with production data.
