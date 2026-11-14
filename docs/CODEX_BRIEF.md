# Brief pour Codex : tout ce qui a été décidé, à appliquer sur `feat/coherent-ux`

> Suite demandée après les étapes 0–9 : Anthropic remplace Featherless et le sélecteur en haut sépare les espaces candidat/recruteur/organisateur. Voir les dernières décisions de `CADRAGE.md` et `CLAUDE_SETUP.md`.

Ce brief rassemble toutes les décisions de Nicolas du 14 novembre 2026. La source de vérité reste `docs/CADRAGE.md` : lis-le en entier avant de commencer, puis `AGENTS.md`. Si ce brief et `CADRAGE.md` divergent, `CADRAGE.md` gagne. Si quelque chose n'est pas clair, propose des options au lieu de trancher seul.

Règles de travail :
- Travaille sur la branche `feat/coherent-ux` (PR #11). Ne touche pas à `main` et ne fusionne aucune PR toi-même.
- Fais un commit par étape ci-dessous, avec un message clair.
- Après chaque étape, `npm test`, `npx tsc --noEmit`, `npx eslint src` et `npm run build` doivent passer. À la fin, lance aussi les tests Playwright.
- Aucune clé d'API dans le dépôt. Données fictives uniquement. Le CV n'est jamais stocké. Interface en anglais.

---

## Étape 0. Récupérer le travail des autres branches

```bash
git fetch origin
git switch feat/coherent-ux
git merge origin/framing-doc          # docs/CADRAGE.md, ce brief, AGENTS.md (PR #10)
git merge origin/workspace-concrete-skills   # composantes en verbes, catalogue technique (PR #7)
git merge origin/guided-demo          # parcours guidé /tour (PR #9)
```

Le merge de `workspace-concrete-skills` donne des conflits dans `src/components/Rosace.tsx` et `src/components/TalentForm.tsx`. Pour les résoudre :
- **`Rosace.tsx`** : garde ta prévisualisation de niveau (`preview`, `rosace-figure`) et tes tailles de police. Garde aussi les libellés courts en verbes et le découpage des libellés venus de #7.
- **`TalentForm.tsx`** : garde ta restauration de la carte au retour. Garde aussi, de #7, la navigation des compétences techniques groupées par famille et l'état `pinned`, pour que seules les compétences techniques citées, notées ou épinglées restent dans le parcours.

Ensuite, vérifie que `/tour` suit bien ton thème clair, sans couleurs sombres qui jurent.

## Étape 1. Les composantes sont des verbes d'action (non négociable)

- Les 12 noms et libellés courts doivent être exactement ceux du tableau « 2 bis » de `CADRAGE.md` (Reach out to people / Reach out, Understand and convince / Convince, etc.). Il ne doit plus rester aucun ancien nom en interface : Listen, Present, Rules, Quality, Frame, Initiative, Reflect, Lessons, Team, Scope, Learn, Communicate… Cherche-les dans tout `src/` et `e2e/`.
- Les compétences techniques commencent aussi par un verbe (déjà le cas dans `JOB_SKILLS`).

## Étape 2. Les règles du besoin, partout dans l'interface

- 3 majeures exactement, toujours des composantes Centrale, en or.
- **Mineures sans limite** (poids 1).
- **Jusqu'à 3 compétences techniques**, prises dans le catalogue de 20 compétences en 4 familles (`JOB_FAMILIES`, `JOB_SKILLS`), affichées avec `SkillBars` à côté de la rosace.
- Corrige tous les textes qui disent encore « up to 2 minors », « of 2 minors » ou « 2 job skills ». Exemples : `src/app/page.tsx`, ainsi que le compteur et le résumé de `src/components/NeedForm.tsx`. Pour les mineures, affiche « N minors » sans maximum.
- Mets `AGENTS.md` en cohérence : mineures sans limite, 3 compétences techniques, hébergement sur Aiven et pas Vercel, Featherless pour l'IA.

## Étape 3. La rosace : une longueur = un niveau

- L'échelle est fixe partout (déclaré, attendu, observé). La branche part du petit cercle blanc. Le bord du disque gris vaut Foundation, l'anneau intermédiaire Intermediate et le cercle extérieur Advanced.
- Une observation se place sur la même échelle : niveau de la situation × performance (A = 1, C = 0,6, F = 0, NE = rien).
- Décision de Nicolas du 2026-11-14 : s'il y a plusieurs observations pour une même composante, prends la moyenne des valeurs niveau × performance, hors NE. Garde cette règle dans une seule fonction.
- Pointillé = déclaré, plein = observé, trait noir = attendu. Les majeures sont en or et dessinées en dernier.

## Étape 4. « Attester un niveau » (section 7 bis de `CADRAGE.md`)

Les écrans restent simples, mais chaque composante doit pouvoir être vérifiée, et **c'est toujours une personne qui note**.

1. Crée `src/lib/verification.ts`, qui donne pour chaque composante et compétence technique :
   - le mode : `online`, `onsite` ou `interview` ;
   - une phrase qui décrit la situation (reprends le tableau 7 bis).

   Ajoute des tests unitaires.
2. **Écran du besoin**, à l'étape de relecture : sous chaque exigence, une ligne « How it's checked: online exercise / on-site situation / interview », avec la situation en une phrase.
3. **Le Practice studio devient « Checks »** (route `/checks`, et `/practice` redirige vers `/checks`) :
   - 3 exercices en ligne fictifs pour la démo : C5.1 Break down a problem, C2.2 Get it right and spot the error, et J.EMBEDDED_C ;
   - chaque exercice existe en 3 versions (Foundation, Intermediate, Advanced), et le talent fait celle du niveau qu'il déclare ;
   - le talent répond, puis un recruteur relit avec une grille courte et note A, C, F ou NE ;
   - Featherless peut proposer un premier retour au recruteur, seulement si la clé est configurée et après une action explicite. Jamais une note ;
   - la note devient une observation : la branche de la rosace devient pleine, à la longueur niveau × performance.
4. **Brief de conversation** (`/brief`) :
   - pour les composantes `onsite`, une carte « On-site situation » avec la consigne de 10 minutes, puis la grille A, C, F, NE ;
   - pour C4.3, la mention « Discussed, not observed ».
5. Chaque exigence a un statut simple : To check, Done, Graded.

## Étape 5. Le parcours guidé `/tour`

- Garde les 4 étapes, sur les données NordChip et Amira.
- À l'étape 4, ajoute une ligne qui montre une vérification en ligne déjà notée par le recruteur, en plus des questions d'entretien.
- Le bouton principal de l'accueil reste « Start the 3-minute demo ». Le menu contient « 3-minute demo », les 4 étapes et « Checks ».

## Étape 6. Motion design : qui explique, plus décoratif

Nicolas veut les deux.
- **Ce qui explique :**
  - la rosace se construit branche par branche quand un besoin s'affiche, majeures en or en dernier ;
  - une barre passe du pointillé au plein quand une observation est notée ;
  - les suggestions arrivent une par une ;
  - les transitions entre les étapes d'un parcours sont fluides ;
  - les chiffres comptent jusqu'à leur valeur.
- **Décoratif :** reprends des composants **gratuits** d'Aceternity UI, recolorés en rouge `#C8102E` et or `#F0C300`, par exemple Glowing Effect sur les cartes, Text Generate Effect sur le titre de l'accueil et Background Beams discret dans l'en-tête des parcours. Ajoute chaque composant dans `docs/ACETERNITY_ATTRIBUTION.md`. Aucun bloc payant.
- Tout s'arrête ou devient statique avec `prefers-reduced-motion`. Pas d'animation qui ralentit la saisie.

## Étape 7. Hébergement Aiven (sans base de données pour l'instant)

- `next.config.ts` : `output: "standalone"`.
- Ajoute un `Dockerfile` multi-étapes (Node 22, `npm ci`, `npm run build`, image finale avec `.next/standalone`, `.next/static` et `public`, port 3000) et un `.dockerignore`.
- Ajoute `docs/DEPLOY_AIVEN.md` :
  - comment déployer avec Aiven Runtime depuis le dépôt ;
  - les variables d'environnement à définir dans Aiven (`AI_PROVIDER=featherless`, `FEATHERLESS_API_KEY`, `FEATHERLESS_MODEL`, `CONTEXT_DEV_API_KEY` facultatif), sans aucune valeur ;
  - ce qui reste à vérifier (crédits, région européenne).
- Le stockage reste dans le navigateur. N'ajoute pas PostgreSQL.

## Étape 8. Mettre les docs à jour

- Dans `docs/CADRAGE.md` : ajoute au « Journal des décisions » ce qui a été fait, déplace les points réglés hors de « À trancher » et mets à jour la date.
- Section 6 (direction artistique) : décris ton thème clair perle avec le fond Aurora, en gardant le rouge et l'or comme seules couleurs fortes, Space Grotesk et Inter, et pas de slogans.
- Mets à jour `docs/ROADMAP.md` et `docs/VISUAL_WORKSPACE.md`.

## Étape 9. Vérifier et livrer

- Tests, TypeScript, ESLint, build et Playwright au vert. Ajoute des tests e2e :
  - aucun ancien nom de composante n'apparaît sur les pages principales ;
  - on peut choisir 3 compétences techniques et plus de 2 mineures ;
  - une note A sur `/checks` rend la branche pleine.
- Captures 1440 × 900 et 390 × 844 de `/`, `/tour`, `/need/new`, `/talent/new`, `/organiser`, `/brief?need=nordchip-embedded&talent=amira` et `/checks`, sans débordement horizontal.
- Pousse sur `feat/coherent-ux` et mets à jour la description de la PR #11 avec ce qui a changé et ce qui reste à valider par Nicolas.
