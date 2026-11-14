# Claude setup and the two workspaces

Latest owner decision, 14 November 2026: all AI calls use **Anthropic**, replacing Featherless and Gemini. Existing credentials for those providers are not used. Next.js still supplies both the interface and server routes.

## Put the key on your own computer

In Cursor, open the repository on `feat/coherent-ux`. Create **`.env.local` at the repository root**, next to `package.json`. Copy the variable names from `.env.example`, then fill the API key locally:

```dotenv
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-5-5
CONTEXT_DEV_API_KEY=
```

The empty key above is intentional. Paste the real value only after `ANTHROPIC_API_KEY=` in your local file, never in the chat, a commit, browser code or a `NEXT_PUBLIC_` variable. `.env.local` is Git-ignored and excluded from Docker builds. `CONTEXT_DEV_API_KEY` is optional.

`claude-sonnet-5-5` is the configurable starting model, checked against Anthropic's [model overview](https://platform.claude.com/docs/en/about-claude/models/overview) on 14 November 2026. Choose an available model from your API account if necessary. The Claude chat subscription and API billing are separate.

Then run, in the project's Cursor terminal:

```bash
npm ci
npm run test:claude
npm run dev
```

The connection test makes **one bounded API request**, containing only a fictional connection check. It prints success or a sanitized error, never the key or upstream response body. Do not run it until API billing/access is configured. Restart the dev server whenever `.env.local` changes.

Open http://localhost:3000. The top **View as** selector chooses Candidate, Recruiter or Organiser. These are separate demo workspaces, not authenticated accounts.

## Try the actual flows

1. **Recruiter → Recruiter need:** review fictional job/company context. In the component journey, open **Suggest requirements with Claude**. Read the reasons and cited passages; **Use these requirements** explicitly replaces the selection. Level-card proposals also use Claude.
2. **Recruiter → Checks:** select the company need and fictional talent. Open **Prepare an exercise with Claude**, review its context, request a draft and inspect its prompt, checklist and sources. **Approve this exercise** publishes it to the candidate workspace in this browser.
3. **Candidate → My checks:** the declared level selects the exercise version. Submit an answer. No recruiter grading controls appear here.
4. **Recruiter → Checks:** review the submitted version and the short checklist. Optional Claude feedback requires explicit consent and a button click. Only the recruiter gives A/C/F/NE; the rosace changes from that human observation.
5. Switch between roles using the header. The check's company/talent selection is retained in the URL. Browser storage is shared only within this browser, not across different machines.

## What the RAG actually does

This is a small, auditable retrieval pipeline, **not model training or a vector database**. It chunks reviewed job/company text, ranks passages against the job/task/skill, and sends a bounded selection to Claude. Proposals must cite existing passage IDs, use the closed catalogue, respect three majors and at most three technical skills, and pass validation before display. Sources and reasons are visible to the recruiter. Unknown citations, invalid levels, truncated output and invalid JSON are rejected.

Exercise duration and level are fixed by application code, not the model. The candidate's submission stores a snapshot of the approved question/checklist, so later edits cannot silently change what the recruiter grades. Feedback receives that exact exercise and the explicitly submitted fictional answer. It cannot set a grade. CVs never enter the retrieval corpus or API payloads.

## Still required

- Add the API key locally, run the connection test, and try the three proposals with actual Claude responses. Mock tests cannot establish live model quality or account access.
- Review the proposed questions and examples with Espoo/recruiters. Only the three online demo skills currently have exercise delivery; the other verification modes remain in the framing plan.
- Confirm Aiven Runtime credits, European region and runtime secret settings before deployment. Set `ANTHROPIC_API_KEY` there as a secret and `ANTHROPIC_MODEL` as a runtime variable, not a build argument.
- Shared accounts, authenticated permissions and data shared across devices remain a later phase. Role separation here is an interface distinction, not access control.
- Confirm submission deadline, pitch duration, team and video/slides/submission format.
