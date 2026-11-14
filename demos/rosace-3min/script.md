# Rosace: one hiring story at Espoo Tech Matchmaking (3 min)

Filmed on the live site (`demo.config.json` → `app.baseUrl`). Everything is
fictional: Kaarna Health is not in the built-in demo data, so the need is
created live; NordChip, Lumora, Vireo Data and ten talents are already there.
Human-readable shooting sheet (French): https://claude.ai/artifact/4Emi71TABexwy9r1kXqwqo

## Prep

- Fresh browser context: the site keeps everything in localStorage, so a new
  context starts from the built-in data only. One talent card per browser.
- Files uploaded on camera: `assets/job-04-kaarna-web-developer.txt`,
  `assets/cv-08-fatima-web-bootcamp.txt`.
- Claude calls take ~15 s (requirements) and ~4 s (level examples): bracket
  them with loadingStart/appear/done/loadingEnd so compose compresses them.
- Rate limit: 6 Claude calls per minute per visitor. Wait a minute between takes.
- Target length: about 3 minutes (the user asked for 3 min, above the usual
  2-min guideline of film-demo).
- Engine patch: `_engine/actions.mjs` error scan ignores the competency name
  "Get it right and spot the error" (see the comment there).
- Expected results, checked on the live site on 2026-11-14: Claude proposes
  majors "Know the rules", "Get it right", "See it through"; after the
  recruiter's swap, Fatima is "Suggested" for Kaarna with "Declared alignment
  · 24 out of 25"; the ten built-in talents show "More information needed".

## Say
1. "At Espoo's matchmaking events, companies send their needs the night before, and every CV now sounds the same, because AI wrote it."
2. "Rosace turns each claim into a question you can check during the conversation."
3. "Before the event, Kaarna Health, a small Espoo start-up, opens the recruiter space and drops in its job post."
4. "Claude reads it and proposes what matters, citing the sentence each requirement comes from. Nothing applies until the recruiter accepts."
5. "The skills come from one shared framework: twelve components, the same for every company. The three majors are drawn in gold."
6. "The recruiter stays in charge. For a junior, Kaarna cares most about flagging a late ticket early, so they swap one major."
7. "Claude then writes level examples for this exact job, so Intermediate means something concrete."
8. "Technical skills sit beside the rosace. Each requirement already says how it will be checked, and Kaarna will meet two people."
9. "Now the talent. Fatima was a pharmacy assistant, then did a coding bootcamp. Her CV stays on her device: it is never stored, and never sent to AI."
10. "It only points to clues. For each skill, she answers three plain questions, and she confirms her own level."
11. "Where she has no real example, she simply leaves the skill unanswered."
12. "She keeps her card for six months, with her consent, and sees her own rosace, never a rank or a score."
13. "The organiser sees the whole event: three other companies and ten talents. Ties are never hidden; they go to a person."
14. "For Kaarna, Fatima is suggested, with the reasons behind it. Profiles from other jobs are not pushed forward."
15. "Every meeting is a human click, with a short reason."
16. "At the event, the recruiter walks in with questions that check each claim, not with a ranking."
17. "After the talk, they note what they actually saw. Observed stays separate from declared: Fatima's own words are never overwritten."
18. "Synthetic data only. Nationality, language, degree and career path never enter a calculation. Recruitment is high-risk under the EU AI Act, so Rosace only suggests, and always shows why."
19. "Stronger signal, less noise, for Espoo's next matchmaking event."

## Show
1. Welcome page `/?choose=1`, wide, hold. (¢ "At Espoo's matchmaking events…")
2. Focus the promise line "AI-written CVs all look alike…", hold, wide. (¢ "Rosace turns each claim…")
3. Click "Choose recruiter" → "Preview email-code sign-in" → type 123456 in "Demo verification code" → "Open recruiter workspace" → "Define a recruiter need". Type `Kaarna Health` in "Company name", click "Continue to the role", click "Import a job description" and choose `job-04-kaarna-web-developer.txt` → expect "Text extracted…". Type `Junior web developer` in "Job title", click "Continue to working context", choose Hybrid, tick "I have reviewed the job and company context.", click "Explore the 12 components".
4. Open "Suggest requirements with Claude", click "Suggest components for this role" (loading bracket) → expect "Proposal · not applied". Focus the first proposed requirement with its cited passage, hold, wide. Click "Use these requirements".
5. Wide on the rosace with the gold majors, hold.
6. Open "Browse the 12 components". Click "See it through" → "Minor · red" → Foundation. Click "Keep commitments" → Intermediate → "Major · gold". Hold on the rosace.
7. Click "Get it right", open "Context behind these examples", click "Suggest examples from reviewed context" (loading bracket) → focus "Review the proposed examples", hold, wide, click "Use these examples".
8. Click "3 Job skills" (frontend, automated tests and Git are already ticked by Claude); set "Write automated tests" to Intermediate. Click "Review my need", hold on "How it's checked", type 2 in "People to meet", click "Confirm and save need" → expect "Need confirmed and saved".
9. Profile menu "Recruiter · Demo profile" → "Candidate" → "Build my skills card". Click "Import a synthetic CV", choose `cv-08-fatima-web-bootcamp.txt`; focus the note "Your document is read on this device…", hold, wide. Click "Explore my skills".
10. On each skill with a clue (Know the rules, Get it right, Work with others, Keep commitments, Learn fast, Git, frontend, automated tests): "Yes, in a real task" → "On my own" → "Simple or well-defined work" → "Confirm this level". Scope a job: "With help or guidance" instead of "On my own". Focus the clue + suggested level once (Get it right), hold, wide.
11. On the other skills (Reach out, Convince, See it through, Own your decisions, Break down a problem, Communicate clearly): "Leave unanswered".
12. Type `Fatima` in "Fictional display name", tick "Keep my confirmed card", click "Save my confirmed card" → expect "Card saved in this browser". Hold on her rosace.
13. Profile menu → "Organiser" → "Open the event desk". Click the Vireo Data tile, hold on the tie (Priya, Tuomas) and "People without a suggestion".
14. Click the Kaarna Health tile. Open Fatima's card ("Suggested"); focus "Declared alignment · 24 out of 25", hold, wide.
15. Type the reason `Booking app with tests in her bootcamp team; check how she tested the payment flow.`, click "Approve / add" → expect "Approved".
16. Click "Prepare conversation" → brief "Fatima × Kaarna Health". Focus one question ("Tell me about a time when you delivered work that had to pass a review…"), hold, wide.
17. Click "Record observations". "Get it right" → "A — Seen clearly"; "Know the rules" → "C — Seen in part"; focus the "Observed separately" rosace, hold; click "Compare with the original declaration", hold, wide.
18. Sidebar "My workspace" → "How Rosace works" → scroll to "Responsible by design", focus it, hold.
19. Wide on the overview, hold ≥ 4 s, stop.
