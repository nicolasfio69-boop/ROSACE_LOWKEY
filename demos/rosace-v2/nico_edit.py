"""Nicolas's face-camera take -> out/nico.mp4 (no captions yet).
Shortens pauses longer than 0.5 s, alternates a gentle punch-in at each cut
(hides jump cuts), speeds up slightly and normalises loudness.
Usage: python3 nico_edit.py <source.mp4> [speed]"""
import re, subprocess, sys
src = sys.argv[1]; speed = float(sys.argv[2]) if len(sys.argv) > 2 else 1.07
KEEP_PAUSE = 0.30   # what remains of a long pause
LONG = 0.75
# sentence ends in this take (from a Whisper pass); the punch-in only changes there
SENT_END = [4.50, 12.18, 15.44, 24.92, 32.40, 36.14]
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]))
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "silencedetect=n=-35dB:d=0.35", "-f", "null", "-"], capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
sil = [(s, e) for s, e in zip(starts, ends) if e - s >= LONG]
# speech pieces between long silences, each keeping half of KEEP_PAUSE on both sides
pieces, cur = [], 0.0
for s, e in sil:
    if s <= 0.3: cur = e - KEEP_PAUSE / 2; continue
    pieces.append((cur, s + KEEP_PAUSE / 2)); cur = e - KEEP_PAUSE / 2
if cur < dur - 0.3: pieces.append((cur, min(dur, cur + 99)))
# drop trailing silence of the last piece
last_s = [s for s, e in sil if s > pieces[-1][0]]
if last_s: pieces[-1] = (pieces[-1][0], last_s[0] + 0.35)
zooms = [1.05, 1.14]
f = []; k = 0
for i, (a, b) in enumerate(pieces):
    if i and any(abs(pieces[i - 1][1] - KEEP_PAUSE / 2 - t) < 0.4 for t in SENT_END): k += 1
    z = zooms[k % 2]
    w, h = int(1920 / z) // 2 * 2, int(1080 / z) // 2 * 2
    f.append(f"[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS,fps=30,crop={w}:{h}:(iw-{w})/2:(ih-{h})*0.08,scale=1920:1080:flags=lanczos,setsar=1[v{i}]")
    f.append(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={b - a - 0.03:.3f}:d=0.03[a{i}]")
n = len(pieces)
f.append("".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[vc][ac]")
f.append(f"[vc]setpts=PTS/{speed},eq=brightness=0.02:contrast=1.04:saturation=1.05[vo]")
f.append(f"[ac]atempo={speed},highpass=f=80,loudnorm=I=-16:TP=-1.5:LRA=9,aresample=48000[ao]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex", ";".join(f), "-map", "[vo]", "-map", "[ao]",
                "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-ac", "2", "out/nico.mp4"], check=True)
print("pieces", [(round(a, 2), round(b, 2)) for a, b in pieces])
print("duration", subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", "out/nico.mp4"]).decode().strip())
