# Analyse — « Corpus Program : Architecture du système et des trois profils »

*SD Coaching · Document de référence v1 · 14 pages*

> **Mise à jour (19/09/2026)** — Le doc « Les trois profils » (voir `06-analyse-positionnement-3-profils.md`) renomme les profils **Hybrid** (ex-Hybrid Racing) et **Functional** (ex-Fitness Fonctionnel) et **prime** sur ce document d'architecture là où ils divergent (format Functional en modules de 20 min, durées CrossFit 70–86 min, volume ≈ 300 min/semaine). Cette analyse décrit le doc d'architecture d'origine ; les agents (`02/03/04`) suivent la version à jour.

---

## 1. Nature du document

Ce n'est **pas** une programmation. C'est le **cadre structurel** — le squelette — à
l'intérieur duquel les blocs et les séances seront écrits. Le document le dit
explicitement : il ne contient volontairement aucun mouvement ni aucun WOD. Il
définit des **contraintes de conception** et un **vocabulaire**.

Conséquence directe pour ton app : les agents IA ne doivent pas « inventer un
programme ». Ils doivent **remplir une trame imposée** en respectant un jeu de
règles dures. C'est un problème de génération sous contraintes, pas de créativité
libre.

---

## 2. Le système en une phrase

> Développer **toutes les qualités physiques en parallèle**, chaque semaine, dans
> une **enveloppe de temps maîtrisée** (≤ 90 min), avec une **variété structurelle
> permanente** et une **qualité d'exécution qui prime toujours sur la charge**.

### Public cible
Athlètes **40+**, souvent parents, temps contraint. Trois besoins ignorés par les
programmes standards : préparation articulaire sérieuse, contrôle strict du
volume, progression qui ne sacrifie jamais l'intégrité physique.

### Les 3 principes fondateurs
| Principe | Ce que ça impose |
|---|---|
| **Progression parallèle** | Aucune qualité laissée de côté plus de 7 jours. Pas de cycles « force 6 semaines puis endurance 6 semaines ». |
| **Variété structurelle** | Ce n'est pas que le mouvement qui change d'une semaine à l'autre — c'est **la structure de la séance** : format, durée, logique de l'effort. |
| **Qualité avant charge** | Toute progression (plus lourd / plus rapide / plus complexe) est **conditionnée à un gate** de qualité d'exécution. Jamais contourné. |

---

## 3. Architecture commune aux 3 profils

Les trois profils partagent le **même squelette**. Un athlète passe de l'un à
l'autre sans changer de repères ; l'entraîneur raisonne une seule fois pour trois
programmes.

### 3.1 Substrat permanent
Présent **à chaque séance**, jamais cyclé, jamais retiré :
travail structurel et de prévention (coiffe des rotateurs, ceinture scapulaire,
chaîne postérieure, gainage, unilatéral) + mobilité adaptée aux limitations de
l'athlète + échauffement.

### 3.2 Les 4 slots hebdomadaires
4 séances/semaine, une par qualité. Le slot est le **même d'un profil à l'autre** ;
c'est son **contenu** qui change.

| Slot | CrossFit | Hybrid Racing | Fitness Fonctionnel |
|---|---|---|---|
| 1 | Force & Musculation | Force (bas du corps dominant) | Force & Structure |
| 2 | Haltérophilie | Force-Endurance & Implements | Puissance & Balistique |
| 3 | Gymnastique | Gymnastique & Haut du corps | Gymnastique & Contrôle |
| 4 | Endurance | Cardio / Race | Capacité de travail |

### 3.3 Ouverture de séance — protocole en 3 temps
`Mobilisation → Activation → Intégration`
(rendre disponibles les amplitudes → réveiller les stabilisateurs/producteurs de
force → réunir les deux dans un mouvement global proche de la séance).
**Chez un public 40+, ce n'est pas décoratif** : ça conditionne la qualité de tout
ce qui suit et c'est une part importante de la valeur du programme.

### 3.4 Rythme des blocs
Un **bloc de programmation** = 5–6 semaines. Les trois profils restent **calés sur
6 semaines calendaires** (calendrier commun pour plusieurs athlètes).

| Profil | Structure du bloc | Ce qui progresse | Repère de fin de bloc |
|---|---|---|---|
| CrossFit | 5 chargées + 1 deload | La **charge** | Benchmark chronométré ou charge de référence |
| Hybrid | 4 chargées + 1 **réalisation** + 1 deload | La **densité**, les transitions, la spécificité | Simulation de course complète |
| Fitness Fonctionnel | 5 chargées + 1 deload | La **contrainte de contrôle** | Qualité tenue : répétitions à tempo, symétrie |

Hybrid a un rythme différent parce qu'il est adossé à des **échéances de
compétition** — il lui faut une semaine de réalisation distincte avant le deload.

---

## 4. Les 3 profils en détail

### 4.1 CrossFit — le profil de référence
- **Pour qui** : pratiquant CrossFit qui veut progresser en force pure, haltéro, gymnastique.
- **Technicité élevée** — seul profil exposant aux mouvements olympiques et à la gym de haut niveau.
- **WOD 8–20 min**, formats très variés. Enveloppe séance ≈ 90 min.
- **Séance de force en 3 temps** : mouvement principal → variantes + renforcement spécifique → stabilisation du tronc. (Choix de conception : produit un athlète plus complet qu'une progression sur mouvement isolé.)
- **Règles cardinales** :
  - Aucun mouvement d'haltérophilie dans le WOD de la séance d'haltérophilie (règle la plus stricte du système).
  - Aucun mouvement de poussée dans le WOD les jours où la gymnastique travaille la poussée.
  - Le WOD d'haltéro est placé **avant** les blocs de force (système nerveux frais).
  - 4 formats de WOD structurellement différents/semaine ; aucun format répété > 2 fois de suite sur un même slot.
- **Alternance entre blocs** : Force `Squat → Hinge → Poussée → Tirage` · Haltéro `Arraché ↔ Épaulé-jeté` · Gym `Poussée ↔ Tirage` · Endurance `Course / Rameur / Vélo / Ski`.

### 4.2 Hybrid Racing — la course hybride
- **Référentiel** : Hyrox, TYRUN, ATHX. Épreuves 1 h – 1 h 30 alternant segments cardio et stations de force.
- **Ce que la course exige** : efforts longs (WODs ≥ 30 min sur le slot dédié), mouvements simples dans les deux registres (traîneau, portés, swings, fentes). **Pas d'haltérophilie, sur aucun slot** — c'est la différence structurelle avec CrossFit.
- **TYRUN** = course saisonnière (distances/charges/exercices changent chaque saison) → on ne programme pas vers un format figé ; la variété structurelle de Corpus est précisément ce qui rend l'athlète adaptable.

| Slot | Contenu | Durée WOD |
|---|---|---|
| Force | Mouvement lourd bas du corps dominant (maintenu tout le bloc), variantes, stabilisation tronc | 12–18 min |
| Force-Endurance & Implements | Remplace intégralement l'haltéro : traîneau poussé/tiré, portés lourds, sacs de sable, KB, wall balls | 12–18 min |
| Gymnastique & Haut du corps | Porteur principal du haut du corps : tirage + poussée en bloc principal, puis capacité de répétition | 25–30 min |
| Cardio / Race | Rotation course / rameur / ski / vélo — pièce longue de la semaine | 35–45 min |

- **Règles propres** :
  - Gym de haut niveau (muscle-up, corde sans jambes, HSPU avec élan) **hors des WODs** : en progression, jamais en volume sous fatigue.
  - **Format signature réservé au profil** : couplet machine + station de force, avec course entre les segments (calque du format TYRUN).
  - **Anti-interférence** : jamais Force et Implements consécutifs ; jamais Cardio et Implements consécutifs. 3 des 4 séances sollicitent lourdement les jambes.
  - **Ordre de semaine recommandé** : Force → Gym & Haut du corps → Cardio/Race → Implements, avec un jour de repos entre Gym et Cardio, et entre Cardio et Implements.
- **Durées WOD sur la semaine** : 1 longue, 1 moyenne, 2 courtes.

### 4.3 Fitness Fonctionnel — la mise à niveau générale
- **À la croisée** CrossFit / musculation / course hybride. Finalité : capacité physique complète et intégrité.
- **Pour qui** : reprise du sport, retour de blessure, reconstruction.
- **Ce qu'on mesure** : qualité d'exécution (tempo, amplitude, contrôle, symétrie).
- **Technicité basse** — le contrôle précède la complexité. Les mouvements complexes ne sont **pas interdits, ils sont conditionnés**.
- **WOD 10–18 min**. Dense mais court.
- **Différence clé avec Hybrid** — le *partenaire de combinaison* : en Hybrid il **coûte du souffle** (machine, déplacement, effort cyclique) ; en Fitness Fonctionnel il **coûte du contrôle** (tempo, isométrie, unilatéral, exercice analytique). Même mouvement, même format, deux programmes différents.

**Structure de séance** (format long = défaut ; format court = option, pas norme) :

| Bloc | Rôle | Long | Court |
|---|---|---|---|
| Ouverture | Préparation articulaire élargie | 12–15 min | 12 min |
| Bloc Intensité | Travail principal, par intervalles | 25 min | 22 min |
| Bloc Équilibre | Renforcement / développement musculaire, à tempo | 25 min | 15 min |
| Finisher | Couplet ou échelle sur petits groupes | 12 min | *retiré* |
| Fermeture | Gainage, core, stabilisation du tronc | 10 min | 8 min |
| **Total** | | **≈ 85 min** | **≈ 57 min** |

**Règle de compression** : le format court n'est pas le format long amputé de sa
fin. Jamais coupés = ouverture élargie + Bloc Intensité + fermeture core
(signature du profil). Le Bloc Équilibre est compressé en gardant sa paire
principale. Le Finisher est le premier retiré.

**Progression sur le bloc** — la variable qui progresse est la **contrainte de
contrôle**, ni la charge ni la densité :

| Sem | Nom | Contenu |
|---|---|---|
| S1 | Installation | Tempos annoncés, amplitudes complètes, charges sous-maximales. On pose la référence de qualité. |
| S2 | Accumulation | Volume en hausse, tempo inchangé. |
| S3 | Chargement | Tempo légèrement allégé, charge en hausse. Première exposition aux complexes longs. |
| S4 | Contrainte | Tempo re-durci sur charge maintenue, **ou** amplitude accentuée. Semaine la plus exigeante. |
| S5 | Réalisation | Volume accessoire réduit ≈ 25 %. Chaque séance produit un repère mesurable. |
| S6 | Deload | — |

**Mouvements exigeants — conservés sous condition** (le profil change leur
*contexte d'exposition*, il ne les retire pas) :
- *Box jump haut* : athlète frais, jamais en fin de WOD, volume bas, repos complets.
- *Charge au-dessus de la tête sous fatigue* : formats à repos structuré, charge modérée, séries courtes, pause/tempo.
- *Haltérophilie à la barre* : hors WOD, remplacée par du balistique haltères/KB.
- *Gymnastique avec élan* : exclue, remplacée par versions strictes + progressions à tempo.
- Principe : **la fatigue est dosée, pas subie**. L'athlète se fatigue mais ne perd jamais sa position.

**Fermeture core** — 4 familles, une dominante/semaine, les 4 couvertes sur le
bloc ; la famille retenue complète ce que la séance du jour n'a pas sollicité :
anti-extension · anti-rotation · anti-flexion latérale · flexion/extension
contrôlées.

**Développement musculaire par groupe** (porté par Bloc Équilibre + Finisher —
c'est ce qui rapproche le profil de la musculation) :
- 1 dominante musculaire/séance, **fixe sur les 5 semaines du bloc**, change au bloc suivant.

| Slot | Bloc 1 | Bloc 2 | Bloc 3 |
|---|---|---|---|
| Force & Structure | Pectoraux | Épaules | Dos |
| Puissance & Balistique | Dos | Pectoraux | Jambes |
| Gymnastique & Contrôle | Jambes | Dos | Épaules |
| Capacité de travail | Épaules | Jambes | Pectoraux |

  - Contraintes : les épaules **jamais** sur Puissance & Balistique (déjà lourdement sollicitées). Les jambes sur Capacité de travail **seulement** en unilatéral et contrôle, jamais bilatéral chargé.
  - Bloc 4 : le cycle reprend avec l'**angle dominant inversé** (pecs plat → incliné, dos horizontal → vertical, jambes quadri → chaîne postérieure). Cycle complet = **6 blocs ≈ 9 mois**.
  - Variation intra-bloc : groupe + pattern **fixes** sur 5 semaines ; **la variante change chaque semaine**. La variante de S5 = celle de S1 (seul point de mesure fiable). **Une seule variable change** entre deux semaines consécutives (l'angle **ou** la contrainte, jamais les deux).
  - **Finisher** — mode *couplé* (triceps/pecs, biceps/dos, mollets/jambes, delt post ou avant-bras/épaules) ou mode *autonome* (biceps + triceps en superset, sur séances dont le groupe majeur = jambes ou épaules). Semaine type : 2 couplés, 1–2 autonomes.
  - **Garde-fous anti-« split muscu + cardio à côté »** : le groupe est un *objectif*, pas un format ; Bloc Équilibre en superset serré avec tempo, jamais séries isolées ; la grammaire des complexes s'applique ; unilatéral présent dans **chaque** Bloc Équilibre.

---

## 5. Les mécanismes transverses (le cœur du moteur pour les agents)

### 5.1 Réservoirs de mouvements — 3 couches
| Couche | Définition | Rôle |
|---|---|---|
| **Noyau** | Les mouvements du référentiel : ceux qui apparaissent réellement en compétition, ou qui fondent la discipline. | Garantir le transfert vers l'objectif. |
| **Équivalents** | Même contrainte mécanique et physiologique, objet ou modalité différente. | Casser le stéréotype sans perdre le transfert. Robustesse, adaptabilité. |
| **Ouverture** | Mouvements hors référentiel, empruntés au CrossFit ou à la musculation. | Complétude de l'athlète, entretien de l'intérêt. |

**Couche des équivalents en pratique** — question : *quelle contrainte ce
mouvement impose-t-il, et par quoi d'autre puis-je l'imposer ?*

| Noyau | Contrainte réelle | Équivalents |
|---|---|---|
| Farmer carry | Porter lourd, tronc sous charge, préhension | D-ball bearhug carry, yoke, sac de sable en porté frontal, porté par pincement de disques |
| Traîneau poussé | Extension de hanche contre résistance, position penchée | Prowler, vélo résisté, montée en côte lestée |
| Wall ball | Squat + projection, effort cyclique | D-ball squat-to-shoulder, sac de sable épaulé, thruster léger |
| Fentes chargées | Unilatéral sous charge, amplitude de hanche | Fentes sac de sable, step-up chargé, fentes en déficit |
| Rameur | Tirage cyclique, chaîne postérieure | Ski, vélo, tirage horizontal en séries longues |

**Règle d'usage** : ≥ 1 mouvement issu des équivalents **par séance**. Sur un bloc
de 5 semaines, un même mouvement du noyau n'apparaît **pas plus de 2 fois à
l'identique** — son équivalent prend le relais.

**Dosage selon le profil** :
- *Hybrid* — hors échéance : noyau et équivalents à parts comparables, ouverture significative. À l'approche d'une échéance : le noyau reprend le dessus sur les 4 dernières semaines, l'ouverture se réduit.
- *Fitness Fonctionnel* — équivalents et ouverture largement dominants (le référentiel n'est pas une compétition).
- *CrossFit* — les trois couches en permanence, l'ouverture étant déjà large par nature.

### 5.2 Grammaire des complexes
Dans **Hybrid et Fitness Fonctionnel**, le complexe est l'unité de travail par
défaut. Le mouvement isolé reste réservé au bloc de force lourde.

Les **5 structures** :
1. **Même objet enchaîné** — plusieurs mouvements avec la même charge, sans la reposer (ex. épaulé + squat avant + développé).
2. **Pattern + analytique** — un mouvement global suivi de l'exercice qui isole son maillon faible (ex. goblet squat + fente bulgare à tempo).
3. **Pattern + antagoniste** — un tirage suivi d'une poussée, ou l'inverse.
4. **Contraste tension / vitesse** — une version lente et lourde, puis une version explosive du même pattern.
5. **Dégressif** — le même mouvement, charge ou amplitude qui décroît au fil des séries.

**Règle de rotation** : pas plus de 2 structures consécutives identiques sur un
même slot. Sur un bloc de 5 semaines, ≥ 3 des 5 structures doivent apparaître.

**Le choix du partenaire = là où le profil s'exprime** :

| | Hybrid | Fitness Fonctionnel |
|---|---|---|
| Partenaire type | Machine, déplacement, effort cyclique, station | Tempo, isométrie, unilatéral, renforcement analytique |
| Ce qu'il ajoute | Intensité, dette d'oxygène | Tension, temps sous contrainte, stabilité |
| Ce qu'on observe | Maintien du **rythme** sous fatigue | Maintien de la **qualité** sous fatigue |
| Ex. (arraché haltère) | + rameur + navette | + développé Z à tempo + gainage hollow |

### 5.3 Moteur anti-monotonie — contraintes **dures** (les 3 profils, en permanence)

**Rotation**
- Aucun mouvement signature répété sur une **fenêtre glissante de 3 semaines**.
- Aucun format de WOD répété **> 2 fois consécutivement** sur un même slot.
- **4 formats de WOD structurellement différents par semaine** — différents dans leur logique, pas seulement dans leurs mouvements.
- ≥ 1 mouvement de la couche des équivalents par séance.
- Bloc principal **fixe** sur la durée d'un bloc ; les accessoires tournent sur une fenêtre de 3 semaines.

**Anti-interférence**
- Jamais de chaîne postérieure lourde combinée à du cyclage de barre glycolytique dans la même séance.
- Jamais deux séances neurologiquement ou métaboliquement concurrentes placées consécutivement.
- Le WOD ne détruit pas ce que le bloc principal vient de construire (→ pas de poussée en WOD les jours de poussée en gym ; pas d'haltéro en WOD les jours d'haltéro).

**Enveloppe de temps**
- Plafond **90 min** par séance, tous profils.
- Une **version courte** disponible pour chaque séance, budget de temps défini bloc par bloc.
- Si le bloc principal vise des intensités élevées : une montée en charge progressive s'intercale entre l'échauffement et la première série de travail ; la mobilité générale se compresse pour préserver l'enveloppe.

**Progression conditionnelle (gates)**
- Les progressions vers le lourd / rapide / complexe ne s'appliquent **pas automatiquement** à la semaine suivante.
- Critère de qualité vérifié sur l'exécution réelle. Deux axes indépendants :
  - balistique → mobilité **et** vitesse ;
  - gymnastique → force et contrôle d'une part, technique et coordination d'autre part.
- Tant qu'un critère n'est pas validé, l'athlète reste sur la version précédente. **Sans exception.**

---

## 6. Synthèse comparative (p. 14)

| | CrossFit | Hybrid Racing | Fitness Fonctionnel |
|---|---|---|---|
| Référentiel | CrossFit | Hyrox, TYRUN, ATHX | Aucun — mise à niveau générale |
| Finalité | Compétence et intensité | Performance en course | Capacité physique et intégrité |
| Unité de mesure | Charge, temps, compétence | Distance, allure, temps de passage | Qualité d'exécution, tempo, contrôle |
| Technicité | Élevée | Basse | Basse (contrôle avant complexité) |
| Unité de travail | Mouvement + WOD varié | Complexe | Complexe |
| Partenaire de combinaison | Variable | Machine, déplacement, cyclique | Contrôle, tempo, unilatéral |
| Durée des WODs | 8–20 min | 1 longue / 1 moyenne / 2 courtes par semaine | 10–18 min |
| Enveloppe de séance | ≈ 90 min | 75–90 min | ≈ 85 min (option 57 min) |
| Structure du bloc | 5 + 1 | 4 + 1 + 1 | 5 + 1 |
| Haltérophilie | Slot dédié | Interdite partout | Hors WOD, remplacée par balistique |
| Dév. musculaire par groupe | Non | Non | Oui (Bloc Équilibre + Finisher) |
| Règle cardinale | Le WOD ne détruit pas le bloc principal | Simplicité de mouvement, spécificité de course | La fatigue est dosée, pas subie |

---

## 7. Ce que le document laisse ouvert (à cadrer avant / pendant la construction des agents)

Le document lui-même liste ce qui reste à construire :
1. **La trame détaillée des semaines**, profil par profil et slot par slot. → *C'est le livrable des agents.*
2. **Le système de paliers de matériel** : salle complète · matériel minimaliste · mode déplacement. → *À définir : les agents doivent recevoir le palier en entrée et adapter la sélection de mouvements.*
3. **L'articulation entre blocs successifs** sur le moyen terme (rotation Force `Squat→Hinge→Poussée→Tirage`, cycle musculaire 6 blocs pour Fitness Fonctionnel, etc.). → *À gérer via un état persistant « historique des blocs ».*

**Autres angles morts à trancher pour l'implémentation :**
- **Format de données de ton app** — les agents produisent du JSON ; il faut mapper ce JSON sur ton modèle (séances, exercices, séries, tempo, notes). *Schéma proposé dans `01-schema-sortie-commun.md`, à ajuster.*
- **Bibliothèque de mouvements** — les agents ont besoin d'un référentiel (noyau/équivalents/ouverture) par profil et par palier de matériel. Sans ça, ils hallucineront des noms. → *Prévoir une base de mouvements que l'agent consulte, ou l'embarquer dans le prompt.*
- **Gestion de l'état / mémoire** — l'anti-monotonie (fenêtre 3 semaines), les gates, la position dans le cycle des blocs : l'agent doit recevoir cet historique en entrée à chaque génération. *Contrat d'entrée défini dans chaque fiche agent.*
- **Nombre de jours réels** — 4 slots = 4 séances ; l'ordre et les jours de repos sont partiellement imposés (Hybrid surtout). L'app doit fournir les jours disponibles.
- **Individualisation** — « mobilité adaptée aux limitations propres à l'athlète » suppose un profil de contraintes/blessures par utilisateur en entrée.

---

## 8. Implications pour la conception des agents

1. **Un agent par profil** (demandé). Chaque agent est autonome : il embarque le tronc commun + ses spécificités. Voir `02/03/04-agent-*.md`.
2. **Rôle de l'agent** = *remplir une trame sous contraintes*, pas créer librement. Sa sortie doit être **vérifiable** contre une checklist (fournie dans chaque fiche).
3. **Entrée standardisée** : profil, palier de matériel, position dans le bloc (n° de bloc + n° de semaine), historique 3 semaines (mouvements signature + formats WOD par slot), résultats des gates de la semaine précédente, contraintes individuelles, jours disponibles, échéance éventuelle (Hybrid).
4. **Sortie standardisée** : JSON structuré (semaine complète : 4 séances, chaque séance = ouverture 3 temps + 3–5 blocs de séance + WOD + substrat permanent + gates), plus un bloc `controles_anti_monotonie` qui **prouve** le respect des règles.
5. **Auto-vérification obligatoire** avant de rendre : chaque agent termine par une passe de contrôle explicite sur le moteur anti-monotonie et les règles propres au profil.
6. **Deux modes** : `semaine` (génère 1 semaine) et `bloc` (génère les 5–6 semaines d'un coup, avec la cohérence de progression intra-bloc garantie).
