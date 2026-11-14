"""Mix the clip's voice lines at their start times -> clipN.wav"""
import json, sys, subprocess
c = sys.argv[1]; T = json.load(open(f"clip{c}.timing.json"))
args = ["ffmpeg", "-v", "error", "-y"]; f = []
for i, l in enumerate(T["lines"]):
    args += ["-i", f"voice/{l['id']}.mp3"]
    ms = int(l["start"] * 1000); f.append(f"[{i}:a]aresample=48000,adelay={ms}|{ms}[a{i}]")
n = len(T["lines"])
f.append("".join(f"[a{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0,apad,atrim=0:{T['total']}[out]")
args += ["-filter_complex", ";".join(f), "-map", "[out]", "-ac", "2", f"out/clip{c}.wav"]
subprocess.run(args, check=True); print(f"out/clip{c}.wav")
