# Contributor guide

Read `README.md` and `docs/ARCHITECTURE.md` first. Product decisions are logged
in `docs/CADRAGE.md` (French); when this file and the log disagree, the log
wins. Add a dated entry there for every new product decision.

## Rules that do not change

1. **Fixed framework.** 5 competencies, 12 components, levels Foundation /
   Intermediate / Advanced plus "Not yet", and the rosace. Component labels
   start with an action verb. Descriptors stay concrete and checkable with
   "tell me about a time when…".
2. **A person decides.** No automatic tie-break, no ranking or score shown to
   talents, no percentages. AI output is a proposal a person accepts.
3. **Synthetic data only.** No real person; never search the web for a talent.
4. **No bias inputs.** Nationality, language, age, gender, degree names and
   career path never enter a calculation or a prompt. Communication is judged
   on being understood, never on accent or grammar.
5. **Privacy.** The CV is never stored or sent to an AI provider. A talent card
   is saved only with consent, expires after six months and can be deleted.
6. **Secrets.** No key in the repository or in a `NEXT_PUBLIC_` variable. Keys
   go in `.env.local` locally and in the Aiven runtime secrets.
7. **Keep it simple.** Ask before adding a feature that is not in the decision
   log.
8. UI, code and comments are in English.

## Workflow

- Branch from the release branch and open a pull request; never push to it
  directly.
- Before pushing, run `npm run check` and `npm run build`. Run
  `npm run test:e2e` when a user journey changes. CI runs all of them.
- Keep the demo data and the `/tour` walkthrough working at every step.
- Put domain logic in `src/lib` as pure functions with a `*.test.ts` next to
  them; components render and call those functions.
- Server-only code lives in `src/lib/server` and is reached through the
  `/api` routes, which must use the guards in `src/lib/server/http.ts`.
