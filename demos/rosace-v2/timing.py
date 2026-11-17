"""Clip timing from the per-line voice files: start of each line, total length.
Usage: python timing.py <clip> [lead] [gap] [tail] -> writes clipN.timing.json"""
import json, sys, subprocess
clip = int(sys.argv[1]); lead = float(sys.argv[2]) if len(sys.argv) > 2 else 0.6
gap = float(sys.argv[3]) if len(sys.argv) > 3 else 0.9; tail = float(sys.argv[4]) if len(sys.argv) > 4 else 1.5
lines = [l for l in json.load(open("lines.json")) if l["clip"] == clip]
t = lead; out = []
for l in lines:
    if out: t += l.get("pause", gap) - gap   # per-line pause before, when set
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"voice/{l['id']}.mp3"]).decode())
    vj = json.load(open(f"voice/{l['id']}.json")); al = vj["alignment"]
    k = "".join(al["characters"]).find(vj["spoken"]); assert k >= 0, l["id"]
    al = {key: al[key][k:k + len(vj["spoken"])] for key in al}
    assert len(vj["spoken"]) == len(l["text"]), l["id"]
    # word times (display text has the same length as the spoken text)
    words, cur, ws = [], "", None
    for ch, s, e in zip(l["text"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if ch == " ":
            if cur: words.append({"w": cur, "start": round(t + ws, 3), "end": round(t + pe, 3)}); cur = ""
            continue
        if not cur: ws = s
        cur += ch; pe = e
    if cur: words.append({"w": cur, "start": round(t + ws, 3), "end": round(t + pe, 3)})
    out.append({**l, "start": round(t, 3), "dur": round(dur, 3), "words": words})
    t += dur + gap
total = round(t - gap + tail, 3)
json.dump({"clip": clip, "total": total, "lines": out}, open(f"clip{clip}.timing.json", "w"), indent=1)
print(f"clip {clip}: {total}s", [(l["id"], l["start"], l["dur"]) for l in out])
