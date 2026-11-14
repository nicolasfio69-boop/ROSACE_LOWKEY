# Cohérence avec le cadrage et le challenge Espoo

Revue du 14 novembre 2026, actualisée après la demande de démo automatique et de recommandation de note, sur `feat/coherent-ux` (PR #11), après les parcours métier, Claude, la passe Impeccable et le sas d’accueil. Cette revue confronte le code et les tests au cadrage ; elle ne remplace pas un test avec Espoo ou un audit juridique.

## Sources et conclusion

- Source projet : [CADRAGE.md](CADRAGE.md), lu intégralement, avec les décisions de Nicolas ; [AGENTS.md](../AGENTS.md) et [CODEX_BRIEF.md](CODEX_BRIEF.md).
- Source challenge : PDF fourni **CHALLENGE RETHINK RECRUITEMENT.pdf**, six pages, capture du 13 novembre 2026, [Rethinking Recruitment — City of Espoo](https://hackjunction.app/participate/45/challenges/319). Les pages citées ci-dessous sont celles du PDF, pas une vérification en direct de la plateforme.
- Périmètre contrôlé : accueil, accueils candidat/recruteur/organisateur, aperçu, parcours guidé, besoin, fiche talent, organisation, conversations, brief, checks des deux rôles et démo historique ; bibliothèques de calcul, observations, stockage et adaptateurs IA relus pour étayer les conclusions.

**Rosace est cohérent avec le problème du challenge : clarifier les besoins, rendre les déclarations discutables et préparer des rencontres pertinentes, avec une décision humaine.** La démo locale illustre ce mécanisme. Elle ne prouve pas encore que les rencontres deviennent meilleures ni que le service tient un événement réel.

Le challenge autorise de traiter une seule étape, avant, pendant ou après l’événement (p. 2). Ne pas avoir de calendrier ou de suivi après événement n’est donc pas une non-conformité. Le système Centrale, ses 12 composantes et ses seuils sont des choix du projet, **pas des obligations ni une validation d’Espoo**. Aucun changement de ces règles n’est effectué dans cet audit.

## Cadrage → état vérifiable

| Point | État dans le code / parcours | Limite |
| --- | --- | --- |
| 12 actions et 20 compétences techniques | `framework.ts`, tests de catalogue et parcours `/need/new` | Couverture des vrais métiers d’Espoo non validée ; quatre familles tech seulement |
| 3 majeures, mineures sans plafond ajouté, 3 techniques maximum | `need-selection.ts`, `scoring.ts`, tests unitaires et Playwright | Seuil de couverture et pondérations issus du cadrage, sans validation prédictive |
| Rosace fixe, inconnu distinct de zéro, déclaré distinct d’observé | `Rosace.tsx`, `observations.ts`, tests du niveau de tâche et de la moyenne | Une observation décrit une situation ; elle ne certifie pas la compétence dans tous les contextes |
| A/C/F/NE humains, moyenne hors NE, C4.3 seulement discuté | `workspace.ts`, `verification.ts`, `ConversationBrief.tsx`, `Checks.tsx` | Claude recommande éventuellement A/C/F/NE ; aucune observation sans validation humaine |
| CV transitoire, carte sur consentement, suppression et six mois | `TalentForm.tsx`, nettoyage dans `workspace.ts`, tests de stockage/import/suppression | Expiration appliquée à la lecture du navigateur, pas un service serveur de purge ; ordinateur partagé non sécurisé par ce prototype |
| RAG Anthropic sur contexte relu, sources et acceptation | `reviewed-context.ts`, `context.ts`, `ai-proposals.ts`, routes et tests simulés | Aucun appel réel ni qualité des propositions validés ici ; citations présentes ne garantissent pas la véracité |
| Espaces séparés, parcours local et identité visuelle commune | Sas `/`, accueils dédiés, menu Demo profile, Aurora perle, tests clavier et mobile | Choix de navigation, pas identité ni autorisation ; tous les rôles restent accessibles dans la démo |
| Aiven sans base pour cette livraison | Dockerfile standalone et procédure `DEPLOY_AIVEN.md` déjà préparés | Pas de déploiement réalisé ; crédits/région/paramètres restent à vérifier |

## Challenge → réponse du produit

| Besoin explicite du challenge | Réponse existante | Ce qui reste à démontrer |
| --- | --- | --- |
| Entreprises incapables de décrire leurs besoins assez tôt (pp. 1–2) | Contexte entreprise/poste, travail à distance ou sur place, questions de tâches et exemples de niveaux ; brouillon restaurable | Un recruteur peut-il remplir l’essentiel assez vite ? Le parcours complet de 12 composantes peut encore décourager une entreprise arrivée tard |
| Talents qui peinent à communiquer leurs capacités (pp. 1–2) | Import local, indices cités, questions factuelles, niveaux confirmés et rosace visible | Tester des parcours atypiques et internationaux ; ne pas confondre une formulation fluide avec une compétence |
| Approches nombreuses et peu pertinentes (p. 2) | Suggestions explicables, capacité par besoin, égalités et personnes sans suggestion visibles à l’organisateur | L’approbation manuelle doit réellement examiner les cas écartés. Ne pas présenter le tri comme objectif ou exempt de biais |
| Interprétations IA qui masquent les capacités réelles (p. 2) | Questions et exercices concrets ; distinction déclaration/observation ; propositions IA relues | Les exemples IA doivent aider l’entretien, pas remplacer une preuve. Tester hallucinations, contexte pauvre et réponses hors sujet |
| Plateformes lourdes, connexions simultanées problématiques (pp. 2–3) | Sas court, démo accessible sans connexion, maquette de connexion facultative, mode mémorisé, action principale par rôle | La maquette n’envoie aucun e-mail : elle ne teste ni délivrabilité ni montée en charge. Pas de preuve de capacité multi-utilisateur |
| Humain impliqué dans les décisions concernant les personnes (pp. 3–4) | L’organisateur approuve avec raison ; seul le recruteur note ; aucune note IA | Les rôles locaux ne sont pas des permissions. Un futur service devra imposer ces permissions côté serveur |
| Données synthétiques, minimisation, transparence et inclusion (pp. 3–4) | Entreprises/talents fictifs, CV non stockés, clés serveur, sources visibles, pas de critère protégé dans le calcul | Cela ne suffit pas à démontrer une conformité EU AI Act. Les données saisies librement doivent rester fictives pendant la démo |
| Liberté de technologie et de périmètre (pp. 2, 3, 5) | Next.js pour interface et routes serveur, Anthropic facultatif, Aiven prévu | Ni ESCO, ni scraping, ni fournisseur IA précis n’est imposé. Les tech challenges sont à confirmer séparément |

## Points d’attention et priorités

1. **Avant de rajouter des fonctionnalités : faire essayer le besoin à un recruteur Espoo.** Mesurer le temps, les hésitations et les composantes incomprises ; noter si les trois majeures et les exemples reflètent son poste. L’impact compte pour 45 points sur 100 dans le challenge, l’UX pour 35. Ce sont des critères du jury, pas des scores du produit.
2. **Valider le rôle de l’organisateur sur une rencontre concrète.** Montrer NordChip/Amira, une égalité et un talent sans suggestion. Vérifier que les raisons permettent une décision utile, sans exclusion invisible. L’absence de nationalité/langue dans le calcul ne démontre pas à elle seule l’absence de biais.
3. **Tester réellement Claude avec des cas fictifs une fois la clé configurée.** Comparer exemples manuels et propositions sur plusieurs métiers/niveaux, vérifier chaque citation, erreur et refus. Les tests actuels contrôlent le protocole et les garde-fous avec des réponses simulées, pas la qualité du modèle.
4. **Garder le sas facultatif pour la démo ; valider sa présentation avant l’authentification réelle.** Le code affiché `123456` et les adresses `example.test` ne sont que des accessoires de maquette. Aucune adresse personnelle n’est demandée ou conservée. Une vraie connexion implique emails, sessions, invitations organisateur et permissions, en plus du stockage partagé.
5. **Limiter honnêtement la promesse des exercices.** Les six composantes prévues en ligne et les vingt compétences techniques ont maintenant trois variantes chacune. Leur qualité reste à tester avec des recruteurs ; le programme sélectionné reste limité à vingt minutes. Confirmer avec un recruteur les budgets de 20 minutes en ligne et 10 sur place.
6. **Avant un usage réel : valider hébergement, accès concurrents, protection des données et responsabilités.** Les limites d’appel actuelles sont en mémoire du processus ; ce n’est pas une protection de coût par compte sur un service distribué. Ne pas publier avec une clé facturable sans cadrer l’accès. Le contrôle d’accès et les limites distribuées restent hors de cette livraison. Le dernier suivi ajoute une recommandation de note dans la réponse Anthropic, sans droit d’écrire une observation.

## Tensions signalées, sans décisions implicites

- **Collecte entreprise / données fictives :** Nicolas a autorisé un adaptateur Context.dev pour le contexte entreprise. La démo du challenge reste synthétique. Utiliser les exemples fictifs et les réponses simulées pour le jury ; une collecte réelle est un test d’intégration distinct, qui ne vaut pas autorisation de recruter de vraies personnes. Aucune collecte réelle n’a été faite ici.
- **Cadre Centrale / pertinence Espoo :** conserver les 12 actions conformément à la décision de Nicolas. Si le test terrain signale une composante inadaptée, lui proposer des options avant de changer le référentiel ou les seuils.
- **Rôle organisateur / conversations :** `/conversations` est actuellement une page de préparation recruteur, également accessible depuis l’organisateur. Le bandeau y indique donc Recruiter ; ce n’est pas un espace organisateur sécurisé. À reconsidérer avec les vraies permissions, sans modifier la logique métier dans cette passe.
- **Informations événementielles :** le PDF capture la plateforme en novembre 2026 mais conserve une mention « Junction 2025 » dans la présentation d’Espoo. Le cadrage reste la référence projet ; l’heure de rendu, le pitch et l’année effective du challenge ne sont pas déduits de ce pied de page. Confirmer ces informations avec l’organisation.

## Lecture de la livraison

Le sas et les accueils sont testables localement ; l’authentification est simulée. Les parcours métier, la démo préremplie automatique, les exercices à durée limitée, l’approbation humaine et les observations fonctionnent dans un même navigateur. Le minuteur local n’est pas un dispositif de surveillance ; la recommandation montrée dans `/tour` est explicitement préécrite, pas un appel Claude réel. Les appels réels Claude, l’usage entre plusieurs appareils, la charge événementielle et le déploiement restent à réaliser. Les validations de cette livraison sont consignées dans [VALIDATION.md](VALIDATION.md).
