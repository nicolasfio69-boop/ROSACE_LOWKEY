// Clip 2: the welcome page, the cursor points at each space as the voice names it.
// FILM_VIEWPORT=1600x900 node rosace-v2/rec2.mjs
import { chromium } from 'playwright'
import { readFileSync, mkdirSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createTimeline } from '../_engine/timeline.mjs'
import { createFilmContext, prepareFilmPage, startFilmRecording, finishFilmRecording } from '../_engine/record.mjs'
import { wide, settle, filmMove } from '../_engine/actions.mjs'
import { pause } from '../_engine/motion.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const T = JSON.parse(readFileSync(join(here, 'clip2.timing.json'), 'utf8'))
const word = (p) => T.lines[0].words.find((w) => w.w.toLowerCase().startsWith(p)).start
const dir = join(here, 'out', 'rec2'); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true })
const browser = await chromium.launch()
const context = await createFilmContext(browser, dir)
const page = await context.newPage()
await page.emulateMedia({ reducedMotion: 'reduce' })
// capture heartbeat (see rosace-3min/run.mjs): keeps the screencast sending frames on still pages
await page.addInitScript(() => {
  const go = () => { const el = document.createElement('div'); el.style.cssText = 'position:fixed;left:0;bottom:0;width:1px;height:1px;pointer-events:none;z-index:2147483647;opacity:0.01'; document.documentElement.appendChild(el); let on = false; const tick = () => { on = !on; el.style.background = on ? '#000' : '#fff'; requestAnimationFrame(tick) }; requestAnimationFrame(tick) }
  if (document.documentElement) go(); else document.addEventListener('DOMContentLoaded', go)
})
await prepareFilmPage(page, { scale: 1.6, color: '#0A0A0A' })
await page.goto('https://holy-nice-impala.eur-1.aiven.app/?choose=1')
await page.getByText('AI-written CVs all look alike', { exact: false }).waitFor()
await settle(page)
const center = async (loc) => { const b = await loc.boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2] }
const recruiter = await center(page.locator('button.entry-choice').filter({ hasText: 'Choose recruiter' }))
const candidate = await center(page.locator('button.entry-choice').filter({ hasText: 'Choose candidate' }))
const organiser = await center(page.getByText('Organiser access', { exact: false }).first())
const timeline = createTimeline()
const rec = await startFilmRecording(page, dir, timeline)
const t0 = Date.now() + 300 // final video t=0 (compose keeps 0.3 s before the first event)
await pause(300)
await wide(page, timeline, 'welcome')
const at = async (t) => { const left = t0 + t * 1000 - Date.now(); if (left > 0) await pause(left) }
// arrive on each target just as its word is spoken (moves take ~0.6 s)
await at(word('company') - 0.75); await filmMove(page, timeline, recruiter[0], recruiter[1] - 30)
await at(word('talent') - 0.75); await filmMove(page, timeline, candidate[0], candidate[1] - 30)
await at(word('organiser') - 0.75); await filmMove(page, timeline, organiser[0], organiser[1])
await at(T.total + 0.5)
timeline.dump(join(dir, 'timeline.json'))
const r = await finishFilmRecording(context, page, dir, rec)
await browser.close()
console.log('fps', r.capturedFps)
