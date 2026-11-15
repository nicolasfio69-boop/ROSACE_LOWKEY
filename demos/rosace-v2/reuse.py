"""Lines with "from": reuse an existing voice take, cut after the kept text (no new TTS credits)."""
import json, subprocess
SAY = {"Rosace": "Rozass", "rosace": "Rozass"}
for l in json.load(open("lines.json")):
    if "from" not in l: continue
    src = json.load(open(f"voice/{l['from']}.json")); al = src["alignment"]
    spoken = l["text"]
    for a, b in SAY.items(): spoken = spoken.replace(a, b)
    k = "".join(al["characters"]).find(src["spoken"]); assert k >= 0
    off = src["spoken"].find(spoken); assert off >= 0, l["id"]   # any part of the source take
    a, n = k + off, k + off + len(spoken)
    st, en = al["character_start_times_seconds"], al["character_end_times_seconds"]
    full = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"voice/{l['from']}.mp3"]))
    t0 = 0.0 if off == 0 else max(en[a - 1] + 0.02, st[a] - 0.08)
    nxt = next((i for i in range(n, len(st)) if al["characters"][i].strip()), None)   # next spoken character
    t1 = full if off + len(spoken) == len(src["spoken"]) else min(en[n - 1] + 0.15, st[nxt] - 0.03 if nxt is not None else full)
    fade = f"afade=t=in:d=0.03," if t0 else ""
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t0:.3f}", "-i", f"voice/{l['from']}.mp3", "-t", f"{t1 - t0:.3f}",
                    "-af", f"{fade}afade=t=out:st={max(0, t1 - t0 - 0.06):.3f}:d=0.06", f"voice/{l['id']}.mp3"], check=True)
    sub = {key: v[a:n] for key, v in al.items()}
    for key in ("character_start_times_seconds", "character_end_times_seconds"): sub[key] = [round(x - t0, 3) for x in sub[key]]
    json.dump({"spoken": spoken, "alignment": sub}, open(f"voice/{l['id']}.json", "w"))
    print(l["id"], "from", l["from"], f"{t0:.2f}-{t1:.2f}s")
