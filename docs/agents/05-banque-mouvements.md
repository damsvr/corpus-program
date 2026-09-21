# Banque de mouvements — source : « Une base de mouvements.pages »

> Nettoyage et mise en forme du document original (7 pages, 4 colonnes
> `CROSSFIT / HYBRID / FF / Mobility` + sections spéciales). Le contenu est
> **celui que tu as fourni** ; je n'ai rien ajouté, seulement organisé et
> corrigé les artefacts d'export (ligatures type "oﬀset"→"offset"). Quelques
> termes ambigus sont signalés en fin de document — à confirmer.

Ce référentiel comble le manque identifié dans l'analyse initiale (section 7,
point 2) : sans lui, les agents inventaient des noms de mouvements. Il est
maintenant référencé par les 3 fiches agents (`02/03/04-agent-*.md`).

---

## Comment lire ce référentiel, avec l'architecture Corpus Program

Les 4 colonnes du document original correspondent assez naturellement aux 3
couches de réservoir (`Noyau / Équivalents / Ouverture`, doc source p.9) et au
partenaire de combinaison (souffle vs contrôle, doc source p.10) :

| Colonne source | Rôle dans Corpus Program |
|---|---|
| **CROSSFIT** | Noyau CrossFit (barre, gym) — utilisable tel quel en profil CrossFit. En Hybrid/FF : uniquement les variantes **strictes**, sans olympique à la barre ni gym avec élan (cf. règles cardinales de chaque profil). |
| **HYBRID** | Équivalents "coût de souffle" — implements, déplacements chargés, machines. Noyau du slot Force-Endurance & Implements. Partenaire de combinaison type Hybrid. |
| **FF** | Équivalents "coût de contrôle" — landmine, kettlebell unilatéral, tempo. Partenaire de combinaison type Functional. Cœur des Blocs Intensité/Équilibre FF. |
| **Mobility** | Substrat permanent (mobilisation) + fermeture. Commun aux 3 profils, à piocher dans l'ouverture (mobilisation) et en complément de la fermeture core. |

Deux notes du document original confirment ce fonctionnement croisé :
- *« Tous les exercices de FF pour les blocs de renforcement musculaire du programme »*
- *« Tous les exercices de Hybrid pour le renforcement musculaire et/ou les WODs »*
- *« Tous les exercices que l'on retrouve en CrossFit sauf la gym complexe et l'haltérophilie à la barre »* — c'est la formulation exacte de la règle FF6 (mouvements exigeants) et de la règle H1/H2 (Hybrid) déjà codées dans les agents.

---

## 1. Poussée haute / verticale (HSPU, Z-press…)

| CrossFit | Hybrid | FF | Mobility |
|---|---|---|---|
| HSPU, pike push-up (pieds sur banc), down dog to up dog, DB Z-press, tempo, hold, négatif, ring push-up, offset KB push-up | *Idem CrossFit* (pour deadlift, squat, press, pull-up, push-up, bench — note globale du document) | Landmine : Z-press, cossack, single leg RDL, rotational clean to press, pallof press, split stance row, snatch | Squat rotations, 90/90s, frog to external rotation, pigeon drops, lunges push-outs, hip flexor lift-offs, knee twist |

## 2. Hinge / Deadlift

| CrossFit | Hybrid | FF | Mobility |
|---|---|---|---|
| Deadlift : conventional, sumo, trap bar, romanian, stiff leg, B-stance, banded, déficit, eccentric, sandbag | Sled push, pull, drag, latéral, etc. | Plate : eternal rotation, plate full raise, plate halo, Powell raise, prone swimmer, Y-raise | Shoulder : pic prayer, sots press, weighted prone pass-through, wall angel, eccentric band pull-overhead |

## 3. Squat

| CrossFit | Hybrid | FF | Mobility |
|---|---|---|---|
| Squat : back, front, OH, split, cossack, sissy, cyclist, 1-1/4, banded, goblet, dual DB/KB, sandbag, bulgarian, split (front/rear foot elevated), tempo, box, curtsy, pistol | Sandbag : lunge, squat, carry | Kettlebell : gorilla row, chainsaw row, alternating plank row, prone row, meadows row, pullover | Unlock upper back : windmill, prayer stretch, goodmorning overhead pullover |

## 4. Press (haut du corps, poussée)

| CrossFit | Hybrid | FF | Mobility |
|---|---|---|---|
| Press : barbell, KB, DB, sots, Arnold, mix (KB+DB), Z-press, RNT banded, kneeling, half kneeling, one arm, cuban, tempo, front raise, lateral raise… | *(vide dans la source)* | Bottom-up single arm sots press, quadruped snatch, single leg plank row, half kneeling clean to pressing windmill, KB offset archer push-up, hollow body floor press | Shoulder extension ring hang, incline supine chest opener, scorpion, doorway stretch, bottom of dip stretch, banded around the world |

## 5. Pull-up / Row (tirage)

| CrossFit | Hybrid | FF | Mobility |
|---|---|---|---|
| Pull-up : (one arm), (archer), ring row, weighted, mix/neutral, large grip, bulgarian ring row, tempo, hold, negative, australian, banded, elevated foot ring row… | *(vide dans la source)* | KB halo, KB deadbug, KB hip shift, KB windmill, KB goblet squat pry, KB 90/90 | Upper body : weighted single arm hang, thoracic spine can opener, prayer stretch, shoulder extensions on rings, rhomboid stretch, prone snow angle |

## 6. Bench

| CrossFit | Hybrid | FF | Mobility |
|---|---|---|---|
| Bench : incline, decline, DB/KB, seesaw, fly… | Unilateral lower-body KB moves : cross body bulgarian split squat, cross body single leg RDL to snatch, goblet pistol, low hold cossack lunge, front rack rotational twisting reverse *(termes source condensés, à clarifier)* | Weighted elevated pigeon, weighted pull-over stretch, front foot elevated couch stretch, deep déficit push-up iso hand on yoga block, single arm passive hang, middle split iso | — |

## 7. Renforcement musculaire — notes globales

> Ces deux lignes sont des **règles de réutilisation**, pas des mouvements :
- *Tous les exercices de FF pour les blocs de renforcement musculaire du programme* → le Bloc Équilibre / Finisher FF puise dans la colonne FF entière.
- *Tous les exercices de Hybrid pour le renforcement musculaire et/ou les WODs* → le slot Force-Endurance & Implements Hybrid puise dans la colonne Hybrid entière.

## 8. Landmine, abdos, mobilité complémentaire

| CrossFit / général | Hybrid | FF | Mobility |
|---|---|---|---|
| Barbell abs landmine : standing incline chest, standing twist, kneeling press-out, overhead bar knee-up, overhead bar windmill, RDL to rotation press | Sled, sandbag, weighted vest, médecine ball, Swiss ball… | *Tous les exercices que l'on retrouve en CrossFit SAUF la gym complexe et l'haltérophilie à la barre* (règle FF6 / H1) | Child pose arm rotation, deep squat turn, kneeling hip flexor stretch, kneeling rotation (torso rear fly to thread through), low lunge twist, lying alternate straight leg circle, rocking frog stretch, seal to puppy pose stretch, standing front leg lift + cross toe touch, wide leg leaning forward stretch |

**Landmine — explosif / puissance** : rotational clean to split jerk, tall kneeling push press, clean to rotational press, goblet cossack, thruster, suitcase jump lunge.
**Plyo bas du corps** : one leg triple jump, seated box jump, box jump, box jump over, jump over box.
**Landmine — hanche/hinge** : zercher reverse lunge to knee-up, reverse lunge, RDL split stance, sumo squat, straddle deadlift, split stance thruster.

## 9. Push / Pull (registre CrossFit avancé) + Multitask

| Push (CrossFit) | Pull (CrossFit) | Multitask (Hybrid) | KB finisher (FF) |
|---|---|---|---|
| Matador/ring dip, pause dip, déficit push-up, KB offset push-up, clapping, russian push-up, sled, HS walk, wall walk… + *matador/ring dip, pull-up on one ring* | Pull-up, chest-to-bar, muscle-up, toes-to-bar, sled, rope climb… | Dual KB mix (front rack + overhead), sissy squat, dual KB front rack split squat, glute bridge bench press, Turkish get-up, dual KB clean, dual KB push-up to L-sit | Deadbug, rack march, tall kneeling halo, around the world, chop to lift, Turkish sit-up |

**CrossFit — olympique / registre technique (slot Haltérophilie / Puissance & Balistique)** :
Clean and jerk, snatch : from the floor, from the blocks, hang, high hang, complex, drop and go, touch and go.

**Row (registre large, transverse)** : bent over row, pendlay, déficit row, landmine row, lateral landmine row, support bench (seal) row, banded chainsaw row, plank DB row, power rack row *(source : "power maker", à confirmer)*, KB gorilla row, landmine meadow row, bulgarian ring row, single arm ring row, T-bar row, *(terme ambigu : "elbowing row")*, *(terme ambigu : "penally row")*, KB upright row.

**Shoulder (mobilité complémentaire)** : pic prayer, sots press, weighted prone pass-through.

## 10. Accessoires / Finisher / Core (surtout FF — Bloc Équilibre, Finisher, Fermeture)

**Barbell finisher** : rollout, leg lowering, windshield wiper.

**Lower back pain (substitutions — limitation lombaire)** : elevated front foot split squat, slow tempo goblet cyclist squat, half kneeling single arm landmine press, half kneeling cable/band row, supported B-stance single leg RDL, single arm banded farmer's *(carry, coupé dans la source)*.

**Med ball** : slam.

**Core** (→ à répartir dans les 4 familles de la fermeture core FF, doc source p.11) :
cable crunch, cable reverse squat, banded kettlebell impulse, tempo GHD, tempo hanging knee raise, 45° bench oblique raise, reverse plank mountain climber, dragon fly.
> Mapping suggéré vers les 4 familles : anti-extension → tempo GHD, dragon fly ; anti-rotation → cable reverse squat, banded KB impulse ; anti-flexion latérale → 45° bench oblique raise ; flexion/extension contrôlées → tempo hanging knee raise, cable crunch.

**Biceps** (Finisher mode couplé/autonome) : unilateral hammer preacher curl, super ROM DB incline bench curl, seated zottman curl, EZ bar reverse curl, lying rope cable hammer curl, seated cable curl, waiter's curl.

## 11. Public 40+ et limitations (prioritaire — cœur de cible du programme)

**+40 ans** (CrossFit et Hybrid — la source liste la même base pour les deux, Hybrid en sous-ensemble) :
KB swing high pull, slow tempo back-supported GHD, seated box jump with rest, assisted strict pull-up, tempo RDL, heavy suitcase cyclist squat, lean-away pull-up, burpee box jump, offset carry, knee-bent split squat, KB Arnold press (tall kneeling), mixed grip pull-up, banded pull-up, loaded elevated pigeon pulses, kneeling jumps, DB incline Y-raise, hip extension.

**Knee pain (substitutions — limitation genou)** : box step-up, tempo RDL, single leg glute bridge on box, assisted step-back lunges, Copenhagen side plank, sled push or drag.

**Hip opener / mobilité complémentaire** : 90/90 hip opener, hip hurdles, pigeon push-up, assisted squat and reach, loaded pigeon.

**KB core** (FF) : cross body march, suitcase deadlift, single arm rack tall kneel-to-stand, lateral swing, iso banded curl march, impulse hold.

**Registre gym additionnel (accessoire, transverse)** : ring archer pull-up, cable/band chop, side bend, body saw, GHD, bench oblique raise.

## 12. Chest / KB leg / Calf / Delt & trap

| Chest moves | KB leg | Calf gain | Delt & trap |
|---|---|---|---|
| Incline bench press, guillotine press, angled forward dips, low-to-high standing cable fly, pull cable chest fly, déficit pause push-ups wide elbows | Goblet cyclist squat, toes elevated RDL, cossack clean, bulgarian squat, dual KB déficit sumo squat, suitcase jump lunge | Smith bilateral, single leg DB hang supported, leg press calves, seated bottom half partial, belt donkey calf raise *(source : "dinkey", corrigé)*, squatting calf raise | Kelso shrug, rear delt swing, incline dumbbell lateral raise, lying cable throat pulls, smith upright row, bradford press |

## 13. Exemples de formats (illustrent le "moteur anti-monotonie" en pratique)

> Ces deux blocs ne sont pas une banque de mouvements mais des **exemples de
> WOD/finisher déjà écrits** dans le style du document — utiles comme gabarits
> de formats pour les agents Hybrid/FF.

**Exemple "Pump condition workout"** (style Hybrid/FF, format par sets) :
> 3–5 sets de : 10/côté DB goblet tall kneeling to stand, 10 burpees, 10/côté noble cossack squat, 12–15 cal bike — repos 1–2 min entre les sets.

**Exemple "Functional bodybuilding"** (style FF, format EMOM/rounds) :
> 8 rounds de : 6–8 ring push-up, 6/côté alt DB power clean and press, 40/40 double-unders ou single-unders — repos 60 s entre les rounds.

## 14. Complément — page 7 (mix mobilité / gym avancée / KB conditioning)

**Landmine / hanche (mobilité-force)** : offset split stance banded KB, hip flexor banded resistance, switch snatch, clean to rotational press, forward lunge split snatch, leg *(coupé dans la source)*.

**Core avancé (registre CrossFit/gym, accessoire)** : one arm Turkish sit-up, OH walking lunge, L-sit, 45° oblique raise, ring body saw, hanging leg raise, (DB one leg) V-up, side-to-side in-and-out, press in Russian twist, plank toe touch, KB plank pull-out.

**Mobilité hanche (FF)** : Patrick step, Copenhagen plank, lateral band walk, forefoot split squat isometric, single leg RDL.

**KB conditioning (FF)** : KB hamstring march, front rack carry, goblet curtsy lunge, plank KB pull-through.

**Divers** : Swiss ball *(entrée isolée, incomplète dans la source)*.

---

## Termes à confirmer (OCR / notes personnelles ambiguës)

Ces quelques entrées sont retranscrites telles quelles mais méritent une
relecture de ta part avant intégration dans les prompts :
- **« power maker »** (section Row) — probablement "power rack row" ou un nom de mouvement spécifique à confirmer.
- **« elbowing row »** / **« penally row »** (section Row) — orthographe probablement altérée à l'export ; sens exact à préciser.
- **« Russian twit »** → corrigé en *Russian twist*.
- **« dinkey calf raise »** → corrigé en *donkey calf raise*.
- **« root rack »** (section Bench/Unilateral) → probablement *front rack*.
- Quelques cellules sont coupées en fin de page dans le document original (ex. « single arm banded farmer's », « leg » en fin de liste page 7) — contenu tronqué à la source, pas une erreur de ma part.

---

## Ce que ce référentiel NE couvre PAS encore

- **Aucun tagging palier de matériel** (salle complète / minimaliste / déplacement) — la plupart des mouvements Hybrid/FF sont déjà compatibles "minimaliste" (KB, DB, sac de sable, bande, landmine), les mouvements CrossFit slot Haltéro/Gym demandent la salle complète. À formaliser si tu veux un vrai filtre par palier dans l'app.
- **Aucune charge de référence / %1RM** — logique, ce n'est pas l'objet de cette banque.
- **Pas de mapping explicite Noyau/Équivalents/Ouverture par mouvement individuel** — le document original raisonne par colonne (source) plutôt que par mouvement ; les agents appliquent la correspondance colonne→couche décrite en tête de ce fichier.
