/**
 * Frame-exact render of an HTML scene: the page exposes window.setT(t) and
 * we screenshot every 1/30 s, then mux the voice and burn the captions.
 * Usage: node rosace-v2/render.mjs <clip> <scene.html> [--from s --to s] [--frames-only]
 */
import { chromium } from 'playwright'
import { mkdirSync, readFileSync, rmSync, existsSync } from 'fs'
import { spawnSync } from 'child_process'
import { join, dirname, resolve } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const here = dirname(fileURLToPath(import.meta.url))
const [clip, scene] = process.argv.slice(2)
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d }
const FPS = 30
const T = JSON.parse(readFileSync(join(here, `clip${clip}.timing.json`), 'utf8'))
const from = arg('--from', 0), to = arg('--to', T.total)
const frames = join(here, 'out', `frames${clip}`)
rmSync(frames, { recursive: true, force: true }); mkdirSync(frames, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
await page.addInitScript((t) => { window.TIMING = t }, T)
await page.goto(pathToFileURL(resolve(here, scene)).href)
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)
let n = 0
for (let f = Math.round(from * FPS); f < Math.round(to * FPS); f++) {
  await page.evaluate((t) => window.setT(t), f / FPS)
  await page.screenshot({ path: join(frames, `${String(n++).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 })
}
await browser.close()
console.log(`${n} frames`)
if (process.argv.includes('--frames-only')) process.exit(0)
const out = join(here, 'out', `clip${clip}.mp4`)
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', join(frames, '%05d.jpg'),
  '-ss', String(from), '-i', join(here, 'out', `clip${clip}.wav`),
  '-vf', `subtitles=${join(here, 'out', `clip${clip}.ass`)}:fontsdir=/usr/share/fonts/opentype/inter`,
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', out], { encoding: 'utf8' })
if (r.status) { console.error(r.stderr); process.exit(1) }
console.log(out)
