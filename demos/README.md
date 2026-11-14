# Vidéo de démo Rosace (demo-studio)

Les skills [demo-studio](https://github.com/AlexAnsart/demo-studio) sont installés dans `.claude/skills/` (Claude Code) et `.agents/skills/` (Codex). La configuration est dans `demo.config.json` à la racine : site en ligne Aiven, cadre `macos-light`, voix ElevenLabs, sous-titres incrustés.

La démo prête à tourner est `demos/rosace-3min/` :

- `script.md` : les 19 phrases de voix off (Say) et les 19 plans (Show), dans le même ordre ;
- `run.mjs` : le parcours complet, clic par clic, sur le site en ligne (vérifié de bout en bout le 14 novembre 2026) ;
- `assets/` : l'offre Kaarna Health et le CV de Fatima importés à l'écran.

## Installation, une fois par machine

1. Node.js 18 ou plus, et Python 3.9 ou plus.
2. ffmpeg et ffprobe dans le PATH. Sous Windows : `winget install Gyan.FFmpeg`, puis rouvrir le terminal.
3. Dans le dossier `demos/` : `npm install` puis `npx playwright install chromium`.
4. Voix et sous-titres : `pip install -r .claude/skills/narrate/scripts/requirements.txt -r .claude/skills/sync-narration/scripts/requirements.txt`.
5. Copier la clé ElevenLabs dans un fichier `.env` à la racine du dépôt : `ELEVENLABS_API_KEY=...` (le fichier n'est jamais commité). Sans clé, mettre `"provider": "none"` dans `demo.config.json` : la vidéo sera muette, à doubler soi-même.

Vérification : `node .claude/skills/demo-setup/scripts/check-setup.mjs` puis `node demos/_engine/test-engine.mjs`. Sous Linux, check-setup peut afficher un faux FAIL sur ffmpeg (il appelle `ffmpeg --version`) : `ffmpeg -version` qui marche suffit.

## Lancer la production

Dans Claude Code, à la racine du dépôt :

```
/produce-video Produis la vidéo narrée à partir de demos/rosace-3min/script.md et demos/rosace-3min/run.mjs. Durée visée : environ 3 minutes, c'est voulu. Garde le Say tel quel. Enregistre le résultat dans demos/rosace-3min/final.mp4.
```

## À savoir

- Chaque prise repart d'un navigateur neuf : le site garde ses données dans le navigateur, une seule carte talent par navigateur.
- Claude met environ 15 secondes pour proposer les exigences et 4 secondes pour les exemples. La limite est de 6 appels Claude par minute et par visiteur : attendre une minute entre deux prises.
- L'enregistrement doit tenir 25 images par seconde. Si la machine est trop lente, lancer avec `REDUCED_MOTION=1` (fond animé figé).
- `demos/_engine/actions.mjs` contient une petite correction : la composante "Get it right and spot the error" déclenchait la détection d'erreur à l'écran.
