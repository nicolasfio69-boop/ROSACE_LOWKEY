# Cadrage Rosace : le document de référence

Ce fichier est la source de vérité du projet. Il est tenu à jour à chaque décision.

**Pour tout agent (ChatGPT, Codex, Cursor, Claude) :**
- lis ce fichier en entier avant de coder ou de proposer quoi que ce soit, puis `AGENTS.md` ;
- si une demande contredit ce fichier, signale-le au lieu de coder ;
- si ce fichier et `AGENTS.md` ne disent pas la même chose, ce fichier gagne ;
- ne tranche jamais seul un point de la partie « À trancher » : propose, Nicolas décide.

**Pour mettre à jour :** quand Nicolas tranche un point, déplace-le de « À trancher » vers « Journal des décisions », avec la date. Si une règle change, modifie aussi la partie concernée plus haut.

Dernière mise à jour : 2026-11-14.

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
- La longueur des branches est encore à trancher (voir 10.a).

## 5. Le parcours de démo

En 4 étapes, avec un parcours guidé de 3 minutes sur `/tour` (données NordChip et Amira) :
1. **Recruteur** : NordChip dit ce qui compte (3 majeures, niveaux attendus, compétences techniques).
2. **Talent** : Amira transforme son CV en carte de compétences, en pointillés.
3. **Organisateur** : il voit les suggestions avec leurs raisons, les égalités et les personnes sans suggestion, puis il approuve.
4. **Conversation** : des questions là où la carte est la plus faible, puis l'observation sur la grille Centrale (barres pleines).

## 6. Direction artistique

- Barre latérale et bandeau d'accueil noirs, surfaces de travail blanches.
- Seules couleurs fortes : rouge Centrale `#C8102E` et or `#F0C300`. Plus de crème, de vert ni de police à empattements.
- Titres en Space Grotesk, texte en Inter, hébergés dans le projet (aucun appel à Google Fonts).
- Effets inspirés des composants gratuits d'Aceternity : fond « Wavy Background » sur l'accueil, bordure « Glowing Effect » sur les cartes. Tout s'arrête si l'utilisateur demande moins d'animations.
- Les textes disent ce que fait l'outil. Pas de slogans.

## 7. Technique

- Next.js 15, React 19, TypeScript, Tailwind 4, Vitest et Playwright.
- **Stockage** : dans le navigateur pour la démo. Tous les rôles partagent le même navigateur.
- **IA** (facultative) : Featherless côté serveur, Gemini en option. Une proposition d'IA est toujours relue par une personne.
- **Contexte entreprise** (facultatif) : Context.dev, côté serveur.
- **Hébergement : pas de Vercel.** On passe par un tech challenge, a priori **Aiven**. [Aiven Runtime](https://aiven.io/runtime) fait tourner une application en conteneur, ce qui demande d'ajouter un `Dockerfile` (Next.js en mode `standalone`). La base de données serait Aiven PostgreSQL. Restent à vérifier : les crédits, la région européenne et la gestion des clés (voir 10.d).

## 8. Branches et pull requests

- On travaille à partir de `feat/visual-workspace`, pas de `main`. Chaque changement passe par sa propre branche et une PR vers `feat/visual-workspace`.
- PR ouvertes au 2026-11-14 : #7 (composantes concrètes et catalogue technique), #8 (direction artistique et effets Aceternity), #9 (parcours guidé, construit sur #8). Ordre de fusion : #7, puis #8, puis #9.

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
  - ce fichier de cadrage devient la référence commune pour tous les agents.

## 10. À trancher ensemble

Pour chaque point : les options, et ma recommandation en gras.

**a. Longueur des branches de la rosace**
- **Mixte : le déclaré et l'attendu restent sur une échelle fixe (le cercle extérieur vaut Advanced). L'observé suit Centrale : on additionne les observations, et la longueur est relative au meilleur score.**
- Tout comme Centrale : toutes les longueurs sont relatives au meilleur score de la personne. On perd alors la comparaison avec le niveau attendu.
- Garder l'échelle fixe partout, avec seulement le disque gris mis à 42 % comme chez Centrale.

**b. Ce qu'on montre au jury**
- **Retirer du menu le Practice studio et la page `/demo`, sans supprimer le code. Le menu ne montre que le parcours guidé et les 4 étapes.**
- Tout garder.
- Supprimer ces écrans du code.

**c. Tech challenges à viser**
- **Aiven pour l'hébergement, et Featherless seulement si un vrai appel marche avant le rendu.** Context.dev seulement s'il apporte quelque chose de visible dans la démo. Pas d'Oxylabs.
- Ne viser qu'Aiven.

**d. Données partagées**
- **Héberger d'abord sur Aiven avec le stockage dans le navigateur, sans base de données. Ajouter Aiven PostgreSQL seulement s'il reste du temps.**
- Brancher PostgreSQL tout de suite, avec de vrais comptes. C'est plus long et plus risqué.

**e. Motion design**
- **Animer ce qui explique : la rosace qui se construit, le passage du pointillé au plein, l'arrivée des suggestions et les transitions entre étapes. En CSS, plus un peu de la librairie Motion si besoin.**
- Ajouter des effets décoratifs en plus.

**f. Le rendu**
- **Une vidéo de 2 à 3 minutes qui suit le parcours guidé, 3 ou 4 slides, et le texte du formulaire Junction.**

**g. Infos manquantes (Nicolas)**
- Heure exacte du rendu.
- Durée du pitch.
- Qui est dans l'équipe.
- Retours de l'équipe Espoo sur place.
