# Deploy Rosace on Aiven Runtime

Prepared for `feat/coherent-ux`, PR #11. This change prepares the container; it does not deploy the application or create a paid service. Browser storage remains local to each browser. No PostgreSQL or other data service is required.

## Run and check the container locally

```bash
docker build -t rosace:local .
docker run --rm -p 3000:3000 rosace:local
```

Open http://localhost:3000 and `/tour`. The multi-stage image builds on Node 22, runs Next.js standalone as the unprivileged `node` user, and includes public assets and `.next/static`. No secret is needed to build or demonstrate the manual journey. `.dockerignore` excludes all environment files from the build context.

## Deploy from this repository

The official [Runtime overview](https://aiven.io/docs/products/runtime), [deployment instructions](https://aiven.io/docs/products/runtime/deploy-apps) and [manifest documentation](https://aiven.io/docs/products/runtime/manifest-files/manifests) were checked on 14 November 2026.

1. In Aiven Console, select the project with the approved hackathon credits, then **Runtime → Deploy application**.
2. Connect the GitHub account with access to `nicolasfio69-boop/JUNCTION_RECRUITMENT_COMPETENCIES`. Connecting GitHub requires the Aiven organisation admin role; deployment requires project service-write, manager or admin permissions.
3. Select the repository and branch `feat/coherent-ux`. Choose **Next**, select the root `Dockerfile` and **Scan**. Aiven accepts a Dockerfile as a single-application manifest; no Compose file or database is needed.
4. Check the build context is the repository root, the container file is `Dockerfile`, and the HTTP container port is **3000**. Review the application name, plan, region and cost before deployment. Do not add a database integration.
5. Configure runtime environment variables and secrets as below. These belong to Aiven's runtime settings, never GitHub source or build arguments.
6. Deploy when ready. Open the application URL from Aiven, test `/tour`, the recruiter/talent journeys and `/checks`, then inspect Runtime logs for build/start errors. Never log CVs, exercise responses or secret values.
7. Later pushes do **not** deploy automatically according to the current documentation. To release a reviewed commit, open the application's **Overview → Actions → Deploy latest commit**. Confirm the branch's latest commit is the intended release before clicking.

## Runtime configuration

| Variable | Kind | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Secret | Server-only Claude credential |
| `ANTHROPIC_MODEL` | Variable, optional | Defaults to `claude-sonnet-5-5`; set only to use another model |
| `CONTEXT_DEV_API_KEY` | Secret, optional | Server-only company-context collection |

No credential value belongs in this document. Without AI credentials, human review and all manual flows work. After a change, restart the service (or deploy the latest commit) and open `/api/integrations`: it must answer `"ai":true` and, with Context.dev, `"context":true`. Never use a `NEXT_PUBLIC_` name for a secret. For local development only, use ignored `.env.local` and restart `npm run dev` after configuration changes.

## Before the first real deployment

- Confirm available hackathon credits, Runtime eligibility, the chosen plan and the cost after credits expire.
- Confirm a suitable **European region** is available for Runtime in this account. Do not infer region availability from PostgreSQL's region list.
- Verify access to runtime secret settings and outbound HTTPS to Claude and, optionally, Context.dev. Live provider calls still need validation with the account's model and credits.
- Browser data does not sync across devices or roles on different machines. The demo deliberately shares a single browser, with no authenticated accounts. Local talent-card deletion/expiry also removes linked checks and observations.
- Aiven hosting is separate from a future shared database/authentication phase. No such phase is included here.
