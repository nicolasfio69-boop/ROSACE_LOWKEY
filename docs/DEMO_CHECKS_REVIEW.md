# Automatic demo and timed checks

Owner-requested follow-up to the welcome flow, 14 November 2026. The new request explicitly allows Claude to **recommend** A/C/F/NE for a submitted online exercise. Only a recruiter's explicit decision creates an observation. This supersedes the earlier feedback-only rule, while preserving the fixed framework, calculation and human responsibility.

## Watch the three-minute demo

Open `/tour`. NordChip, Amira and every example are already filled in. Playback covers four 45-second chapters: the need, the candidate card, the organiser's decision and online/on-site verification. Each chapter has four moments. Use **Pause demo**, **Restart**, chapter buttons or moment buttons to inspect an example. Playback starts paused when reduced motion is requested.

The recording shows a prewritten AI recommendation and a prewritten human decision. It never calls Claude, sends invitations or writes the event workspace. The observed rosace changes only at the recorded human-validation moment; revisiting the AI-recommendation moment shows no observation. Leaving the tab pauses its elapsed playback time.

## Prepare and complete a check

1. **Recruiter → Checks:** choose the company need and demo talent. **Choose the exercises for this role** selects relevant online requirements within the existing 20-minute budget. NordChip defaults to problem analysis (6 minutes), error spotting (6) and embedded C (8). A learning-tool task uses the entire 20-minute allowance on its own.
2. **Candidate → My checks:** review the selected plan. A confirmed Foundation, Intermediate or Advanced declaration determines the task version. Unknown and Not yet do not become Foundation automatically.
3. **Start exercise:** opens the prompt and timer. The screen concentrates on the task and answer. At the deadline writing stops; the candidate can explicitly submit the existing answer. No submission or grade is automatic. **Discard this attempt** returns to preparation.
4. **Recruiter → Checks:** read the exact submitted exercise, answer and three criteria. Review manually, or explicitly consent to sending the fictional answer and exercise to Claude. A recommendation includes A/C/F/NE, a rationale and criterion-level evidence. Demonstrated criteria must quote exact answer text. No numeric score, rank or inferred personal trait is accepted.
5. **Validate recommended grade**, or choose a different A/C/F/NE grade. Only this action records an observation. Replacing the answer clears the old grade. Reviewing an obsolete attempt is rejected, including when two attempts have identical answer text but different timings or exercise snapshots.
6. **At the meeting:** the relevant situations and questions are shown separately, with the full conversation brief available to the recruiter. On-site situations share ten minutes. Long-term commitments remain **Discussed, not observed**.

All 26 skills whose approved verification mode includes online now have three hand-written, self-contained variants: six Centrale components and twenty technical skills. This is **78 available variants, not 78 required exercises**. All use fictional inputs and can be answered without external accounts or hardware. Submitted code is never executed. Recruiters can optionally request and approve a contextual Claude version using the existing reviewed-context retrieval.

The two timing questions were offered to the owner. In the absence of a different choice, this delivery preserves the existing 20-minute framing limit and uses the announced stop-writing/explicit-submit behaviour. These are documented, reversible settings to review with the owner, not a claim that a new event policy was validated by Espoo.

## Limits to understand

- This remains a local demo shared by roles in one browser, without real accounts. The timer is a practice aid, not a server-enforced examination or identity/proctoring system. Reloading loses the unsubmitted draft and allows a fresh attempt.
- Timing is recorded with the submission for context; it never determines a grade. Existing submissions without timing remain readable.
- The library provides concrete exercises, not a validated psychometric assessment. A recruiter still needs to review difficulty, relevance and accessibility for actual event roles.
- No live Anthropic call was made for this delivery. The recording uses explicit fixtures; automated provider tests use mocked responses. Configure the key only in ignored `.env.local` and follow [CLAUDE_SETUP.md](CLAUDE_SETUP.md) for the real API test.
- The rest of the event's human decisions, declared levels, matching rules, observation mean and C4.3 exclusion remain unchanged. Aiven deployment and shared accounts are still separate work.

## Try it from Cursor

In the existing repository checkout:

```bash
git fetch origin
git switch feat/coherent-ux
git pull --ff-only origin feat/coherent-ux
npm ci
npm run dev
```

Open http://localhost:3000/tour for playback, or http://localhost:3000/?choose=1 for the welcome. If the terminal uses another port, use that address. No API key is needed for playback or manual checks.

| Example | Desktop | Mobile |
| --- | --- | --- |
| Recruiter need recording | [Open](images/check-journey/tour-0-1440.png) | [Open](images/check-journey/tour-0-390.png) |
| Candidate declarations | [Open](images/check-journey/tour-1-1440.png) | [Open](images/check-journey/tour-1-390.png) |
| Organiser decision | [Open](images/check-journey/tour-2-1440.png) | [Open](images/check-journey/tour-2-390.png) |
| On-site observation | [Open](images/check-journey/tour-3-1440.png) | [Open](images/check-journey/tour-3-390.png) |
| Illustrative AI recommendation | [Open](images/check-journey/tour-recommendation-1440.png) | [Open](images/check-journey/tour-recommendation-390.png) |
| Candidate preparation | [Open](images/check-journey/candidate-ready-1440.png) | [Open](images/check-journey/candidate-ready-390.png) |
| Timed answer | [Open](images/check-journey/candidate-timed-1440.png) | [Open](images/check-journey/candidate-timed-390.png) |
| Recruiter review | [Open](images/check-journey/recruiter-review-1440.png) | [Open](images/check-journey/recruiter-review-390.png) |

See [VALIDATION.md](VALIDATION.md) for checks and [CHALLENGE_ALIGNMENT.md](CHALLENGE_ALIGNMENT.md) for alignment with Espoo's original challenge.
