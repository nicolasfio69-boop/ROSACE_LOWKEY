# Rebuild aligned.json words from the SCRIPT tokens (Whisper mishears names:
# Espoo→Espos, Rosace→Rosacia, Kaarna→Carna), timed from the matched Whisper words.
import json, re, sys, difflib
aj, sayf = sys.argv[1], sys.argv[2]
d = json.load(open(aj)); ww = d['words']
sents = [l.strip() for l in open(sayf) if l.strip()]
norm = lambda s: re.sub(r"[^a-z0-9]+", "", s.lower())
toks, owner = [], []
for i, s in enumerate(sents):
    for t in s.split():
        if norm(t): toks.append(t); owner.append(i)
sm = difflib.SequenceMatcher(a=[norm(t) for t in toks], b=[norm(w['word']) for w in ww], autojunk=False)
times = [None] * len(toks)
for tag, a0, a1, b0, b1 in sm.get_opcodes():
    if tag == 'equal':
        for k in range(a1 - a0): times[a0 + k] = (ww[b0 + k]['start'], ww[b0 + k]['end'])
    elif tag == 'replace':
        s0, e0 = ww[b0]['start'], ww[b1 - 1]['end']; n = a1 - a0
        for k in range(n): times[a0 + k] = (round(s0 + (e0 - s0) * k / n, 3), round(s0 + (e0 - s0) * (k + 1) / n, 3))
# inserts in script (no whisper word): squeeze at neighbour end
for i, t in enumerate(times):
    if t is None:
        p = times[i - 1][1] if i else 0
        times[i] = (p, p)
words = [{"word": t, "start": s, "end": e} for t, (s, e) in zip(toks, times)]
out = []
for i, s in enumerate(sents):
    ws = [w for w, o in zip(words, owner) if o == i]
    out.append({"text": s, "start": ws[0]['start'], "end": ws[-1]['end'], "words": ws})
d['words'] = words; d['sentences'] = out
json.dump(d, open(aj, 'w'), indent=2, ensure_ascii=False)
for i in range(len(out) - 1): print(i + 1, round(out[i]['end'], 2), '→', round(out[i + 1]['start'], 2), 'gap', round(out[i + 1]['start'] - out[i]['end'], 2))
