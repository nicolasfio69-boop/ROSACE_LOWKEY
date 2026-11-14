/**
 * Rosace 3-minute demo, filmed on the live site. Beats follow script.md (Show 1-19).
 *
 * Record (from the repo root):   node demos/rosace-3min/run.mjs
 * Quick silent check, no holds:  HOLDS=0 node demos/rosace-3min/run.mjs
 * Slow machine (capture < 25 fps): REDUCED_MOTION=1 node demos/rosace-3min/run.mjs
 * Narrated compose (after record):
 *   node demos/_engine/compose.mjs <renderDir> --preset macos-light --speedup idleGapMin=9999,toolWaitMax=2.5,preToolWaitMax=2,tailHold=4
 *
 * BEAT PLAN — estimated at ~2.6 words/s + 1.2 s. produce-video must replace
 * HOLDS with the real sentence durations from aligned.json (+ ~1.2 s).
 * #   sentence (first words…)                         est. min hold
 * 1   "At Espoo's matchmaking events…"                 9.5s
 * 2   "Rosace turns each claim…"                       6.0s
 * 3   "Before the event, Kaarna Health…"               8.0s
 * 4   "Claude reads it and proposes…"                  9.5s
 * 5   "The skills come from one shared framework…"     8.5s
 * 6   "The recruiter stays in charge…"                 9.0s
 * 7   "Claude then writes level examples…"             6.5s
 * 8   "Technical skills sit beside the rosace…"        8.5s
 * 9   "Now the talent. Fatima was…"                   11.0s
 * 10  "It only points to clues…"                       7.5s
 * 11  "Where she has no real example…"                 5.0s
 * 12  "She keeps her card for six months…"             8.0s
 * 13  "The organiser sees the whole event…"            8.5s
 * 14  "For Kaarna, Fatima is suggested…"               7.5s
 * 15  "Every meeting is a human click…"                4.5s
 * 16  "At the event, the recruiter walks in…"          6.5s
 * 17  "After the talk, they note…"                     9.0s
 * 18  "Synthetic data only…"                          13.5s
 * 19  "Stronger signal, less noise…"                   5.0s
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
const ASSETS = join(__dirname, 'assets')

// Seconds each beat must stay on screen (index = beat number). Replace from aligned.json.
const HOLDS = [0, 9.5, 6.0, 8.0, 9.5, 8.5, 9.0, 6.5, 8.5, 11.0, 7.5, 5.0, 8.0, 8.5, 7.5, 4.5, 6.5, 9.0, 13.5, 5.0]
const NO_HOLDS = process.env.HOLDS === '0'

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
  await prepareFilmPage(page, config.cursor)

  // Preload off-camera: the first filmed event is beat 1.
  await page.goto(`${baseUrl}/?choose=1`, { waitUntil: 'commit' })
  await page.getByText('AI-written CVs all look alike', { exact: false }).waitFor()
  await settle(page)

  const timeline = createTimeline()
  const recorder = await startFilmRecording(page, renderDir, timeline)

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
  const tap = (locator, label, expect) => click(page, timeline, locator, label, expect ? { expect } : {})
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
    const nav = page.locator('details.component-navigator')
    if (!(await nav.evaluate((d) => d.open))) await tap(nav.locator('summary'), 'open component list')
    await tap(nav.locator('nav.journey-rail button').filter({ hasText: short }).first(), label)
  }
  const switchRole = async (role, url) => {
    await tap(page.getByRole('button', { name: /Demo profile$/ }), 'profile menu')
    await tap(page.getByRole('button', { name: new RegExp(`^${role}`) }), `switch to ${role}`)
    await page.waitForURL(`**${url}`)
    await settle(page)
  }

  // 1 — the problem
  await beat(1)
  await wide(page, timeline, 'welcome')

  // 2 — the promise
  await beat(2)
  await focus(page, timeline, page.getByText('AI-written CVs all look alike', { exact: false }), 'promise')
  await pause(2500)
  await wide(page, timeline, 'promise-out')

  // 3 — recruiter imports the job post
  await beat(3)
  await tap(page.locator('button.entry-choice').filter({ hasText: 'Choose recruiter' }), 'choose recruiter', btn('Preview email-code sign-in', false))
  await tap(btn('Preview email-code sign-in', false), 'email step', page.getByLabel('Demo verification code'))
  await type(page, timeline, page.getByLabel('Demo verification code'), '123456', 'code')
  await tap(btn('Open recruiter workspace', false), 'open workspace')
  await page.waitForURL('**/recruiter'); await settle(page)
  await tap(page.getByRole('link', { name: 'Define a recruiter need' }).first(), 'define need')
  await page.waitForURL('**/need/new'); await settle(page)
  await type(page, timeline, page.getByLabel('Company name', { exact: true }), 'Kaarna Health', 'company')
  await tap(btn('Continue to the role', false), 'to role')
  await upload('Import a job description', 'job-04-kaarna-web-developer.txt', 'import job')
  await type(page, timeline, page.getByLabel('Job title', { exact: true }), 'Junior web developer', 'title')
  await tap(btn('Continue to working context', false), 'to context')
  await choose(page.getByRole('combobox', { name: 'Working arrangement' }), 'Hybrid', 'hybrid')
  await tap(page.getByRole('checkbox', { name: 'I have reviewed the job and company context.', exact: false }), 'reviewed')
  await tap(btn('Explore the 12 components', false), 'explore components')

  // 4 — Claude proposes, with sources
  await beat(4)
  await tap(page.getByText('Suggest requirements with Claude', { exact: true }), 'open claude panel')
  loadingStart(timeline, 'claude-requirements')
  await tap(btn('Suggest components for this role'), 'ask claude')
  await appear(page, timeline, 'claude-requirements', await btn('Suggest components for this role').boundingBox())
  const proposal = page.locator('details:has-text("Proposal · not applied")').first()
  await page.getByText('Proposal · not applied', { exact: true }).waitFor({ timeout: 90000 })
  await done(page, timeline, 'claude-requirements', await page.getByText('Proposal · not applied', { exact: true }).boundingBox())
  loadingEnd(timeline, 'claude-requirements')
  const firstReq = proposal.locator('li').first()
  await focus(page, timeline, (await firstReq.count()) ? firstReq : page.getByText('Proposal · not applied', { exact: true }), 'proposal')
  await pause(3500)
  await wide(page, timeline, 'proposal-out')
  await tap(btn('Use these requirements'), 'use requirements')
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))

  // 5 — the shared framework, majors in gold
  await beat(5)
  await wide(page, timeline, 'rosace')

  // 6 — the recruiter decides: swap one major
  await beat(6)
  await railTo('See it through', 'see it through')
  await tap(btn('Minor · red'), 'make minor')
  await tap(page.getByRole('radio', { name: 'Foundation', exact: true }), 'foundation')
  await railTo('Keep commitments', 'keep commitments')
  await tap(page.getByRole('radio', { name: 'Intermediate', exact: true }), 'intermediate')
  await tap(btn('Major · gold'), 'make major')

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
  await pause(4000)
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
  await pause(3000)
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
  await beat(10)
  let leftBeat11 = false
  for (let i = 0; i < 20; i++) {
    if (await page.getByLabel('Fictional display name').count()) break
    const title = (await page.locator('.form-panel h1').first().innerText()).trim()
    const autonomy = plan[title]
    if (autonomy) {
      await tap(page.getByLabel('Yes, in a real task', { exact: true }), `${title}: yes`)
      await tap(page.getByLabel(autonomy, { exact: true }), `${title}: autonomy`)
      await tap(page.getByLabel('Simple or well-defined work', { exact: true }), `${title}: situation`)
      if (title === 'Get it right and spot the error') {
        await focus(page, timeline, page.locator('.form-panel'), 'clue and suggested level')
        await pause(3000)
        await wide(page, timeline, 'clue-out')
      }
      await tap(btn('Confirm this level', false), `${title}: confirm`)
    } else {
      if (!leftBeat11 && beatNo === 10 && i > 3) { await beat(11); leftBeat11 = true }
      await tap(btn('Leave unanswered', false), `${title}: leave`)
    }
  }

  // 12 — consent, her own rosace
  await beat(12)
  await retype(page.getByLabel('Fictional display name'), 'Fatima', 'name')
  await tap(page.getByRole('checkbox', { name: 'Keep my confirmed card', exact: false }), 'consent')
  await tap(btn('Save my confirmed card'), 'save card', page.getByText('Card saved in this browser.', { exact: false }))

  // 13 — the organiser: whole event, ties
  await beat(13)
  await switchRole('Organiser', '/event')
  await tap(page.getByRole('link', { name: 'Open the event desk' }).first(), 'event desk')
  await page.waitForURL('**/organiser'); await settle(page)
  await tap(page.getByRole('button', { name: /Vireo Data/ }), 'vireo tie')

  // 14 — Fatima suggested for Kaarna, with reasons
  await beat(14)
  await tap(page.getByRole('button', { name: /Kaarna Health/ }), 'kaarna')
  const card = page.locator('.organiser-grid>section:not([hidden]) .meeting-card').filter({ hasText: 'Fatima' }).first()
  await tap(card.locator('summary').first(), 'open fatima', card.getByText('Declared alignment', { exact: false }))
  await focus(page, timeline, card, 'fatima suggested')
  await pause(3500)
  await wide(page, timeline, 'fatima-out')

  // 15 — a human click with a reason
  await beat(15)
  await type(page, timeline, card.getByRole('textbox'), 'Booking app with tests in her bootcamp team; check how she tested the payment flow.', 'reason', { delay: 18 })
  await tap(card.getByRole('button', { name: 'Approve / add', exact: true }), 'approve', card.getByText('Approved', { exact: false }).first())

  // 16 — the brief: questions, not a ranking
  await beat(16)
  await tap(card.getByRole('link', { name: 'Prepare conversation' }), 'prepare conversation', page.getByRole('heading', { name: 'Fatima × Kaarna Health' }))
  await settle(page)
  const question = page.getByText('Tell me about a time when you delivered work that had to pass a review', { exact: false }).first()
  await focus(page, timeline, question, 'question')
  await pause(3500)
  await wide(page, timeline, 'question-out')

  // 17 — observed stays separate from declared
  await beat(17)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  await tap(btn('Record observations', false), 'record observations')
  const rows = page.locator('.observation-row')
  await choose(rows.filter({ hasText: 'Get it right' }).locator('select'), 'A', 'seen clearly')
  await choose(rows.filter({ hasText: 'Know the rules' }).locator('select'), 'C', 'seen in part')
  await focus(page, timeline, page.locator('figure, aside').filter({ hasText: 'Observed separately' }).first(), 'observed rosace')
  await pause(3000)
  await wide(page, timeline, 'observed-out')
  await tap(page.getByText('Compare with the original declaration', { exact: true }), 'compare')

  // 18 — responsible by design
  await beat(18)
  await tap(page.getByRole('link', { name: 'My workspace' }), 'my workspace')
  await settle(page)
  await tap(page.getByRole('link', { name: 'How Rosace works' }), 'how rosace works')
  await page.waitForURL('**/overview'); await settle(page)
  const panel = page.getByRole('heading', { name: 'Responsible by design' })
  await panel.scrollIntoViewIfNeeded()
  await focus(page, timeline, page.locator('.responsible-panel'), 'responsible')
  await pause(4000)

  // 19 — payoff, wide, stop
  await beat(19)
  await wide(page, timeline, 'final-wide')
  await endBeat()
  await pause(2500)

  timeline.dump(join(renderDir, 'timeline.json'))
  const rec = await finishFilmRecording(context, page, renderDir, recorder)
  await browser.close()
  if (!rec.ok) {
    console.error('raw.mp4 not produced')
    process.exit(1)
  }
  console.log(`Recorded ${renderDir} (${rec.capturedFps} fps)`)
  console.log(`Compose: node demos/_engine/compose.mjs ${renderDir.replace(/\\/g, '/')} --preset ${config.frame?.preset ?? 'macos-light'}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
