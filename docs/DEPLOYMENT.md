# Configuration and deployment

## Environment variables

| Variable              | Required        | Purpose                                               |
| --------------------- | --------------- | ----------------------------------------------------- |
| `ANTHROPIC_API_KEY`   | For AI features | Server-only Claude key                                |
| `ANTHROPIC_MODEL`     | No              | Overrides the default model in `src/lib/server/ai.ts` |
| `CONTEXT_DEV_API_KEY` | No              | Server-only company website collection                |

Without keys, every manual flow works and the AI buttons explain that the
feature is not configured. `GET /api/integrations` reports which integrations
are configured, never the values.

### Local

```bash
cp .env.example .env.local   # fill in the keys you have
npm run test:claude          # one bounded request to check the key
npm run dev
```

`.env*` files are git-ignored and excluded from the Docker build context.
Restart the server after changing them.

## Docker

```bash
docker build -t rosace .
docker run --rm -p 3000:3000 --env-file .env.local rosace
```

The multi-stage image builds on Node 22 and runs the Next.js standalone server
as the unprivileged `node` user on port 3000.

## Aiven Runtime

The live demo runs on Aiven Runtime from the root `Dockerfile`; no database is
needed.

1. Aiven Console: **Runtime → Deploy application**, connect the GitHub
   repository and select the release branch.
2. Choose the root `Dockerfile`, build context `/`, HTTP port **3000**.
3. Add the variables above under the application's environment variables,
   with keys stored as secrets (never as build arguments).
4. Deploy. Pushes do not deploy automatically: to release a new commit, open
   **Overview → Actions → Deploy latest commit**.
5. Check `/api/integrations` (`"ai": true`, `"context": true`), `/tour` and the
   main journeys, then the runtime logs.
