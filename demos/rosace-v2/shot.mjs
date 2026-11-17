import { chromium } from 'playwright'
import { pathToFileURL } from 'url'
const [src, out] = process.argv.slice(2)
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } })
await p.goto(pathToFileURL(src).href); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300)
await p.screenshot({ path: out }); await b.close()
