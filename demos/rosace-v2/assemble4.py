"""v4, 2-minute cut (Codex plan): intro 31, Nicolas 8 s, rosace 33, trimmed lines 41/43.
Based on v3 (after the Codex audit): shorter intro, candidate code exercise, readable
validation, simpler rosace, opaque captions, balanced loudness, URL at the end.
Output: out/rosace-v4-full.mp4.  Run after captions.py/audio.py for the clips used."""
import json, subprocess
V1 = "../rosace-3min/no-sound.mp4"   # v1 live footage (render 003)
CODE = "renders/006/final.mp4"       # rec-code.mjs: candidate exercise + recruiter validation
WIN = (1728, 972, 96, 50)            # app window without the decorative frame
PROMPT = (960, 540, 390, 360)        # exercise prompt + timer
REC = (1180, 664, 370, 300)          # Claude's recommendation and criteria
GRADE = (1440, 810, 380, 150)        # grade buttons + observed rosace
ASIDE = (450, 420, 1335, 180, 960, 540)  # the observed rosace card alone, padded on the app background
ZWIN = (1400, 788, 250, 120)         # main column while the recording is already zoomed in
TYPE = (1400, 788, 250, 190)         # timer, prompt and answer while typing (zoomed)
ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30",
       "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2"]
LOUD = "loudnorm=I=-16:TP=-1.5:LRA=11"
FONT = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
def subs(c): return f"subtitles=out/clip{c}.ass:fontsdir=/usr/share/fonts/opentype/inter"
def total(c): return json.load(open(f"clip{c}.timing.json"))["total"]
def run(a): subprocess.run(["ffmpeg", "-v", "error", "-y"] + a, check=True)

# clip -> (source, [(start, end, crop, on-screen seconds or None = keep speed, label)], extra seconds)
SEGS = {
    41: (V1, [(29.0, 39.6, WIN, None, None)], 0.3),
    12: (V1, [(48.6, 57.6, WIN, None, None)], 0.3),
    14: (V1, [(86.7, 91.0, WIN, None, None), (99.3, 105.0, WIN, None, None)], 0.3),
    21: (CODE, [(3.0, 5.3, ZWIN, 1.3, None), (5.3, 9.9, PROMPT, 3.6, None),
                (11.5, 19.4, TYPE, 4.0, "Demo answer, typed for this video"), (21.0, 22.6, WIN, 0.7, None)], 0),
    22: (CODE, [(33.2, 36.3, ZWIN, 2.3, None), (42.6, 49.4, REC, 5.8, None), (49.4, 50.8, REC, 1.2, None),
                (50.8, 53.4, GRADE, 1.5, None)], 0),
    43: (CODE, [(53.4, 55.9, ASIDE, 2.4, None)], 0),
    15: (V1, [(128.4, 145.5, WIN, None, None)], 0.3),
    16: (V1, [(146.0, 151.5, WIN, None, None)], 0.2),
    17: (V1, [(153.4, 163.5, WIN, None, None)], 0.3),
}

def tool(c):
    src, ranges, extra = SEGS[c]
    narr = total(c) + extra
    fixed = sum(d for a, b, cr, d, l in ranges if d)
    free = sum(b - a for a, b, cr, d, l in ranges if not d)
    k = (free / max(0.1, narr - fixed)) if free else 1.0   # speed for ranges without a fixed length
    parts, n = [], len(ranges)
    for i, (a, b, cr, d, label) in enumerate(ranges):
        sp = (b - a) / d if d else k
        w, h, x, y = cr[:4]
        pad = f",pad={cr[4]}:{cr[5]}:(ow-iw)/2:(oh-ih)/2:color=0xE9E8ED" if len(cr) > 4 else ""
        f = f"[0:v]trim={a}:{b},setpts=(PTS-STARTPTS)/{sp:.4f},crop={w}:{h}:{x}:{y}{pad},scale=1920:1080:flags=lanczos,setsar=1,fps=30"
        if label:
            f += (f",drawtext=fontfile={FONT}:text='{label}':x=w-tw-60:y=60:fontsize=30:fontcolor=white"
                  f":box=1:boxcolor=0x17181C@1:boxborderw=16")
        parts.append(f + f"[r{i}]")
    L = max(narr, sum(d if d else (b - a) / k for a, b, cr, d, l in ranges))
    chain = ";".join(parts) + ";" + "".join(f"[r{i}]" for i in range(n)) + \
        f"concat=n={n}:v=1:a=0,tpad=stop_mode=clone:stop_duration=3,{subs(c)}[v]"
    run(["-i", src, "-i", f"out/clip{c}.wav", "-filter_complex", chain, "-map", "[v]", "-map", "1:a",
         "-af", f"apad,{LOUD}", "-t", f"{L:.3f}", *ENC, f"out/v4seg{c}.mp4"])
    print(c, f"{L:.2f}s (narration {narr:.2f}s, free speed x{k:.2f})")

def norm(src, dst, t=None, af=LOUD):
    run(["-i", src, *(["-t", str(t)] if t else []), "-vf", "fps=30,scale=1920:1080,setsar=1", "-af", af, *ENC, dst])

for c in SEGS: tool(c)
norm("out/clip31.mp4", "out/v4seg31.mp4")
norm("out/clip33.mp4", "out/v4seg33.mp4")
L24 = total(24) + 0.2
run(["-loop", "1", "-t", f"{L24:.3f}", "-i", "scenes/endcard.png", "-i", "out/clip24.wav",
     "-vf", f"fps=30,fade=t=in:d=0.3,fade=t=out:st={L24 - 0.4:.3f}:d=0.4,{subs(24)}", "-af", f"apad,{LOUD}",
     "-t", f"{L24:.3f}", *ENC, "out/v4seg24.mp4"])
REST, SPEED = [41, 33, 12, 14, 21, 22, 43, 15, 16, 17, 24], 1.022  # after Nicolas: voice and picture x1.022 to fit 1:59
order = [31, 50] + REST                                           # 50 = Nicolas, made separately (8 s)
open("out/concat4r.txt", "w").write("".join(f"file 'v4seg{c}.mp4'\n" for c in REST))
run(["-f", "concat", "-safe", "0", "-i", "out/concat4r.txt", "-vf", f"setpts=PTS/{SPEED},fps=30", "-af", f"atempo={SPEED}", *ENC, "out/v4rest.mp4"])
open("out/concat4.txt", "w").write("file 'v4seg31.mp4'\nfile 'v4seg50.mp4'\nfile 'v4rest.mp4'\n")
run(["-f", "concat", "-safe", "0", "-i", "out/concat4.txt", "-c", "copy", "out/rosace-v4-full.mp4"])
d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", "out/rosace-v4-full.mp4"]))
t = 0
for c in [31, 50, "rest"]:
    dd = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"out/v4seg{c}.mp4" if c != "rest" else "out/v4rest.mp4"]))
    print(f"seg{c!s:>4} starts {t:6.2f}s  {dd:5.2f}s"); t += dd
print("final", round(d, 2), "s")
