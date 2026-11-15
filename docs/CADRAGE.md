# Cadrage Rosace : le document de référence

Ce fichier est la source de vérité du projet. Il est tenu à jour à chaque décision.

**Pour tout agent (ChatGPT, Codex, Cursor, Claude) :**
- lis ce fichier en entier avant de coder ou de proposer quoi que ce soit, puis `AGENTS.md` ;
- si une demande contredit ce fichier, signale-le au lieu de coder ;
- si ce fichier et `AGENTS.md` ne disent pas la même chose, ce fichier gagne ;
- ne tranche jamais seul un point de la partie « À trancher » : propose, Nicolas décide.

**Pour mettre à jour :** quand Nicolas tranche un point, déplace-le de « À trancher » vers « Journal des décisions », avec la date. Si une règle change, modifie aussi la partie concernée plus haut.

Dernière mise à jour : 2026-11-14 (21 h 30, Paris) — tests du site en ligne, correctifs, données de démo réalistes, nettoyage du dépôt.

---

## 1. Le projet en bref

- Junction 2026, défi « Rethinking Recruitment » de la Ville d'Espoo. Nom de travail : **Rosace**. Nom sur la plateforme Junction : `Rosace_lowkey`.
- Le contexte : des événements de recrutement à Espoo, en présence, en ligne ou hybrides. Les entreprises ont du mal à dire ce dont elles ont vraiment besoin. Les talents ont du mal à montrer ce qu'ils savent faire, et les CV écrits par IA se ressemblent tous.
- La promesse : **« We turn claims into questions you can check during the conversation. »** On ne prétend jamais détecter un CV gonflé ni prouver une compétence.
- Le recruteur est le héros de la démo. Une personne décide toujours : l'outil ne fait que suggérer.
- La notation du jury : impact 45 %, innovation et UX 35 %, exécution responsable et faisable 20 %.

## 2. Règles fixes (non négociables)

1. **Le système Centrale ne bouge pas** : 5 compétences, 12 composantes, les niveaux (Not yet, Foundation, Intermediate, Advanced) et la rosace. Aucun ajout, retrait ou renommage sans l'accord de Nicolas.
2. **Simple avant tout.** Pas d'algorithme d'affectation, pas de liste d'attente, pas de classement ni de score montrés aux talents, pas de pourcentage à l'écran.
3. **Données fictives uniquement.** Aucune vraie personne, aucune vraie entreprise. On ne cherche jamais un talent sur le web.
4. **Aucun critère de biais** : nationalité, langue, âge, genre ou diplôme ne servent jamais dans un calcul.
5. **Aucune clé d'API dans le dépôt.** Les clés vont dans les réglages de l'hébergeur. Les fichiers `.env*` sont ignorés par Git.
6. **Le CV n'est jamais stocké**, même pas dans les journaux d'IA.
7. **Le produit est en anglais** (interface, code, commentaires). Les échanges avec Nicolas sont en français.
8. Chaque changement garde au vert les tests, TypeScript, ESLint et le build.

## 2 bis. Les 12 composantes : toujours des verbes d'action

Comme dans le système Centrale (grille CLC), chaque composante est une action qu'on peut observer, jamais un nom abstrait comme « Quality » ou « Team ». Les noms complets et les libellés courts de la rosace commencent tous par un verbe. Un agent ne doit jamais les remplacer par des noms.

| Code | Nom (interface) | Libellé court (rosace) |
|---|---|---|
| C1.1 | Reach out to people | Reach out |
| C1.2 | Understand and convince | Convince |
| C2.1 | Know the rules and stick to them | Follow the rules |
| C2.2 | Get it right and spot the error | Get it right |
| C3.1 | Scope a job | Scope the work |
| C3.2 | See it through and hand it over | See it through |
| C4.1 | Work with others | Work with others |
| C4.2 | Own your decisions | Own decisions |
| C4.3 | Keep commitments and manage your time | Keep commitments |
| C5.1 | Break down a problem | Break down problems |
| C5.2 | Learn fast on your own | Learn fast |
| C5.3 | Communicate clearly | Communicate clearly |

Les compétences techniques suivent la même règle, par exemple « Program embedded systems in C ».

Ces noms sont livrés dans `feat/coherent-ux`. Ne pas les remplacer par d’anciens libellés (Listen, Present, Quality…).

## 3. Besoin d'une entreprise et calcul

- **Exactement 3 composantes majeures** (poids 2), dessinées en or, par-dessus la rosace. Ce sont toujours des composantes Centrale.
- **Composantes mineures sans limite** (poids 1), dessinées en rouge.
- **Jusqu'à 3 compétences techniques** (poids 2), prises dans un catalogue de 20 compétences réparties en 4 familles (embarqué, logiciel, data, support IT). Elles ne sont jamais majeures et s'affichent en barres à côté de la rosace.
- **Points** = poids × min(niveau, niveau attendu). On les affiche en fraction (par exemple 13/19), jamais en pourcentage.
- **Couverture** : un profil est incomplet sous 70 % du poids demandé. Les majeures et compétences techniques manquantes sont listées « à vérifier ».
- **Égalité à la limite** : l'outil ne départage jamais. Les talents à égalité vont à l'organisateur.
- **Observation** après l'entretien, grille Centrale : vu clairement (A = 1), vu en partie (C = 0,6), pas vu (F = 0), pas abordé (NE, ignoré). La valeur observée est le niveau multiplié par la performance. Elle ne s'ajoute jamais au déclaré.
- **Descripteurs** : une seule échelle. 1 = avec aide, cas simple. 2 = seul, cas réel. 3 = seul, situation nouvelle ou changeante, et d'autres dépendent du résultat. Chaque descripteur doit pouvoir se vérifier avec « Racontez-moi une fois où… ». Pas de réputation, pas de trait de personnalité. La communication est jugée sur le fait d'être compris, jamais sur l'accent ou la grammaire.

## 4. La rosace

- Disque gris, axes rouges en pointillés, les 3 majeures en or dessinées en dernier.
- Une barre pointillée = déclaré par le talent. Une barre pleine = observé par un recruteur. Un trait noir = niveau attendu par l'entreprise. Une branche vide = non renseigné, jamais zéro.
- Les libellés au bout des branches commencent par un verbe d'action.
- Le logo est une petite rosace avec 3 branches or en haut.
- **La longueur d'une branche a toujours un sens en niveau** (décidé le 2026-11-14). L'échelle est fixe : la branche part du petit cercle blanc, le bord du disque gris vaut Foundation, l'anneau intermédiaire vaut Intermediate et le cercle extérieur vaut Advanced. Ça vaut pour le déclaré, l'attendu et l'observé.
- Une observation se place sur la même échelle : niveau de la situation × performance (A = 1, C = 0,6, F = 0). Par exemple, « vu clairement » sur un exercice Intermediate atteint l'anneau Intermediate, et « vu en partie » s'arrête à 60 % de cette longueur.

## 5. Le parcours de démo

En 4 étapes, avec un parcours guidé de 3 minutes sur `/tour` (données NordChip et Amira) :
1. **Recruteur** : NordChip dit ce qui compte (3 majeures, niveaux attendus, compétences techniques).
2. **Talent** : Amira transforme son CV en carte de compétences, en pointillés.
3. **Organisateur** : il voit les suggestions avec leurs raisons, les égalités et les personnes sans suggestion, puis il approuve.
4. **Conversation** : des questions là où la carte est la plus faible, puis l'observation sur la grille Centrale (barres pleines).

## 6. Direction artistique

- Thème clair perle partagé par la barre latérale, le bandeau, les formulaires et les panneaux. Fond Aurora plein écran ; pas de juxtaposition de panneaux blancs et noirs.
- Seules couleurs fortes : rouge Centrale `#C8102E` et or `#F0C300`, plus des gris. Plus de crème, de bleu, de vert, de violet ni de police à empattements. Les cinq compétences parentes n’utilisent que cette palette.
- Titres en Space Grotesk, texte en Inter, hébergés dans le projet (aucun appel à Google Fonts).
- Adaptations des composants gratuits Aceternity : Aurora Background, Glowing Effect sur les cartes d’accueil, Text Generate Effect sur le titre et Background Beams discrets dans les en-têtes. Attributions dans `docs/ACETERNITY_ATTRIBUTION.md`. Tout devient statique si l’utilisateur demande moins d’animations.
- Motion design : des animations qui expliquent (la rosace qui se construit, le pointillé qui devient plein, l'arrivée des suggestions, les transitions), plus des effets décoratifs. Implémenté sur `feat/coherent-ux`, y compris les compteurs animés.
- Les textes disent ce que fait l'outil. Pas de slogans.

## 7. Technique

- Next.js 15, React 19, TypeScript, Tailwind 4, Vitest et Playwright.
- **Stockage** : dans le navigateur pour la démo. Tous les rôles partagent le même navigateur.
- **IA : Claude via l’API Anthropic** (nouvelle décision de Nicolas, remplace Featherless), côté serveur. Elle propose, par exemple des exemples de niveau ou un premier retour sur un exercice, et une personne relit toujours. Gemini et Featherless ne sont plus utilisés.
- **Contexte entreprise** (facultatif) : Context.dev, côté serveur. Ce n'est pas un tech challenge visé.
- **Hébergement : Aiven** (tech challenge retenu), pas Vercel. [Aiven Runtime](https://aiven.io/runtime) fait tourner une application en conteneur, ce qui demande d'ajouter un `Dockerfile` (Next.js en mode `standalone`). La base de données serait Aiven PostgreSQL. Restent à vérifier : les crédits, la région européenne et la gestion des clés.
- **Données** : on héberge d'abord sur Aiven avec le stockage dans le navigateur, sans base de données. Aiven PostgreSQL ne vient que s'il reste du temps.

## 7 bis. Attester un niveau (plan validé par Nicolas le 2026-11-14)

Déclarer un niveau ne suffit pas. Pour chaque composante, on prévoit comment le vérifier, et c'est toujours **une personne qui note** (A, C, F ou NE). Selon la dernière clarification de Nicolas, l’IA peut proposer A/C/F/NE avec une justification fondée sur la réponse et la grille. Cette recommandation ne devient une observation qu’après validation explicite du recruteur, qui peut choisir une autre note.

Il y a trois façons de vérifier :
- **En ligne, avant l'événement** : un court exercice écrit ou technique, fait par le talent puis relu par un recruteur avec une grille. Au maximum 20 minutes au total par talent.
- **Sur place, à l'événement** : une courte mise en situation (jeu de rôle, tâche à plusieurs) observée par le recruteur. Au maximum 10 minutes.
- **Pendant l'entretien** : la question « Racontez-moi une fois où… » avec sa relance. C'est la preuve la plus faible, et elle compte comme telle.

Chaque exercice existe en trois versions, Foundation, Intermediate et Advanced. Le talent fait la version du niveau qu'il déclare.

| Composante | Comment on vérifie | Exemple de situation |
|---|---|---|
| C1.1 Reach out to people | Sur place | Il manque une information pour avancer : aller la chercher auprès d'un « collègue » joué par un recruteur. |
| C1.2 Understand and convince | Sur place | Jeu de rôle : un client décrit mal son problème. Reformuler, puis proposer une solution et la faire accepter. |
| C2.1 Know the rules and stick to them | En ligne | Un extrait de règle (protection des données, règles de code) et 5 cas : dire ce qui est permis et pourquoi. |
| C2.2 Get it right and spot the error | En ligne | Relire un petit livrable (code ou tableau) et trouver les erreurs, avec une grille de relecture. |
| C3.1 Scope a job | En ligne | Découper une demande floue en étapes, avec une durée et un risque pour chacune. |
| C3.2 See it through and hand it over | En ligne et entretien | Écrire la note de passation d'un mini-projet fictif, puis en parler. |
| C4.1 Work with others | Sur place | Une mini-tâche à 2 ou 3, observée : partage du travail, écoute, résultat commun. |
| C4.2 Own your decisions | Entretien et sur place | Un choix à faire entre deux options avec des informations incomplètes : décider et justifier. |
| C4.3 Keep commitments and manage your time | Entretien seulement | On ne peut pas l'observer en 10 minutes. On demande un exemple concret sur plusieurs semaines, marqué « parlé, pas observé ». |
| C5.1 Break down a problem | En ligne | Un rapport de bug vague : écrire l'analyse et les questions à poser. |
| C5.2 Learn fast on your own | En ligne | 20 minutes pour prendre en main un petit outil fictif non documenté, puis répondre à 3 questions. |
| C5.3 Communicate clearly | Sur place | Expliquer en 2 minutes un sujet technique à un non-spécialiste. On juge si c'est compris, jamais l'accent ni la grammaire. |
| Compétences techniques | En ligne | Un petit test pratique (corriger une fonction C, écrire une requête SQL…). Des tests automatiques peuvent aider le relecteur, mais c'est lui qui note. |

À l'écran, ça reste simple : pour chaque composante demandée, une ligne qui dit comment elle sera vérifiée et où en est la vérification (à faire, faite, notée). L'actuel « Practice studio » devient cette partie.

## 8. Branches et pull requests

- **Version actuelle de l’application :** branche `feat/coherent-ux` (PR #11 vers `main`). Elle contient le cadrage, le catalogue, la démo guidée, l’UX cohérente, les checks chronométrés.
- Les anciennes branches / PR #3 à #10 (descripteurs, catalogue, visual-workspace, shader, guided-demo, framing, etc.) sont **intégrées** dans `feat/coherent-ux` puis fermées / supprimées pour éviter la confusion. Ne pas les rouvrir.
- Nouveau travail : brancher depuis `feat/coherent-ux` (ou depuis `main` après fusion de la PR #11). Une PR = un sujet. Ne pas réintroduire Featherless / Gemini.
- `main` ne reçoit l’application qu’après fusion explicite de la PR #11.

## 9. Journal des décisions

- 2026-11-13 : on garde le système Centrale à tout prix.
- 2026-11-14 :
  - produit en anglais, 3 niveaux plus « Not yet » ;
  - le talent ne voit jamais de rang ni de score ;
  - le recruteur est le héros de la démo ;
  - les 3 majeures sont toujours des composantes Centrale, en or ;
  - noms des composantes repris de la grille CLC, avec des descripteurs ancrés dans un poste tech ;
  - catalogue technique : 20 compétences, au plus 3 par besoin ;
  - les mineures n'ont pas de limite, et les libellés de la rosace commencent par un verbe d'action ;
  - le front faisait « bullshit » : nouvelle direction artistique, avec les effets gratuits d'Aceternity ;
  - on fait d'abord le parcours guidé, ensuite le motion design ;
  - hébergement par un tech challenge, pas par Vercel ;
  - ce fichier de cadrage devient la référence commune pour tous les agents ;
  - la longueur des branches a toujours un sens en niveau : échelle fixe pour le déclaré, l'attendu et l'observé ;
  - les écrans restent simples, mais chaque composante doit pouvoir être attestée : exercices en ligne relus par une personne, mises en situation sur place, questions d'entretien (voir 7 bis) ;
  - tech challenges retenus : Aiven (Featherless a été remplacé plus tard par Anthropic) ;
  - données : Aiven avec stockage dans le navigateur d'abord, PostgreSQL seulement s'il reste du temps (Nicolas a laissé Claude choisir) ;
  - motion design : des effets qui expliquent, plus des effets décoratifs ;
  - on attend que Codex finisse de refaire l'UX avant de toucher aux écrans ;
  - rappel de Nicolas : les composantes sont toujours des verbes d'action, comme dans le système Centrale (voir 2 bis).

### Décisions confirmées et livraison du 14 novembre 2026

- **Validé par Nicolas** : tableau 7 bis et trois exercices de démo C5.1, C2.2, J.EMBEDDED_C ; seul un recruteur donne A/C/F/NE.
- **Validé par Nicolas** : moyenne des valeurs observées, et non maximum. Chaque valeur vaut niveau de la situation × performance ; NE est exclu, F vaut zéro. Une correction remplace la note de la même situation ; une autre situation apporte une observation distincte. La déclaration reste intacte.
- **Validé par Nicolas** (puis ajusté le soir) : la démo 3 minutes n’est **plus** dans la sidebar métier. Elle reste sur le sas (`Explore the demo`), dans le menu **Demo profile**, et en lien discret en bas des accueils rôle. Quatre étapes métier + Checks dans la nav. `/demo` reste accessible par URL, hors menu.
- **Validé par Nicolas** : la vingtième compétence est « Build data pipelines », famille Data. La branche importée n’en contenait que dix-neuf.
- **Implémenté** : intégration des branches de cadrage, catalogue et démo dans `feat/coherent-ux` ; aucune PR fusionnée sur GitHub. Noms exacts, trois majeures, mineures sans plafond ajouté, trois compétences techniques, échelles fixes et moyenne testée.
- **Implémenté** : `/checks` (redirection depuis `/practice`), neuf variantes écrites à la main, 6 + 6 + 8 minutes au total. Statuts To check / Done / Graded. Réponses fictives sauvegardées dans le navigateur, note humaine séparée, remplacement d’une réponse nécessitant une nouvelle relecture. Les autres exercices en ligne sont explicitement indiqués comme à préparer.
- **Implémenté** : consignes sur place dans le brief (budget commun de dix minutes), C4.3 « Discussed, not observed », sans note d’observation. Retour Claude (Anthropic) facultatif sur action explicite ; recommandation A/C/F/NE possible, note finale humaine seulement.
- **Implémenté** : démo NordChip/Amira en quatre étapes avec exemple en ligne déjà noté ; fond perle Aurora et animations accessibles.
- **Préparé, pas déployé** : image Node 22 / Next.js standalone et procédure Aiven Runtime. Pas de PostgreSQL. Les crédits, la région européenne, les paramètres du compte Aiven et les appels réels Claude/Context.dev restent à vérifier.
- Les tests Playwright du dossier `e2e/` tiennent lieu de revue finale. Les validations de rendu et les informations événementielles ci-dessous restent ouvertes.

### Changement demandé après le cadrage initial

- Nicolas remplace Featherless par **Anthropic** pour tous les usages IA : propositions de compétences, exemples de niveaux, exercices et retour au recruteur. Les anciennes mentions Featherless dans le journal décrivent le choix précédent.
- RAG sur les passages de fiche de poste et de contexte entreprise relus, avec références visibles et validation du catalogue fermé. Aucun CV dans ce corpus ; aucune note finale enregistrée par Claude. La dernière décision ci-dessous autorise une recommandation de note sur une réponse soumise.
- **Espaces séparés** : Candidat (fiche, `/talent/checks`), Recruteur (besoin, préparation/relecture dans `/checks`, conversations), Organisateur (événement). Le sas et le menu de profil décrits ci-dessous remplacent le sélecteur initial. Ils ne constituent pas une authentification.
- Un exercice généré reste une proposition jusqu’à acceptation explicite du recruteur. La réponse conserve la version de l’exercice effectivement présentée.
- Clé uniquement dans `.env.local` en local, ou les secrets runtime Aiven. Procédure : `docs/CLAUDE_SETUP.md`. Les tests simulés sont distincts du test API réel, encore dépendant de la configuration de la clé.

### Sas d’accueil validé par Nicolas le 14 novembre 2026

- Première visite sur `/` : deux entrées principales **Candidate / Recruiter**, accès organisateur discret, **Explore the demo** sans connexion vers `/tour`.
- Choix du rôle avant la connexion. Pour cette livraison : **maquette explicite** du parcours e-mail puis code, avec adresse fictive en lecture seule, code de démonstration visible et possibilité de passer la maquette. Aucun envoi d’e-mail, compte, session ou contrôle d’accès réel.
- Accueils propres à chaque rôle : `/candidate`, `/recruiter`, `/event`. Une action principale et la rosace locale lorsqu’une carte/un besoin a été sauvegardé. L’ancien aperçu reste sur `/overview`.
- Le navigateur mémorise uniquement le mode choisi : le retour sur `/` ouvre son accueil. Le menu **Demo profile** permet de changer d’espace ou de revenir au sas. Les données de démo restent partagées dans ce navigateur.
- Cible ultérieure : véritable connexion par e-mail/code et organisateurs sur invitation. **À brancher après validation du parcours**, avec permissions côté serveur et stockage partagé. La maquette ne réserve pas réellement l’espace organisateur aux invités.
- Vérification face au challenge : voir `CHALLENGE_ALIGNMENT.md`. Le cadre Centrale reste le choix de ce projet, pas une exigence formulée par Espoo. Aucun calcul, catalogue ou seuil n’est modifié par cet audit.

### Clarification suivante : démo autonome et vérification en deux temps

- **Demandé par Nicolas** : `/tour` montre automatiquement un cas prérempli à chaque étape. Le scénario fictif dure trois minutes, avec pause, reprise et navigation par moment. Les approbations montrées sont des actions humaines préécrites dans un scénario ; aucune décision réelle, écriture du navigateur ou requête IA n’est déclenchée par la lecture.
- **Demandé par Nicolas** : avant l’événement, un exercice limité dans le temps est proposé pour les compétences qui s’y prêtent ; le candidat soumet ; Claude peut recommander A/C/F/NE en s’appuyant sur les critères et des citations exactes ; le recruteur relit puis valide ou remplace la recommandation. Aucune note ni observation automatique.
- **Demandé par Nicolas** : les autres composantes sont vérifiées sur place avec consignes, exercices et questions proposés. C4.3 reste « Discussed, not observed ».
- **Livraison** : six composantes Centrale en ligne et vingt compétences techniques, chacune aux trois niveaux (78 variantes écrites à la main), avec adaptation facultative par Claude sur contexte relu. Les trois exercices initiaux restent le programme NordChip par défaut.
- **Limite existante conservée en attendant un éventuel changement de Nicolas** : vingt minutes au total pour le programme sélectionné, pas 78 exercices imposés à une personne. Le recruteur choisit les priorités du besoin ; une compétence non sélectionnée n’est pas considérée comme échouée. Dix minutes partagées sur place.
- **Choix de fonctionnement annoncé, ajustable** : à la fin du temps, la saisie s’arrête et le candidat peut soumettre sa réponse existante. Le chronomètre est local, sans contrôle d’identité ni surveillance, et un brouillon non soumis ne survit pas au rechargement. Les durées ne donnent jamais une note automatique.
- Les propositions de compétences/exercices restent distinctes de cette nouvelle recommandation sur une réponse. Les anciennes mentions « jamais la note » dans les comptes rendus décrivent l’étape précédente ; la décision finale appartient toujours à une personne.

### Tests du site en ligne et préparation du rendu (14 novembre 2026, soir)

- **Demandé par Nicolas** après les tests du site Aiven : corriger les bugs trouvés, ajouter les améliorations recommandées, rendre les données de démo réalistes et cohérentes, nettoyer le dépôt. Il ne doit rester que la vidéo.
- **Implémenté** : limite des appels IA par visiteur (6 par minute), plus un plafond du site (40 par minute, 600 par jour) ; `ANTHROPIC_MODEL` devient facultatif (`claude-sonnet-5-5` par défaut), seule la clé est nécessaire sur Aiven ; en-têtes de sécurité (CSP, HSTS, X-Frame-Options, Referrer-Policy) ; vraie page 404 ; `/tour` remonte en haut à chaque étape et la barre latérale suit le rôle de l'étape ; lien retour du brief vers Conversations.
- **Implémenté** : la promesse sur l'accueil ; une section « Responsible by design » sur `/overview` (AI Act, une personne décide, raisons lisibles, aucun critère de biais, données minimales) ; un brief de conversation imprimable ; une prochaine étape proposée à l'organisateur pour chaque personne sans suggestion ; la liste par besoin commence par les personnes suggérées.
- **Données de démo** : un événement, trois besoins (NordChip, Lumora, Vireo Data · Junior data analyst) et dix talents (Elina, Omar, Tuomas et Priya ajoutés). Chaque niveau déclaré s'appuie sur une ligne de CV ou reste une simple déclaration. L'égalité à la limite se montre désormais sur Vireo Data (Priya et Tuomas) ; Jonas et Kwame restent sans suggestion faute de carte remplie. Les chiffres de la démo NordChip/Amira ne changent pas.
- **Nettoyage** : comptes rendus d'audit et captures d'écran périmés retirés (ils restent dans l'historique Git). Restent : ce cadrage, `AGENTS.md`, `README.md`, `ROADMAP.md`, `CHALLENGE_ALIGNMENT.md`, `CLAUDE_SETUP.md`, `INTEGRATIONS.md`, `DEPLOY_AIVEN.md`, `ACETERNITY_ATTRIBUTION.md`.
- **Context.dev** : l'appel serveur correspond à la documentation officielle (`POST /v1/web/scrape`, Bearer, `formats.markdown`). Il devient actif dès que `CONTEXT_DEV_API_KEY` est posée sur Aiven.

### Simplifications légères du 15 novembre 2026

- **Validé par Nicolas** : la vidéo V3 (2 min 39) est conservée, donc les écrans filmés ne changent pas de fond. Les onglets du formulaire recruteur et le parcours Fatima × Kaarna restent identiques.
- **Implémenté** : un seul rappel de démo par écran (« Fictional demo » en haut, détail au survol). Retirés : « Synthetic profiles · Local workspace » dans la barre latérale, la ligne de pied de page et le paragraphe « Local demo » du bureau organisateur.
- **Implémenté** : bureau organisateur. Le nombre de personnes sans suggestion reste visible, leurs raisons et prochaines étapes s’ouvrent d’un clic. Pour chaque besoin, les suggérés et les égalités sont affichés, les autres personnes sont repliées sous « Other people for this need ».
- **Implémenté** : `/demo` redirige vers `/tour`. Le bloc « Responsible by design » reste sur `/overview`, `/tour` n’est pas modifié.

## 10. À trancher ensemble

Pour chaque point : les options, et ma recommandation en gras.

**a. Le rendu** — **tranché** : vidéo 2–3 min sur `/tour`, 3 ou 4 slides, texte du formulaire Junction.

**b. Infos manquantes (Nicolas)**
- Heure exacte du rendu.
- Durée du pitch.
- Qui est dans l'équipe.
- Retours de l'équipe Espoo sur place.

### Décisions UX du 14 novembre 2026 (soir)

- Démo 3 min hors nav latérale des rôles ; sas + menu profil + lien discret en bas des homes.
- Accueils rôle : CTA métier d’abord ; lien démo secondaire discret conservé.
- Palette forte limitée au gris, rouge Centrale et or.
- Motif organisateur « outranked » → « Eligible, but capacity is filled by closer fits ».
- Pas de fusion `main` tant que le pitch/vidéo ne sont pas prêts (`feat/coherent-ux` / PR #11).
