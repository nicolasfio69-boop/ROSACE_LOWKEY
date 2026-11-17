"""Full v2 video: context (clip1) -> Nicolas -> arrival (clip2) -> live tool
segments cut from the v1 silent master, with the skills freeze (clip3) at the
moment Kaarna's rosace appears -> end card.  Output: out/rosace-v2-full.mp4
Usage: python3 assemble.py  (after audio.py/captions.py for clips 11-18)"""
import json, subprocess
SRC = "../rosace-3min/no-sound.mp4"   # v1 silent master (render 003)
ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30",
       "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2"]
SUBS = "subtitles=out/clip{c}.ass:fontsdir=/usr/share/fonts/opentype/inter"

def total(c): return json.load(open(f"clip{c}.timing.json"))["total"]
def run(a): subprocess.run(["ffmpeg", "-v", "error", "-y"] + a, check=True)

# Tool segments: clip -> list of source ranges (v1 time) and the on-screen length.
# Footage is sped up to fit; when `hold` is set, the last frame zooms slowly
# toward (x, y) for the remaining time.
CHK = "renders/004/final.mp4"        # built-in tests on /checks (rec-checks.mjs)
SEGS = {
    11: dict(ranges=[(28.1, 39.6)], extra=0.8),                 # Claude proposal -> rosace (freeze frame at 39.6)
    12: dict(ranges=[(48.6, 57.6)], extra=0.8),                 # swap: Keep commitments becomes a major
    14: dict(ranges=[(86.7, 91.0), (99.3, 105.0)], extra=0.6),  # Fatima: CV import, privacy, clue + level
    20: dict(ranges=[(2.8, 7.0), (7.4, 10.6), (15.0, 24.6)], extra=1.0, src=CHK),  # tests built in: plan, answer, Claude grade, recruiter validates
    15: dict(ranges=[(128.4, 145.5)], extra=1.0),               # organiser: no ranking, Fatima suggested, approve
    16: dict(ranges=[(146.0, 151.5)], extra=0.6),               # brief question
    17: dict(ranges=[(153.4, 163.5)], extra=0.8),               # observations A/C, observed vs declared
}

def tool(c):
    s = SEGS[c]; L = total(c) + s["extra"]; src = s.get("src", SRC)
    raw = sum(b - a for a, b in s["ranges"])
    parts = []
    for i, (a, b) in enumerate(s["ranges"]):
        parts.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[r{i}]")
    n = len(s["ranges"])
    chain = ";".join(parts) + ";" + "".join(f"[r{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[cat]"
    if "hold" in s:
        hx, hy = s["hold"]; still = f"out/hold{c}.png"
        run(["-ss", str(s["ranges"][-1][1] - 0.04), "-i", SRC, "-frames:v", "1", still])
        hold_len = max(1.0, L - raw)
        frames = int(hold_len * 30)
        z = f"1+0.30*on/{frames}"
        run(["-loop", "1", "-i", still, "-vf",
             f"scale=3840:2160,zoompan=z='{z}':x='{hx * 2}-({hx * 2})/zoom':y='{hy * 2}-({hy * 2})/zoom':d={frames}:s=1920x1080:fps=30",
             "-frames:v", str(frames), "-c:v", "libx264", "-pix_fmt", "yuv420p", f"out/hold{c}.mp4"])
        vf = f"[cat]fps=30[a1];[2:v]fps=30[a2];[a1][a2]concat=n=2:v=1:a=0,{SUBS.format(c=c)}[v]"
        run(["-i", SRC, "-i", f"out/clip{c}.wav", "-i", f"out/hold{c}.mp4", "-filter_complex", chain + ";" + vf,
             "-map", "[v]", "-map", "1:a", "-t", f"{L:.3f}", "-af", f"apad", *ENC, f"out/seg{c}.mp4"])
        return
    speed = raw / L
    vf = f"[cat]setpts=PTS/{speed:.4f},fps=30,tpad=stop_mode=clone:stop_duration=2,{SUBS.format(c=c)}[v]"
    run(["-i", src, "-i", f"out/clip{c}.wav", "-filter_complex", chain + ";" + vf,
         "-map", "[v]", "-map", "1:a", "-af", "apad", "-t", f"{L:.3f}", *ENC, f"out/seg{c}.mp4"])
    print(c, f"len {L:.2f}s speed x{speed:.2f}")

def norm(src, dst):  # re-encode HTML/other clips to the same format
    run(["-i", src, "-vf", "fps=30,scale=1920:1080,setsar=1", *ENC, dst])

for c in SEGS: tool(c)
norm("out/clip1.mp4", "out/seg1.mp4")
norm("out/seg_nico.mp4", "out/seg10.mp4")
norm("out/clip2.mp4", "out/seg2.mp4")
norm("out/clip3.mp4", "out/seg3.mp4")
# end card with the closing line (clip 18), fade in
L18 = total(18) + 0.8
run(["-loop", "1", "-t", f"{L18:.3f}", "-i", "scenes/endcard.png", "-i", "out/clip18.wav",
     "-vf", f"fps=30,fade=t=in:d=0.5,fade=t=out:st={L18 - 0.6:.3f}:d=0.6,{SUBS.format(c=18)}", "-af", "apad", "-t", f"{L18:.3f}", *ENC, "out/seg99.mp4"])
order = [1, 10, 2, 11, 3, 12, 14, 20, 15, 16, 17, 99]
open("out/concat.txt", "w").write("".join(f"file 'seg{c}.mp4'\n" for c in order))
run(["-f", "concat", "-safe", "0", "-i", "out/concat.txt", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
     "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "out/rosace-v2-full.mp4"])
d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", "out/rosace-v2-full.mp4"]))
print("final", round(d, 2), "s")
