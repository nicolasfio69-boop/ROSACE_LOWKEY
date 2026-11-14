# Company context and optional AI

## Configuration

Copy `.env.example` to `.env.local`. On Windows: `copy .env.example .env.local`.
All values are server-only. Restart `npm run dev` after changing them.

| Variable                         | Purpose                                                         | Without it                                                          |
| -------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| `CONTEXT_DEV_API_KEY`            | Read the public company page entered by the recruiter           | Paste company context manually                                      |
| `AI_PROVIDER`                    | `featherless` (preferred) or `gemini` (optional legacy adapter) | Featherless by default unless only Gemini credentials already exist |
| `FEATHERLESS_API_KEY`            | Server-only Featherless credential                              | Manual level cards and review checklists                            |
| `FEATHERLESS_MODEL`              | Exact instruction/chat model ID available to the account        | Assistance stays unavailable                                        |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Optional legacy provider when `AI_PROVIDER=gemini`              | Not required for Featherless                                        |

For Featherless, use the following in `.env.local` and fill the two blank values
locally; never put credentials in chat or commit them:

```dotenv
AI_PROVIDER=featherless
FEATHERLESS_API_KEY=
FEATHERLESS_MODEL=
```

The implementation uses the OpenAI-compatible HTTP endpoint
`POST https://api.featherless.ai/v1/chat/completions`, Bearer authentication,
system/user messages, `stream=false` and a limit of 1,800 output tokens. It does
not require an OpenAI account or an extra SDK. It never silently falls back to
another paid provider. The model is not chosen automatically: select an available
instruction/chat model in the account and check its pricing and output quality.
The app requires valid JSON with complete output and then validates citations or
exact practice-answer quotes. Models that cannot follow that contract fall back
to the manual workflow with an explicit error.

A configured key does not prove it works. The interface enables the action,
then reports an upstream failure without pretending it produced live results.
No real provider request has been verified during implementation because the
keys are absent. Adapter tests use mocked HTTP responses.

## Company retrieval

The recruiter enters the company's public website and explicitly chooses “Read
this company page”. The server calls Context.dev's documented endpoint:

`POST https://api.context.dev/v1/web/scrape`

It requests markdown with `formats.markdown=true`, `mainContentOnly=true` and
`maxAgeMs=0`, and checks both HTTP status and `markdown.success`. It returns the
requested source URL, retrieval time and up to 16,000 characters. Redirect
canonical URLs are not currently tracked. The server caches up to 50 pages for
30 minutes. This is one-page collection, not a whole-site crawl or people search.
The recruiter reviews and can edit or replace the collected text.

A public HTTPS domain is required. IP literals, local hostnames, custom ports,
credentials and common social profile sites are rejected. The application never
fetches the supplied URL directly; it sends it to the fixed Context.dev API.

## Retrieval-augmented examples

1. Use only reviewed job/company context. CVs never enter this corpus.
2. Divide text into overlapping passages of up to 900 characters.
3. Select up to four passages using deterministic keyword relevance to the
   component and stated task. This is lexical retrieval, not vector search.
4. Send these passages, the role and the fixed level descriptors to the configured provider.
5. Validate the JSON, three levels and cited passage IDs. Display the proposal
   for human review before replacing the manual examples.

Source references show where a proposal is grounded; they do not guarantee that
an example or company claim is true. Prompt instructions treat collected text as
untrusted data. Output validation constrains structure, not factual correctness.
The app never lets model output change component codes, scores or declared levels.
Changing the context invalidates pending/accepted proposals in the current form.
Accepted examples are saved with the confirmed need, but generation history is
not retained; reopening a draft starts with manual examples again.

## Practice feedback

The twelve exercises and their checklists are hand-written. Only an explicit,
consented action sends a fictional answer to the explicitly named provider. The response must contain
exact quotes from that answer, follow-up questions and limitations. Extra score
fields are discarded. No feedback is saved or applied to a talent's level.
Interview observations remain a human action on a separate screen.

## APIs and implementation limits

- `/api/integrations`: configured/not-configured booleans and provider name only, never keys.
- `/api/company-context`: collection initiated by the recruiter.
- `/api/level-examples`: reviewed-context gate, known skills, bounded input.
- `/api/exercise-feedback`: consent gate, a known component, bounded answer.
- Requests are bounded to 64 KB, cross-origin browser requests rejected,
  provider calls timed out and errors sanitised. Responses use `no-store`.
- A process-local limit allows eight calls per minute per integration bucket;
  level examples and exercise feedback share the AI bucket. This is a local
  demo safeguard, not authentication or production rate limiting.
- PDFs/DOCX are parsed in the browser (3 MB, 20 PDF pages, 30,000 characters;
  job descriptions are limited to 16,000). Scanned PDFs need pasted text.

## Junction sources reviewed

The attached Context.dev challenge describes **50,000 credits** and its
JUNCTION26 offer. A live Context.dev call central to the demo is still needed
before claiming the technical challenge is demonstrated:
[Context.dev challenge](https://hackjunction.app/participate/45/tech-challenges/44).
The adapter follows [Context.dev documentation](https://docs.context.dev/).

[Oxylabs challenge](https://hackjunction.app/participate/45/tech-challenges/32)
also supports search/scrape. It is an alternative, not a second integration in
this app; its promotional subscription is unnecessary for the current path.

[Aiven challenge](https://hackjunction.app/participate/45/tech-challenges/43)
offers hosting/database possibilities and describes a $50 credit offer. Aiven
Runtime plus PostgreSQL is a candidate alternative to Vercel, subject to checking
current account availability and pricing. No hosting service has been provisioned.

[Gemini API reference](https://ai.google.dev/api/generate-content) describes the
server-only `generateContent` calls. Choose an available model in the account;
no model name or paid subscription is silently selected by this app.

## Featherless source verification

The official [Featherless cookbook](https://github.com/featherless-ai/featherless-cookbook/blob/main/basic/chatcompletion.ipynb)
demonstrates the endpoint, Bearer header, model ID and chat-message structure.
The public [model catalogue](https://api.featherless.ai/v1/models) responded during
implementation. This confirms catalogue access, not the selected account's model
entitlements or a successful generation. The docs website returned 403 in this
environment, so the official cookbook was used instead. Provider calls in tests
are mocked; a real generation still needs the user's configured key and model.
