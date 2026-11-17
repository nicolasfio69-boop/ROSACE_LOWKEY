// Stills of a scene at given times, tiled into one sheet. node rosace-v2/snap.mjs <clip> <scene> t1,t2,...
import { chromium } from 'playwright'
import { readFileSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import sharp from 'sharp'
const here = dirname(fileURLToPath(import.meta.url))
const [clip, scene, times] = process.argv.slice(2)
const T = JSON.parse(readFileSync(join(here, `clip${clip}.timing.json`), 'utf8'))
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } })
const errs = []; p.on('pageerror', (e) => errs.push(e.message))
await p.addInitScript((t) => { window.TIMING = t }, T)
await p.goto(pathToFileURL(resolve(here, scene)).href); await p.evaluate(() => document.fonts.ready)
const shots = []
for (const t of times.split(',').map(Number)) { await p.evaluate((x) => window.setT(x), t); shots.push(await p.screenshot({ type: 'png' })) }
await b.close(); if (errs.length) console.log('ERRORS', errs)
const cols = 2, w = 960, h = 540, rows = Math.ceil(shots.length / cols)
const tiles = await Promise.all(shots.map((s) => sharp(s).resize(w, h).png().toBuffer()))
await sharp({ create: { width: w * cols, height: h * rows, channels: 3, background: '#fff' } })
  .composite(tiles.map((input, i) => ({ input, left: (i % cols) * w, top: Math.floor(i / cols) * h }))).jpeg({ quality: 85 })
  .toFile(process.env.OUT ?? '/tmp/claude-0/-home-user/d52fa2b7-8f61-57ac-991f-2d206b99a8ca/scratchpad/snap.jpg')
console.log('ok')
