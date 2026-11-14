# Audit stratégique — Junction 2026 · Rethinking Recruitment

**Date :** 14 novembre 2026 (Europe/Paris)  
**Rôle :** auditeur produit / stratégie hackathon  
**Sources :** brief City of Espoo, Signal V3, Version simple, AGENTS.md, état du dépôt  
**Destinataire :** Codex (et l’équipe) — document d’avis et de pistes, pas une spec de features nouvelles

Quand ce document contredit Signal V3, **suivre Version simple + AGENTS.md**.  
Quand Version simple contredit le code sur l’exemple chiffré (11/15), **suivre le code** (job skills hors majeures).

---

## 1. Avis global

### Verdict

La thèse produit est **forte et alignée** sur le challenge Espoo. Le passage V3 → Version simple (abandonner la répartition des places) est **correct**. Le risque n’est plus conceptuel : c’est d’arriver au jury avec un bel écran « besoin » sans le **brief** ni le **geste organisateur**, qui portent la promesse.

### Promesse à défendre (inchangée)

> We turn claims into questions you can check during the conversation.

À dire. À montrer. À ne jamais trahir par un wording du type « compétence prouvée », « talent vérifié », « l’IA choisit ».

### Critères jury — lecture d’auditeur

| Critère | Poids | Position actuelle | Risque |
|---|---|---|---|
| Impact & Relevance | 45 % | Bon angle (signal / bruit, brief) | Faible si brief + organisateur absents de la démo |
| Innovation & UX | 35 % | Rosace + niveaux factuels = différenciant | Écran besoin seul = questionnaire, pas innovation perçue |
| Responsible & Feasible | 20 % | Solide sur le papier (humain, synthétique, pas de biais) | Invisible sans journal + talents exclus visibles |

### État du dépôt (constat factuel)

**Présent :** `framework`, scoring, suggestions, données démo, rosace, `/need/new`.  
**Absent pour la démo gagnante :** `/talent/new`, `/organiser`, `/brief/[need]/[talent]`, Gemini, déploiement, soumission Junction remplie.

---

## 2. Ce qu’il ne faut pas toucher

Avis : **geler** ces choix. Codex ne doit pas les « améliorer » spontanément.

1. Système Centrale : 5 compétences, 12 composantes, 3 niveaux + Not yet, rosace.
2. Exactement 3 majeures (poids 2), jusqu’à 2 mineures (poids 1), jusqu’à 2 job skills (poids 2) **à côté** de la rosace, jamais en majeures.
3. Points = poids × min(déclaré, attendu) ; affichage en **fractions** ; jamais de % ni de rang côté talent.
4. Couverture complète à 70 % (seuil Centrale).
5. Égalité à la coupe : **jamais** départagée par le code → organisateur.
6. Pas d’algo d’allocation / waitlist / remplacement automatique (abandonné volontairement).
7. Données synthétiques uniquement ; jamais chercher un talent sur le web.
8. Pas de nationalité, langue, âge, genre, nom de diplôme dans un calcul.
9. CV jamais stocké (y compris hors logs IA).
10. Recruteur = héros de la démo ; humain décide toujours.

---

## 3. Avis détaillés (ce que je pense vraiment)

### 3.1 Signal V3 — trop large

**Avis :** excellent document de décisions, mauvais plan d’exécution hackathon.  
Il dilue l’impact derrière : flot de coût minimal, equity lab 5×6, ESCO vectoriel, Context/Nemotron/Gemma/Oxylabs, etc.

**Piste :** traiter V3 comme **archives**. Une seule référence pour coder : Version simple + AGENTS.md.

### 3.2 Version simple — bonne coupe, à respecter

**Avis :** la bonne stratégie. Trois écrans + un geste. Le brief est le produit.

**Piste pour Codex :** construire **strictement** dans l’ordre AGENTS.md next steps 2 → 3 → 4, puis seulement Gemini / storage.

### 3.3 Écran 1 déjà fait — ne pas le sur-ingénierer

**Avis :** `/need/new` avec cartes de niveaux et rosace live est suffisant pour la démo. Gemini sur cet écran est un **plus**, pas le chemin critique.

**Piste :** ne pas refactorer NeedForm tant que brief + organisateur ne tournent pas. Exemples handwritten OK.

### 3.4 Le brief est le différenciateur

**Avis :** c’est la réponse à « un questionnaire peut mentir comme un CV ». Sans brief, le produit est un score déguisé.

**Piste (priorité P0) :** écran `/brief/[need]/[talent]` avec :
- pourquoi se parler ;
- 3 à 5 questions à vérifier (majeures / job skills d’abord) ;
- ce qu’une bonne réponse contient (descripteur + exemple poste) ;
- rosace talent superposée au besoin (ticks des niveaux attendus) ;
- après rencontre : grille A / C / F / NE → barres pleines.

### 3.5 L’organisateur prouve le critère « responsible »

**Avis :** Espoo exige pas de décision auto sur des personnes. Montrer l’approbation + les exclus + le motif + le journal vaut plus qu’un paragraphe AI Act dans le pitch.

**Piste (priorité P0) :** `/organiser` :
- suggestions par besoin (fraction, couverture, « to check ») ;
- talents sans suggestion + motif ;
- égalités à trancher ;
- ajouter / retirer avec motif d’une ligne ;
- journal append-only (auteur, heure, motif).

### 3.6 Carte talent — nécessaire, stub acceptable au début

**Avis :** le parcours talent doit exister, mais un stub crédible (CV synthétique + questions fermées + règle écrite de niveau) bat une intégration Gemini bancale.

**Piste (priorité P1) :** `/talent/new` selon AGENTS.md. Repérage CV = règles handwritten / démo stub d’abord ; Gemini ensuite. Talent ne voit **jamais** rang ni fraction.

### 3.7 Tech challenges — discipline

**Avis :** enchaîner Aiven + Context + Nemotron + Gemma avant une démo bout-en-bout est un anti-pattern de hackathon.

**Piste :**
- Niveau 1 démo complète d’abord.
- Gemini seulement pour : questions besoin, exemples de cartes, spotting CV, questions métier du brief — toujours validé contre liste fermée + humain.
- Codex = outil de build sur modules purs (`scoring` / suggestions / brief helpers), pas un second produit.
- Autres challenges : **seulement** après démo stable ×2.

### 3.8 Nom / soumission Junction

**Avis :** « Signal » entre en collision ; « Lowkey » ne vend rien à Espoo ; « Rosace » est OK en working name mais faible en punchline.

**Piste (hors code, pour le porteur) :**
- Punchline = la promesse mot pour mot.
- Nom projet : un seul mot anglais clair (à trancher une fois).
- Remplir description, demo URL, source, vidéo **avant** le gel features.

### 3.9 Storytelling démo

**Avis :** le héros doit rester la recruteuse. Inclure un talent au parcours associatif mal rendu par le CV — c’est votre preuve anti-biais visible.

**Piste :** enchaînement Version simple (7 temps). Terminer sur la promesse. Prévoir un « cas modifié » par un tiers (juré change un niveau → recalcul live).

### 3.10 Données & conformité (discours, pas code urgent)

**Avis :** garder **6 mois sur demande** (Version simple / AGENTS), pas 24 mois V3. Dire au jury : usage recrutement = haut risque AI Act ; on ne prétend pas la conformité, on conçoit pour l’explicabilité + décision humaine.

**Piste Codex :** ne pas coder purge auto / comptes / OAuth avant le gel. Role switcher démo suffit.

---

## 4. Backlog ordonné pour Codex

Construire sur branches `cursor/...` + PR. Garder les données démo green à chaque étape. Ne pas élargir le périmètre.

### P0 — sans ça, pas de démo gagnante

| ID | Livrable | Critère « terminé » |
|---|---|---|
| P0.1 | Brief `/brief/[need]/[talent]` | Page lisible : why / questions / good answer / rosaces ; questions banque handwritten pour composantes |
| P0.2 | Observation A/C/F/NE | Après saisie, barres observées pleines ; valeur stockée à part du déclaré |
| P0.3 | Organisateur `/organiser` | Suggestions, exclus + motifs, égalités, add/remove + motif, journal |
| P0.4 | Brancher overview → ces écrans | Depuis `page.tsx`, navigation claire vers need / talent / organiser / brief |

### P1 — parcours complet

| ID | Livrable | Critère « terminé » |
|---|---|---|
| P1.1 | Carte talent `/talent/new` | CV collé non stocké ; spotting + citations ; 3 questions fermées ; règle écrite → niveau confirmé ; rosace pointillée |
| P1.2 | Accept / refuse rencontre (minimal) | Talent peut accepter/refuser une proposition affichée ; pas de waitlist auto |
| P1.3 | Bouton « demander un réexamen » | Une phrase libre → entrée journal organisateur |

### P2 — polish démo

| ID | Livrable | Critère « terminé » |
|---|---|---|
| P2.1 | Cas modifié live | Changer un niveau déclaré ou attendu → suggestions / brief se mettent à jour |
| P2.2 | Textes UI anglais cohérents | Aucun « score », « best match », « verified skill » |
| P2.3 | Tests | `npm test`, `npx tsc --noEmit`, `npx eslint src`, `npm run build` verts |

### P3 — seulement après P0+P1 stables

| ID | Livrable | Note |
|---|---|---|
| P3.1 | Gemini (liste fermée + validation humaine) | Pas de clé dans le dépôt |
| P3.2 | Persist légère (Supabase recommandé vs Aiven si setup long) | Ou localStorage démo si le temps manque |
| P3.3 | Deploy Vercel | Lien pour la soumission |

### Hors scope explicite (ne pas coder)

- Allocation / waitlist / remplacement automatique  
- Test d’équité batch / page publique de stabilité  
- Recherche ESCO vectorielle / pgvector  
- Context.dev, Nemotron, Gemma, Oxylabs, ElevenLabs, Cloudinary  
- Traduction, résumé IA, alerte désaccord récit/niveau  
- Auth réelle, conservation automatique 6/24 mois  
- Classement global des talents  

---

## 5. Contradictions à résoudre (pour Codex)

| Sujet | Document A | Document B / code | Décision pour coder |
|---|---|---|---|
| Exemple chiffré | Version simple : 11/15 (job skill en majeure) | AGENTS.md / code : job skills à part | **Code** — fractions type « 13 out of 19 » |
| Répartition places | Signal V3 : 2 passes + waitlist | Version simple / AGENTS : abandonné | **Abandonné** |
| Conservation carte | V3 : 24 mois | Version simple / AGENTS : 6 mois si demandé | **6 mois** (discours) ; pas de purge auto avant gel |
| Nom | Signal / Rosace / Lowkey | — | Working name **Rosace** en code ; punchline = promesse |
| Gemini timing | V3 : cœur dès le début | Version simple : après parcours / AGENTS step 6 | **Après** écrans P0/P1 cliquables ; stub OK avant |

---

## 6. Messages à ne jamais produire (review UX / copy)

Si Codex génère de la copy, **rejeter** :

- « AI-verified candidate »  
- « Skill confirmed » / « competence proved »  
- « Best talent » / ranking  
- Pourcentages d’alignement  
- « Everyone gets a meeting »  
- « Bias-free » (dire ce qui est mesuré / exclu du calcul, et le risque restant)

**Formulations préférées :**

- declared level / observed level  
- to check during the conversation  
- suggestion (not decision)  
- incomplete card / no major at Foundation / edged out by others  

---

## 7. Mesures de succès (pour le porteur, pas pour Codex)

À viser pendant le hackathon ; Codex prépare le produit qui les rend mesurables.

1. Mentor Espoo : ≥ 4 / 6 suggestions jugées utiles (désaccords montrés).  
2. Chronos : besoin < 5 min ; carte talent < 8 min ; approbation < 2 min / liste.  
3. Chaque brief a ≥ 1 question née d’un inconnu / déclaré sans situation.  
4. Démo complète 2 fois de suite sans intervention technique.

---

## 8. Instructions opératoires pour Codex

1. Lire `AGENTS.md` en entier avant toute modification.  
2. Une branche = un livrable P0/P1 ci-dessus.  
3. Ne pas rouvrir le moteur de scoring sauf bug prouvé par test.  
4. Préférer stub / handwritten à une intégration IA partielle.  
5. Garder `npm test`, `npx tsc --noEmit`, `npx eslint src`, `npm run build` verts.  
6. Si une demande n’est pas dans §4 P0–P3 : **demander** avant de coder.  
7. Ne jamais committer de clé API.

---

## 9. Synthèse en trois lignes

1. **Garder** la thèse Version simple et le moteur actuel.  
2. **Construire maintenant** brief + organisateur (+ carte talent), pas plus de tech challenges.  
3. **Vendre** une conversation préparée, pas un matching algorithmique.

*— Fin de l’audit. Ce fichier est volontairement normatif pour limiter le scope de Codex.*
