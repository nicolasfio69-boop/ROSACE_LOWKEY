// Shared helpers for frame-exact scenes. window.TIMING comes from clipN.timing.json.
const line = (id) => TIMING.lines.find((l) => l.id === id)
const L = (id) => line(id).start
const LE = (id) => line(id).start + line(id).dur
/** Start time of the nth word of a line that starts with `prefix` (case-insensitive). */
const W = (id, prefix, nth = 0) => {
  const ws = line(id).words.filter((w) => w.w.toLowerCase().startsWith(prefix.toLowerCase()))
  if (!ws[nth]) throw new Error(`word ${prefix} not in ${id}`)
  return ws[nth].start
}
const clamp = (x) => Math.max(0, Math.min(1, x))
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3)
const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2 }
/** 0 → 1 between a and a+d, eased. */
const ramp = (t, a, d = 0.5) => easeOut((t - a) / d)
/** Visible window: fades in at a, out at b. */
const win = (t, a, b, d = 0.45) => Math.min(ramp(t, a, d), 1 - ramp(t, b, d))
const $ = (sel) => document.querySelector(sel)
const $$ = (sel) => [...document.querySelectorAll(sel)]
function put(el, { o = 1, x = 0, y = 0, s = 1, r = 0 } = {}) {
  if (typeof el === 'string') el = $(el)
  el.style.opacity = o
  el.style.transform = `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`
}
/** Enter from below with a fade. */
const rise = (el, p, dy = 28) => put(el, { o: p, y: (1 - p) * dy })
