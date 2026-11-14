# Integrations — current configuration

See [CLAUDE_SETUP.md](CLAUDE_SETUP.md) for the local setup and interactive test procedure.

## Anthropic only

All AI runs on the Next.js server through `https://api.anthropic.com/v1/messages`, with `x-api-key` and `anthropic-version: 2023-06-01`. Configure `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` in ignored `.env.local`, or as runtime settings on Aiven. No key reaches the browser. Previous Featherless/Gemini credentials and `AI_PROVIDER` are not used. Calls are explicit, bounded and never retried against another provider.

Official [Messages documentation](https://platform.claude.com/docs/en/api/messages) and [model overview](https://platform.claude.com/docs/en/about-claude/models/overview) were consulted on 14 November 2026. `claude-sonnet-5-5` is the suggested configurable starting model. Account access, billing and live output quality still need the owner's real API test; unit and browser tests use controlled responses.

## Reviewed-context retrieval

`src/lib/context.ts` chunks job/company text and retrieves a bounded set of passages using the skill and task. This is lexical RAG, not a vector database or fine-tuning. Context.dev can optionally collect company text through its server adapter; the recruiter reviews it before use. Manual pasted context also works. No talent is searched online and no CV enters this corpus.

- `/api/need-proposal`: proposes closed-list requirements; exactly three majors and at most three technical skills. Each reason must cite a retrieved passage. The recruiter accepts or discards the proposal.
- `/api/level-examples`: proposes three contextual examples with validated passage references.
- `/api/check-proposal`: proposes one exercise and three review criteria at a fixed declared task level and duration. The recruiter must approve it before candidate use.
- `/api/exercise-feedback`: receives an explicitly consented fictional answer and the exercise snapshot. It returns quoted feedback and questions, never a grade.
- `/api/integrations`: exposes configuration availability and provider name only, never credentials. This does not prove a successful paid request.

Prompts treat documents and answers as untrusted data. Outputs are schema-checked, unknown references/codes and invalid levels rejected, score/grade fields discarded. A human supplies every A/C/F/NE observation.

## Data and limits

Requests are limited to 64 KB, cross-origin browser requests rejected, responses marked `no-store`, and provider errors sanitized. The process-local AI bucket permits eight calls per minute and calls time out after 45 seconds. These are demo limits, not authenticated multi-user rate controls.

Documents are parsed on-device. CV text/quotes are transient. Submitted **fictional exercise answers**, approved exercises and human observations are saved in browser storage; submission snapshots keep the question/checklist stable. Talent deletion or expiry removes linked answers/observations. Provider retention is governed by the API account terms.

For hosting, use [DEPLOY_AIVEN.md](DEPLOY_AIVEN.md). No live deployment or database is included. Runtime credentials must be configured separately from local `.env.local`.
