"""Lines with "from": reuse an existing voice take, cut after the kept text (no new TTS credits)."""
import json, subprocess
SAY = {"Rosace": "Rozass", "rosace": "Rozass"}
for l in json.load(open("lines.json")):
    if "from" not in l: continue
    src = json.load(open(f"voice/{l['from']}.json")); al = src["alignment"]
    spoken = l["text"]
    for a, b in SAY.items(): spoken = spoken.replace(a, b)
    k = "".join(al["characters"]).find(src["spoken"]); assert k >= 0
    assert src["spoken"].startswith(spoken), l["id"]
    n = k + len(spoken)
    cut = al["character_end_times_seconds"][n - 1] + 0.15
    full = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"voice/{l['from']}.mp3"]))
    if len(spoken) == len(src["spoken"]): cut = full
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"voice/{l['from']}.mp3", "-t", f"{cut:.3f}", "-af", f"afade=t=out:st={max(0, cut - 0.08):.3f}:d=0.08", f"voice/{l['id']}.mp3"], check=True)
    json.dump({"spoken": spoken, "alignment": {key: v[:n] for key, v in al.items()}}, open(f"voice/{l['id']}.json", "w"))
    print(l["id"], "from", l["from"], f"{cut:.2f}s")
