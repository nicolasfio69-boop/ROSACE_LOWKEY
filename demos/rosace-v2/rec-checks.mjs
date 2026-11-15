/** Built-in tests segment for v2: Kaarna + Fatima set up off camera, then /checks is filmed.
 * FILM_VIEWPORT=1600x900 REDUCED_MOTION=1 node demos/rosace-v2/rec-checks.mjs (from the repo root) */
/**
 * Rosace 3-minute demo, filmed on the live site. Beats follow script.md (Show 1-19).
 *
 * Record (from the repo root):   node demos/rosace-3min/run.mjs
 * Quick silent check, no holds:  HOLDS=0 node demos/rosace-3min/run.mjs
 * Slow machine (capture < 25 fps): FILM_VIEWPORT=1600x900 REDUCED_MOTION=1 node demos/rosace-3min/run.mjs
 *   (keep FILM_VIEWPORT set for compose, inspect and verify too)
 * Narrated compose (after record):
 *   node demos/_engine/compose.mjs <renderDir> --preset macos-light --speedup idleGapMin=9999,toolWaitMax=2.5,preToolWaitMax=2,tailHold=4
 *
 * BEAT PLAN (from aligned.json: ElevenLabs voice Sarah, 140.1 s). Min hold =
 * sentence duration + 1.2 s, counted from the start of the beat.
 * #   sentence (first words…)                         dur     min hold
 * 1   "At Espoo's matchmaking events, companies…"   8.62s  10.0s
 * 2   "Rosace turns each claim into…"               3.56s   5.0s
 * 3   "Before the event, Kaarna Health,…"           7.06s   8.5s
 * 4   "Claude reads it and proposes…"               7.66s   9.0s
 * 5   "The skills come from one…"                   7.78s   9.0s
 * 6   "The recruiter stays in charge.…"             7.50s   9.0s
 * 7   "Claude then writes level examples…"          5.50s   7.0s
 * 8   "Technical skills sit beside the…"            7.36s   9.0s
 * 9   "Now the talent. Fatima was…"                10.12s  11.5s
 * 10  "It only points to clues.…"                   6.30s   7.5s
 * 11  "Where she has no real…"                      3.98s   5.5s
 * 12  "She keeps her card for…"                     5.96s   7.5s
 * 13  "The organiser sees the whole…"               7.28s   8.5s
 * 14  "For Kaarna, Fatima is suggested,…"           6.36s   8.0s
 * 15  "Every meeting is a human…"                   2.68s   4.0s
 * 16  "At the event, the recruiter…"                5.10s   6.5s
 * 17  "After the talk, they note…"                  8.34s  10.0s
 * 18  "Synthetic data only. Nationality, language,…"13.54s  15.0s
 * 19  "Stronger signal, less noise, for…"           4.12s   5.5s
 */
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'
import { loadConfig } from '../_engine/config.mjs'
import { createTimeline } from '../_engine/timeline.mjs'
import { createFilmContext, prepareFilmPage, startFilmRecording, finishFilmRecording } from '../_engine/record.mjs'
import { click, type, focus, wide, appear, done, settle, loadingStart, loadingEnd, scroll } from '../_engine/actions.mjs'
import { pause } from '../_engine/motion.mjs'
import { nextRenderDir, initRunLog, logRun } from '../_lib/paths.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const config = loadConfig(process.cwd())
const ASSETS = join(__dirname, '..', 'rosace-3min', 'assets')

// Seconds each beat must stay on screen (index = beat number), from aligned.json.
const HOLDS = new Array(30).fill(0)
const NO_HOLDS = true

async function main() {
  const baseUrl = process.env.DEMO_BASE_URL ?? config.app.baseUrl
  const { dir: renderDir } = nextRenderDir(__dirname)
  initRunLog(renderDir)
  logRun(`Base URL: ${baseUrl}`, renderDir)

  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
    args: ['--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding'],
  })
  const context = await createFilmContext(browser, renderDir)
  const page = await context.newPage()
  page.setDefaultTimeout(30000)
  // REDUCED_MOTION=1 freezes the site's background animations: smoother capture on a slow machine.
  if (process.env.REDUCED_MOTION === '1') await page.emulateMedia({ reducedMotion: 'reduce' })
  // Capture heartbeat: an invisible 1px element repaints every frame, so the CDP
  // screencast keeps sending frames during narration holds (a still page sends none,
  // which drags the capture-fps average under the 25 fps gate on long holds).
  await page.addInitScript(() => {
    const beat = () => {
      const el = document.createElement('div')
      el.style.cssText = 'position:fixed;left:0;bottom:0;width:1px;height:1px;pointer-events:none;z-index:2147483647;opacity:0.01'
      document.documentElement.appendChild(el)
      let on = false
      const tick = () => { on = !on; el.style.background = on ? '#000' : '#fff'; requestAnimationFrame(tick) }
      requestAnimationFrame(tick)
    }
    if (document.documentElement) beat()
    else document.addEventListener('DOMContentLoaded', beat)
  })
  await prepareFilmPage(page, config.cursor)

  // Preload off-camera: the first filmed event is beat 1.
  await page.goto(`${baseUrl}/?choose=1`, { waitUntil: 'commit' })
  await page.getByText('AI-written CVs all look alike', { exact: false }).waitFor()
  await settle(page)

  let timeline = createTimeline()
  let recorder = null

  let beatStart = Date.now()
  let beatNo = 0
  const beat = async (n) => {
    if (beatNo) await endBeat()
    beatNo = n
    beatStart = Date.now()
    logRun(`Beat ${n}`, renderDir)
  }
  const endBeat = async () => {
    const left = NO_HOLDS ? 0 : HOLDS[beatNo] * 1000 - (Date.now() - beatStart)
    if (left > 0) await pause(left)
  }
  const btn = (name, exact = true) => page.getByRole('button', { name, exact })
  const BRISK = { hoverMs: 300, afterMs: 420 }
  const QUICK = { hoverMs: 90, afterMs: 160 }
  let quick = false
  const tap = (locator, label, expect) => click(page, timeline, locator, label, { ...(quick ? QUICK : BRISK), ...(expect ? { expect } : {}) })
  // Fast-forward: routine clicks run quickly between appear/done, and compose
  // compresses the whole bracket to toolWaitMax (2.5 s), like a time-lapse.
  const fastForward = async (label, fn) => {
    await appear(page, timeline, label, null)
    quick = true
    try { await fn() } finally { quick = false }
    await done(page, timeline, label, null)
  }
  const upload = async (labelText, file, label) => {
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), tap(page.getByText(labelText, { exact: true }), label)])
    await chooser.setFiles(join(ASSETS, file))
    await page.getByText('Text extracted. Review it below before continuing.', { exact: true }).waitFor()
  }
  const choose = async (locator, value, label) => {
    await tap(locator, label)
    await locator.selectOption(value)
  }
  const retype = async (locator, text, label, delay = 60) => {
    await tap(locator, label)
    await page.keyboard.press('ControlOrMeta+A')
    await locator.pressSequentially(text, { delay })
  }
  const railTo = async (short, label) => {
    // Click the branch on the rosace itself (the component list below it is
    // hidden under the sticky rosace card on a 900 px tall viewport).
    await tap(page.locator('figure.rosace-figure').first().locator(`g[aria-label^="Explore ${short}"]`).first(), label)
    // Fail fast if the rail did not open the right component.
    const heading = page.locator('.form-panel h1, .form-panel h2').first()
    await heading.filter({ hasText: short }).waitFor({ timeout: 5000 }).catch(async () => {
      throw new Error(`rail "${short}": panel shows "${await heading.innerText().catch(() => '?')}" — restart the take`)
    })
  }
  const setImportance = async (name, label) => {
    await tap(btn(name), label)
    await page.locator(`button[aria-pressed="true"]`).filter({ hasText: name }).waitFor({ timeout: 4000 }).catch(() => {
      throw new Error(`${label}: "${name}" is not selected — restart the take`)
    })
  }
  const switchRole = async (role, url) => {
    await tap(page.getByRole('button', { name: /Demo profile$/ }), 'profile menu')
    await tap(page.getByRole('button', { name: new RegExp(`^${role}`) }), `switch to ${role}`)
    if (url) await page.waitForURL(`**${url}`)
    else await page.waitForTimeout(1200)
    await settle(page)
  }


  // ---- off camera: Kaarna's need and Fatima's card (same steps as rosace-3min) ----
  // 3 — recruiter imports the job post
  await beat(3)
  await fastForward('sign-in', async () => {
    await tap(page.locator('button.entry-choice').filter({ hasText: 'Choose recruiter' }), 'choose recruiter', btn('Preview email-code sign-in', false))
    await tap(btn('Preview email-code sign-in', false), 'email step', page.getByLabel('Demo verification code'))
    await type(page, timeline, page.getByLabel('Demo verification code'), '123456', 'code', { delay: 30, hoverMs: 90, afterMs: 120 })
    await tap(btn('Open recruiter workspace', false), 'open workspace')
    await page.waitForURL('**/recruiter'); await settle(page)
    await tap(page.getByRole('link', { name: 'Define a recruiter need' }).first(), 'define need')
    await page.waitForURL('**/need/new'); await settle(page)
  })
  await type(page, timeline, page.getByLabel('Company name', { exact: true }), 'Kaarna Health', 'company')
  await tap(btn('Continue to the role', false), 'to role')
  await upload('Import a job description', 'job-04-kaarna-web-developer.txt', 'import job')
  await pause(1200)
  await fastForward('role-details', async () => {
    await type(page, timeline, page.getByLabel('Job title', { exact: true }), 'Junior web developer', 'title', { delay: 25, hoverMs: 90, afterMs: 120 })
    await tap(btn('Continue to working context', false), 'to context')
    await choose(page.getByRole('combobox', { name: 'Working arrangement' }), 'Hybrid', 'hybrid')
    await tap(page.getByRole('checkbox', { name: 'I have reviewed the job and company context.', exact: false }), 'reviewed')
    await tap(btn('Explore the 12 components', false), 'explore components')
  })

  // 4 — Claude proposes, with sources
  await beat(4)
  await tap(page.getByText('Suggest requirements with Claude', { exact: true }), 'open claude panel')
  const askBox = await btn('Suggest components for this role').boundingBox()
  loadingStart(timeline, 'claude-requirements')
  await tap(btn('Suggest components for this role'), 'ask claude')
  await appear(page, timeline, 'claude-requirements', askBox)
  const proposal = page.locator('details:has-text("Proposal · not applied")').first()
  await page.getByText('Proposal · not applied', { exact: true }).waitFor({ timeout: 90000 })
  await done(page, timeline, 'claude-requirements', await page.getByText('Proposal · not applied', { exact: true }).boundingBox())
  loadingEnd(timeline, 'claude-requirements')
  const firstReq = proposal.locator('li').first()
  await focus(page, timeline, (await firstReq.count()) ? firstReq : page.getByText('Proposal · not applied', { exact: true }), 'proposal')
  
  await wide(page, timeline, 'proposal-out')
  await tap(btn('Use these requirements'), 'use requirements')
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))

  // 5 — the shared framework, majors in gold
  await beat(5)
  await wide(page, timeline, 'rosace')

  // 6 — the recruiter decides: swap one major
  await beat(6)
  await railTo('See it through', 'see it through')
  await setImportance('Minor · red', 'make minor')
  await tap(page.getByRole('radio', { name: 'Foundation', exact: true }), 'foundation')
  await railTo('Keep commitments', 'keep commitments')
  await tap(page.getByRole('radio', { name: 'Intermediate', exact: true }), 'intermediate')
  await setImportance('Major · gold', 'make major')
  logRun(`Importance after swap: ${await page.getByText(/majors ·/).first().innerText()}`, renderDir)

  // 7 — level examples for this job
  await beat(7)
  await railTo('Get it right', 'get it right')
  await tap(page.getByText('Context behind these examples'), 'open examples context')
  loadingStart(timeline, 'claude-examples')
  await tap(btn('Suggest examples from reviewed context'), 'ask examples')
  await appear(page, timeline, 'claude-examples', null)
  await page.getByText('Review the proposed examples').waitFor({ timeout: 90000 })
  await done(page, timeline, 'claude-examples', null)
  loadingEnd(timeline, 'claude-examples')
  await focus(page, timeline, page.locator('.ai-review'), 'examples')
  
  await wide(page, timeline, 'examples-out')
  await tap(btn('Use these examples'), 'use examples')

  // 8 — job skills, review, save
  await beat(8)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  await tap(btn('3 Job skills'), 'job skills')
  const tests = page.locator('.job-skill-block').filter({ hasText: 'Write automated tests' })
  if (!(await tests.getByRole('checkbox').isChecked())) await tap(tests.getByRole('checkbox'), 'tick tests')
  await tap(tests.getByRole('radio', { name: 'Intermediate', exact: true }), 'tests intermediate')
  await tap(btn('Review my need', false), 'review need')
  await scroll(page, timeline, 500, 'how it is checked')
  await retype(page.getByLabel('People to meet'), '2', 'capacity', 120)
  await tap(btn('Confirm and save need', false), 'save need', page.getByText('Need confirmed and saved', { exact: true }))

  // 9 — the talent: CV stays on the device
  await beat(9)
  await switchRole('Candidate', '/candidate')
  await tap(page.getByRole('link', { name: 'Build my skills card' }).first(), 'build card')
  await page.waitForURL('**/talent/new'); await settle(page)
  await upload('Import a synthetic CV', 'cv-08-fatima-web-bootcamp.txt', 'import cv')
  await focus(page, timeline, page.getByText('Your document is read on this device', { exact: false }), 'privacy note')
  
  await wide(page, timeline, 'privacy-out')
  await tap(btn('Explore my skills', false), 'explore skills')

  // 10-11 — three plain questions per skill
  const plan = {
    'Know the rules and stick to them': 'On my own',
    'Get it right and spot the error': 'On my own',
    'Scope a job': 'With help or guidance',
    'Work with others': 'On my own',
    'Keep commitments and manage your time': 'On my own',
    'Learn fast on your own': 'On my own',
    'Work with Git and code review': 'On my own',
    'Build a web interface (frontend)': 'On my own',
    'Write automated tests': 'On my own',
  }
  const answer = async (title) => {
    await tap(page.getByLabel('Yes, in a real task', { exact: true }), `${title}: yes`)
    await tap(page.getByLabel(plan[title], { exact: true }), `${title}: autonomy`)
    await tap(page.getByLabel('Simple or well-defined work', { exact: true }), `${title}: situation`)
    if (title === 'Get it right and spot the error') {
      await focus(page, timeline, page.locator('.form-panel'), 'clue and suggested level')
      
      await wide(page, timeline, 'clue-out')
    }
    await tap(btn('Confirm this level', false), `${title}: confirm`)
  }
  const currentTitle = async () => (await page.locator('.form-panel h1').first().innerText()).trim()
  // Answers until `stopAt` is the current skill (or the card form is reached).
  const answerUntil = async (stopAt) => {
    for (let i = 0; i < 20; i++) {
      if (await page.getByLabel('Fictional display name').count()) return
      const title = await currentTitle()
      if (stopAt && title === stopAt) return
      if (plan[title]) await answer(title)
      else await tap(btn('Leave unanswered', false), `${title}: leave`)
    }
  }
  await fastForward('first-skills', () => answerUntil('Get it right and spot the error'))
  await beat(10)
  await answer(await currentTitle())
  await fastForward('scope-job', () => answerUntil('See it through and hand it over'))
  await beat(11)
  await tap(btn('Leave unanswered', false), 'See it through: leave')
  await endBeat()
  await fastForward('other-skills', () => answerUntil(null))

  // 12 — consent, her own rosace
  await beat(12)
  await retype(page.getByLabel('Fictional display name'), 'Fatima', 'name')
  await tap(page.getByRole('checkbox', { name: 'Keep my confirmed card', exact: false }), 'consent')
  await tap(btn('Save my confirmed card'), 'save card', page.getByText('Card saved in this browser.', { exact: false }))


  // ---- off camera: recruiter keeps "Get it right" in the online plan ----
  const pickNeed = async () => {
    const sel = page.getByLabel('Company need', { exact: true })
    const v = await sel.locator('option').evaluateAll((os) => os.find((o) => o.textContent.includes('Kaarna'))?.value)
    if (v === undefined) throw new Error('Kaarna need not in /checks')
    await sel.selectOption(v)
  }
  const pickTalent = async () => {
    const sel = page.getByLabel('Talent card', { exact: true })
    if (!(await sel.count())) return
    const v = await sel.locator('option').evaluateAll((os) => os.find((o) => o.textContent.includes('Fatima'))?.value)
    if (v !== undefined) await sel.selectOption(v)
  }
  const pickExercise = async () => {
    const sel = page.getByLabel('Exercise', { exact: true })
    const v = await sel.locator('option').evaluateAll((os) => os.find((o) => o.textContent.includes('Get it right'))?.value)
    if (v === undefined) throw new Error('Get it right not in the plan: ' + (await sel.innerText()))
    await sel.selectOption(v)
  }
  await switchRole('Recruiter', null)
  await page.goto(`${baseUrl}/checks`); await settle(page)
  await pickNeed()
  await page.getByText('Choose the exercises for this role', { exact: true }).click()
  const gir = page.getByRole('checkbox', { name: /Get it right and spot the error/ })
  if (!(await gir.isChecked())) await gir.check()
  logRun(`Plan: ${await page.locator('.check-plan').innerText()}`, renderDir)
  await page.getByText('Choose the exercises for this role', { exact: true }).click()

  // ---- off camera: Fatima takes the exercise ----
  await switchRole('Candidate', null)
  await page.goto(`${baseUrl}/talent/checks`); await settle(page)
  await pickNeed(); await pickExercise()
  await page.waitForTimeout(800)
  if (!(await btn('Start exercise').count())) { logRun('CANDIDATE VIEW: ' + (await page.locator('main').innerText()).slice(0, 2500), renderDir); console.log((await page.locator('main').innerText()).slice(0, 2500)) }
  await btn('Start exercise').click()
  const prompt = await page.locator('.check-prompt').first().innerText()
  logRun(`Prompt: ${prompt}`, renderDir)
  const ANSWERS = {
    '1400 ms': 'Two errors. Steady state shows 1400 ms but is marked PASS: the limit is 1000 ms, so it must be FAIL and the interval fixed. Power recovery is NOT RUN, so that requirement is not tested yet. Before delivery: fix the interval, run the power-recovery test, and record both results.',
    '0..100': 'The code rejects 0 and 100, but the requirement says 0 to 100 inclusive: it should accept value >= 0 && value <= 100. The tests only cover 1 and 99, so both boundaries were missed. I would add tests for -1, 0, 100 and 101, and not release until the fix and these tests pass.',
  }
  const key = Object.keys(ANSWERS).find((k) => prompt.includes(k))
  if (!key) throw new Error('unexpected prompt: ' + prompt)
  await page.getByLabel('Your exercise answer').fill(ANSWERS[key])
  await btn('Submit for recruiter review').click()
  await page.waitForTimeout(800)

  // ---- off camera: recruiter opens the submitted answer ----
  await switchRole('Recruiter', null)
  await page.goto(`${baseUrl}/checks`); await settle(page)
  await pickNeed(); await pickTalent(); await pickExercise()
  await page.getByRole('heading', { name: 'Talent answer' }).waitFor()
  await page.evaluate(() => window.scrollTo({ top: 0 }))
  await settle(page)
  await pause(1500)

  // ---- FILMED: built-in tests, Claude suggests, the recruiter grades ----
  timeline = createTimeline()
  recorder = await startFilmRecording(page, renderDir, timeline)
  await wide(page, timeline, 'checks')
  await pause(1500)
  const choose2 = page.getByText('Choose the exercises for this role', { exact: true })
  await tap(choose2, 'open plan')
  await focus(page, timeline, page.locator('.check-plan'), 'plan')
  await pause(3000)
  await wide(page, timeline, 'plan-out')
  const answerBlock = page.locator('blockquote.check-answer').first()
  await answerBlock.scrollIntoViewIfNeeded()
  await focus(page, timeline, answerBlock, 'answer')
  await pause(2500)
  await wide(page, timeline, 'answer-out')
  await tap(page.getByText('Optional Claude feedback', { exact: true }), 'open feedback')
  await tap(page.getByText('Send this fictional answer to Claude.', { exact: false }), 'consent')
  loadingStart(timeline, 'claude-grade')
  await tap(btn('Request AI feedback'), 'ask grade')
  await appear(page, timeline, 'claude-grade', null)
  await page.locator('.ai-grade-proposal').waitFor({ timeout: 90000 })
  await done(page, timeline, 'claude-grade', null)
  loadingEnd(timeline, 'claude-grade')
  await page.locator('.ai-grade-proposal').scrollIntoViewIfNeeded()
  await focus(page, timeline, page.locator('.ai-grade-proposal'), 'recommendation')
  await pause(3000)
  const validate = page.locator('.ai-grade-proposal button.primary-button')
  logRun(`Recommendation: ${await page.locator('.ai-grade-proposal strong').first().innerText()}`, renderDir)
  await tap(validate, 'validate grade')
  await pause(2000)
  await wide(page, timeline, 'final')
  await pause(2000)

  timeline.dump(join(renderDir, 'timeline.json'))
  const rec = await finishFilmRecording(context, page, renderDir, recorder)
  await browser.close()
  if (!rec.ok) { console.error('raw.mp4 not produced'); process.exit(1) }
  console.log(`Recorded ${renderDir} (${rec.capturedFps} fps)`)
}

main().catch((err) => { console.error(err); process.exit(1) })
