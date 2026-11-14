# One ElevenLabs call per line, with character timestamps (exact captions).
import json, os, sys, base64, urllib.request
VOICE = os.environ.get("VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")  # George (premade, free tier)
SAY = {"Rosace": "Rozass", "rosace": "Rozass"}
key = os.environ["ELEVENLABS_API_KEY"]
lines = json.load(open("lines.json"))
only = set(sys.argv[1:])
for l in lines:
    if only and l["id"] not in only: continue
    spoken = l["text"]
    for a, b in SAY.items(): spoken = spoken.replace(a, b)
    body = json.dumps({"text": spoken, "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.55, "similarity_boost": 0.8, "style": 0.15, "use_speaker_boost": True, "speed": 0.93}}).encode()
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128",
        data=body, headers={"xi-api-key": key, "Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(req, timeout=120))
    open(f"voice/{l['id']}.mp3", "wb").write(base64.b64decode(d["audio_base64"]))
    json.dump({"spoken": spoken, "alignment": d.get("normalized_alignment") or d["alignment"]}, open(f"voice/{l['id']}.json", "w"))
    print(l["id"], "ok")
