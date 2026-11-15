"""Sentence-level captions from the ElevenLabs character timings -> clipN.ass
Cues split at . : ; or , when a line passes ~46 chars; no flicker between cues of one line."""
import json, sys
c = sys.argv[1]; T = json.load(open(f"clip{c}.timing.json"))
MAX = 46
def ts(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"
def balanced(ws):
    """Split a phrase longer than MAX into the most even halves."""
    if len(" ".join(x["w"] for x in ws)) <= MAX or len(ws) < 4: return [ws]
    best = min(range(2, len(ws) - 1), key=lambda k: abs(len(" ".join(x["w"] for x in ws[:k])) - len(" ".join(x["w"] for x in ws[k:]))))
    return balanced(ws[:best]) + balanced(ws[best:])
cues = []
for l in T["lines"]:
    phrases, cur = [], []
    for w in l["words"]:
        cur.append(w)
        if w["w"][-1] in ".:;?!" or (w["w"][-1] == "," and len(" ".join(x["w"] for x in cur)) > 18):
            phrases.append(cur); cur = []
    if cur: phrases.append(cur)
    # merge tiny neighbours (e.g. "Espoo." + "A recruitment evening.")
    merged = []
    for ph in phrases:
        if merged and len(" ".join(x["w"] for x in merged[-1] + ph)) <= 34: merged[-1] = merged[-1] + ph
        else: merged.append(ph)
    line_cues = [c2 for ph in merged for c2 in balanced(ph)]
    line_cues[-1] = line_cues[-1] + [{"end_of_line": True}]
    cues += line_cues
out = []
for i, cu in enumerate(cues):
    eol = cu[-1].get("end_of_line"); words = [w for w in cu if "w" in w]
    start = words[0]["start"] - 0.08
    end = words[-1]["end"] + 0.25
    if not eol and i + 1 < len(cues):  # same line: hold until the next cue starts
        end = [w for w in cues[i + 1] if "w" in w][0]["start"] - 0.08
    out.append((start, end, " ".join(w["w"] for w in words)))
out = [(s, min(e, out[i + 1][0] - 0.02) if i + 1 < len(out) else e, t) for i, (s, e, t) in enumerate(out)]  # never two cues at once
head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Inter,40,&H00FFFFFF,&H00FFFFFF,&H00161616,&H00000000,-1,0,0,0,100,100,0,0,3,16,0,2,80,80,44,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
body = "".join(f"Dialogue: 0,{ts(s)},{ts(e)},Cap,,0,0,0,,{t}\n" for s, e, t in out)
open(f"out/clip{c}.ass", "w").write(head + body)
for s, e, t in out: print(f"{s:6.2f}-{e:6.2f} {t}")
