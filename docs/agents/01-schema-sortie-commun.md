# Schéma de sortie commun aux 3 agents

> **v2 — calibré sur l'app réelle** (ds-workouts.lovable.app, connexion du
> 17/09/2026, données "Week 05" du programme *CrossFit / Hybrid Baseline*).
> L'app exprime déjà les séances dans un format texte-libre par bloc, très
> proche de l'architecture du document Corpus Program. Ce schéma colle à ce
> format observé plutôt qu'à une structure numérique rigide inventée.
>
> Deux couches distinctes dans la sortie :
> 1. **`seance`** — ce qui correspond 1:1 à ce que l'app affiche/stocke
>    (blocs nommés, exercices en notation libre, notes de gate/marqueur en texte).
> 2. **`controles_anti_monotonie`** — métadonnées de génération, pour la QA de
>    l'agent. Rien n'indique aujourd'hui que l'app les persiste ; à toi de
>    décider si tu veux les stocker (ex. champ `notes_internes` sur la séance)
>    ou les jeter après vérification.

---

## Ce qui a été observé dans l'app (référence)

- **Semaines et jours** : un programme (`CROSSFIT / HYBRID BASELINE` actuellement)
  contient plusieurs semaines (`Week 01`, `Week 02`, `Week 05`…), chacune avec
  des jours (`JOUR 1`…`JOUR 4`). Bouton `DUPLIQUER` pour dupliquer une semaine.
- **Séance** = un titre (`HALTÉROPHILIE — SNATCH`, `FORCE — DEADLIFT`,
  `ENDURANCE — 2K ROW TT`…) + une suite de **blocs nommés en texte libre**,
  observés sur Week 05 :
  `ÉCHAUFFEMENT DYNAMIQUE (10')` → `MOBILITÉ CIBLÉE (6-7')` →
  `MONTÉE EN CHARGE (6')` → `WOD — CORPUS xxxxxx` / `BLOC A — … RÉALISATION (20')`
  → `BLOC B (10')` → `BLOC C (6')` → `COMPLÉMENTAIRE (8')`.
  (Le nom, l'ordre et le nombre de blocs varient par séance — rien n'est un enum figé.)
- **Exercice** = une ligne `nom` + notation `sets×reps` (ou `sets×durée`) +
  `charge` + `repos` optionnel, ex. :
  `Snatch — singles lourds (piste 1)` · `6×1` · `87-90% TM` · `R 2-3'`
  `Corde à sauter facile` · `1×30''`
  `Shoulder press` · `5×4` · `30-35 KG`
- **Charge exprimée en** : `% TM` (training max, calculé depuis les PR du
  profil), `% PDC` (poids de corps), kg absolus, ou qualitatif
  (`LÉGÈRE` / `MODÉRÉE` / `TRÈS LÉGÈRE`), ou `BARRE À VIDE` / `PVC` / `BW`.
- **Notes en texte libre**, deux conventions observées par préfixe :
  `GATE : …` (condition qui bifurque la séance, ex. "si le 80-85% de S4 est
  passé propre → singles lourds. Sinon → doubles à 80% max.") et
  `MARQUEUR : …` (repère à noter par l'athlète, ex. "charge max PROPRE. Arrêt
  à la première tentative dégradée."). Aucun champ structuré séparé détecté :
  c'est du texte attaché au bloc ou à l'exercice.
- **WOD** : le bloc WOD a un intitulé (`WOD — CORPUS 130319`, `WOD — BARRAZA
  RÉVISÉ`) et une ligne d'en-tête qui décrit le format et le scoring, ex. :
  `AMRAP 14' — score = rounds + reps`, `Every 2:00 x 5 rounds (10') — le reste
  du 2:00 = récupération, jamais de sprint`, `For time, cap 22' — gestion du
  fractionnement, pas l'échec musculaire`.
- **Profil athlète** (onglet Profil) : PR personnels — `Arraché (snatch)`,
  `Épaulé-jeté (clean & jerk)`, `Back squat`, `Front squat`, `Soulevé de
  terre`, `Développé couché`, `Développé militaire`, `Poids de corps` (kg),
  `2000 m rameur` et `5 km course` (temps de référence mm:ss). *« Les charges
  (kg) et allures des séances sont calculées à partir de ces valeurs »* — texte
  affiché dans l'app, confirme que les agents doivent raisonner en %TM/%PDC
  plutôt qu'en kg absolus quand c'est pertinent.
- **Historique** : séances passées avec date, durée (min), volume (kg).
- Aucun appel réseau observé pendant la navigation (Week 01/02/05 semblent
  embarquées dans le bundle JS) — donc pas de schéma de base de données à
  confirmer côté back-end pour l'instant. À revérifier si/quand l'app branche
  un vrai backend.

---

## Contrat d'ENTRÉE (identique pour les 3 agents)

```json
{
  "mode": "semaine | bloc",
  "profil": "crossfit | hybrid | functional",
  "palier_materiel": "salle_complete | minimaliste | deplacement",
  "position": {
    "bloc_numero": 3,
    "semaine_dans_le_bloc": 3,
    "semaines_chargees": 5,
    "type_semaine": "chargee | realisation | deload"
  },
  "cycle_long": {
    "force_pattern_courant": "squat | hinge | poussee | tirage",
    "halterophilie_focus": "arrache | epaule_jete",
    "gym_focus": "poussee | tirage",
    "endurance_modalite": "course | rameur | velo | ski",
    "ff_groupes_par_slot": { "slot1": "pectoraux", "slot2": "dos", "slot3": "jambes", "slot4": "epaules" },
    "ff_angle_inverse": false
  },
  "echeance": {
    "presente": true,
    "type": "hyrox | tyrun | athx | autre",
    "semaines_restantes": 8,
    "format_connu": "texte libre ou null (TyRun : souvent null)"
  },
  "transition_profil": {
    "profil_precedent": "hybrid | crossfit | functional | null",
    "semaine_du_changement": "date ISO ou numero de semaine — null si pas de changement"
  },
  "modules_sautes": [
    { "jour": 2, "module": "charge" }
  ],
  "athlete": {
    "prs": {
      "arrache_kg": 60,
      "epaule_jete_kg": 75,
      "back_squat_kg": 110,
      "front_squat_kg": 90,
      "souleve_de_terre_kg": 140,
      "developpe_couche_kg": 80,
      "developpe_militaire_kg": 55,
      "poids_de_corps_kg": 82,
      "row_2000m_reference": "7:45",
      "course_5km_reference": "24:30"
    },
    "limitations": ["épaule droite : pas d'arraché overhead lourd", "genou : amplitude squat limitée"],
    "points_faibles": ["poussée verticale", "mobilité de cheville", "endurance de force jambes"],
    "mouvements_bloquants": ["traction stricte", "HSPU strict", "position haute de l'arraché"],
    "retour_sensations": {
      "fatigue_1_a_5": 3,
      "douleurs": ["épaule droite, léger, sur overhead"],
      "commentaire": "Semaine chargée au travail, sommeil moyen."
    },
    "tests_recents": [
      { "test": "row_2000m", "date": "2026-09-01", "resultat": "7:41" },
      { "test": "back_squat_3RM", "date": "2026-08-25", "resultat": "105 kg" }
    ],
    "gates_precedents": [
      { "gate": "back_squat_charge", "resultat": "valide" },
      { "gate": "hspu_strict", "resultat": "echoue", "consigne": "rester sur pike push-up déficit" }
    ],
    "jours_disponibles": ["lun", "mar", "jeu", "sam"]
  },
  "historique_3_semaines": {
    "mouvements_signature": {
      "S-1": ["back squat", "power clean", "strict pull-up", "row 2k"],
      "S-2": ["front squat", "snatch balance", "ring dip", "assault bike"],
      "S-3": ["deadlift", "hang power snatch", "toes-to-bar", "run 5x800"]
    },
    "formats_wod_par_slot": {
      "slot1": ["EMOM 12", "3 RFT", "—"],
      "slot2": ["skill + 5x2", "complexe montant", "—"],
      "slot3": ["AMRAP 10", "21-15-9", "chipper"],
      "slot4": ["intervalles 4x4", "time trial 2k", "5 RFT"]
    },
    "structures_complexes_utilisees_bloc": ["pattern+antagoniste", "meme_objet_enchaine"]
  }
}
```

**Champs ajoutés (doc « Les trois profils », règle « Suivi personnel »)** :
limitations, **points faibles** et **sensations** ajustent le programme ;
des **tests réguliers** valident les progrès sur des chiffres.
`modules_sautes` (optionnel, Functional) sert à réajuster la semaine en cours : le jour tampon reprend ces modules.
`mouvements_bloquants` est le carburant du profil CrossFit (« apprends les
mouvements qui te bloquent »). `transition_profil` sert au **changement libre**
de profil : l'athlète ne repart pas de zéro (voir chaque agent).

`athlete.prs` peut être partiellement vide (comme c'est le cas aujourd'hui
dans l'app — les champs sont vierges). Si un PR nécessaire au calcul d'une
charge est absent, l'agent doit soit demander l'info, soit rendre la charge en
qualitatif (`LÉGÈRE/MODÉRÉE/TRÈS LÉGÈRE`) plutôt que halluciner un %.

---

## Contrat de SORTIE

```json
{
  "profil": "crossfit",
  "bloc": {
    "numero": 3,
    "duree_semaines": 6,
    "structure": "5+1",
    "focus_progression": "charge",
    "repere_fin_de_bloc": "Back squat 3RM chronométré + benchmark 'Fran' modifié"
  },
  "semaine": {
    "numero_dans_le_bloc": 3,
    "type": "chargee",
    "duree_totale_min": 309,
    "ordre_seances": ["slot1", "slot2", "slot3", "slot4"],
    "jours": { "slot1": "lun", "slot2": "mar", "slot3": "jeu", "slot4": "ven" },
    "note_progression_semaine": "Chargement : +2,5 % sur le mouvement principal si gate S2 validé."
  },
  "seances": [
    {
      "slot": 2,
      "jour": 2,
      "jour_type": "entrainement",
      "duree_estimee_min": 86,
      "titre": "HALTÉROPHILIE — SNATCH",
      "blocs": [
        {
          "nom": "ÉCHAUFFEMENT DYNAMIQUE",
          "duree_min": 10,
          "exercices": [
            { "nom": "Corde à sauter facile", "notation": "1×30''" },
            { "nom": "Arm circles + PVC pass-through", "notation": "2×10" },
            { "nom": "Squat prying + cossack squat", "notation": "2×6/côté" }
          ]
        },
        {
          "nom": "MOBILITÉ CIBLÉE",
          "duree_min": "6-7",
          "exercices": [
            { "nom": "Ouverture de hanche (90/90 ou pigeon)", "notation": "1×30''/côté" }
          ]
        },
        {
          "nom": "WOD — CORPUS 130319",
          "type": "wod",
          "format_entete": "Every 2:00 x 5 rounds (10') — le reste du 2:00 = récupération, jamais de sprint",
          "exercices": [
            { "nom": "Shoulder press", "notation": "5×4", "charge": "30-35 kg" },
            { "nom": "Sumo deadlift high-pull", "notation": "5×8", "charge": "même barre" },
            { "nom": "Front squat", "notation": "5×12", "charge": "même barre" }
          ],
          "checks_internes": ["Aucun mouvement d'haltérophilie dans ce WOD ✔ (règle R1)"]
        },
        {
          "nom": "MONTÉE EN CHARGE",
          "duree_min": 6,
          "exercices": [
            { "nom": "Snatch — technique", "notation": "1×5", "charge": "barre à vide" },
            { "nom": "Snatch", "notation": "1×3", "charge": "50% TM", "repos": "R 60''" },
            { "nom": "Snatch", "notation": "1×1", "charge": "80% TM", "repos": "R 2'" }
          ]
        },
        {
          "nom": "BLOC A — SNATCH, RÉALISATION",
          "duree_min": 20,
          "note": "GATE : si le 80-85% de S4 est passé propre → singles lourds. Sinon → doubles à 80% max.",
          "exercices": [
            {
              "nom": "Snatch — singles lourds (piste 1)",
              "notation": "6×1",
              "charge": "87-90% TM",
              "repos": "R 2-3'",
              "note": "MARQUEUR : charge max PROPRE. Arrêt à la première tentative dégradée."
            },
            {
              "nom": "Snatch — doubles (piste 2)",
              "notation": "5×2",
              "charge": "80% TM max",
              "repos": "R 2-3'",
              "note": "Pas de singles lourds sur un pattern non validé."
            }
          ]
        },
        {
          "nom": "BLOC B",
          "duree_min": 10,
          "exercices": [
            { "nom": "Snatch pull depuis le sol", "notation": "3×2", "charge": "95-100% TM snatch", "repos": "R 90''" }
          ]
        },
        {
          "nom": "BLOC C",
          "duree_min": 6,
          "exercices": [
            { "nom": "YTW raises", "notation": "2×8", "charge": "très légère", "repos": "R 45''" },
            { "nom": "Hollow hold", "notation": "2×30''", "repos": "R 45''" }
          ]
        },
        {
          "nom": "COMPLÉMENTAIRE",
          "duree_min": 8,
          "exercices": [
            { "nom": "Single-leg RDL léger", "notation": "3×8/jambe", "charge": "légère", "repos": "R 45''" },
            { "nom": "External rotation DB couché", "notation": "3×12/côté", "charge": "très légère", "repos": "R 45''" }
          ]
        }
      ]
    }
  ],
  "controles_anti_monotonie": {
    "mouvements_signature_semaine": ["power snatch", "back squat", "strict HSPU progression", "row intervalles"],
    "collision_fenetre_3_semaines": "aucune — power snatch absent de S-1/S-2/S-3 ✔",
    "formats_wod_semaine": ["EMOM 14", "5x3 tempo (force)", "21-15-9 (gym)", "4x(500 m + 1 min)"],
    "formats_wod_4_structurellement_differents": true,
    "repetition_format_par_slot_max_2_consecutif": "respecté ✔",
    "equivalents_par_seance": { "slot1": 1, "slot2": 1, "slot3": 2, "slot4": 1 },
    "structures_complexes_bloc": ["meme_objet_enchaine", "pattern+antagoniste", "contraste_tension_vitesse"],
    "anti_interference": [
      "Pas de chaîne postérieure lourde + cyclage barre glyco même séance ✔",
      "Lun (Force, hinge) → Mar (Halté) : arraché depuis le sol limité à des pulls légers tant que le hinge lourd de la veille n'est pas récupéré ✔ (règle : ne jamais enchaîner deux séances qui sollicitent la même chose)",
      "WOD ne détruit aucun bloc principal ✔"
    ],
    "enveloppe_temps": "séances 69–86 min, aucune > 90 ✔ ; total semaine ≈ 300 min (309) ✔",
    "olympique_technique_min_semaine": "≤ 25 min sur un seul mouvement olympique (snatch), récupérations longues ✔",
    "progression_conditionnelle": "power snatch : charge montée seulement si gate 'reception' S2 validé ; sinon maintien S2."
  },
  "notes_coach": "Semaine de chargement. Si l'athlète rate le gate power snatch, geler la charge et re-tester en S4."
}
```

---

## Champs — définitions rapides

| Champ | Sens |
|---|---|
| `slot` | 1–4, la qualité travaillée (voir tableau des slots par profil) |
| `seances[].blocs[].nom` | Texte libre — nom du bloc tel qu'affiché dans l'app (`ÉCHAUFFEMENT DYNAMIQUE`, `BLOC A — …`, `COMPLÉMENTAIRE`…). Pas d'enum figé, mais garder la cohérence avec les exemples observés. |
| `exercices[].notation` | `sets×reps` (`5×4`), `sets×durée` (`2×30''`), ou avec précision de côté (`3×8/côté`) — format libre observé dans l'app. |
| `exercices[].charge` | `% TM` (calculé depuis `athlete.prs`), `% PDC`, kg absolus, qualitatif (`légère/modérée/très légère`), ou `barre à vide` / `BW`. |
| `exercices[].note` | Texte libre. Convention observée : préfixe `GATE :` pour une bifurcation conditionnelle, `MARQUEUR :` pour un repère à noter par l'athlète. |
| `blocs[].format_entete` | Uniquement pour les blocs `type: "wod"` — décrit le format + le scoring en une phrase (ex. `AMRAP 14' — score = rounds + reps`). |
| `semaine.duree_totale_min` | Somme des durées de séance de la semaine (jour tampon inclus pour Functional). **≈ 300 min pour les 3 profils** (doc « Les trois profils » : même volume, même exigence). |
| `seances[].jour_type` | `entrainement` \| `tampon`. `tampon` uniquement en profil **Functional** (5e jour). |
| `seances[].duree_estimee_min` | Durée estimée de la séance (CrossFit : cibles 78 / 86 / 69 / 76 ; Hybrid ≈ 75 en moyenne ; Functional : 60 par jour d'entraînement). |
| `blocs[].module` | **Functional uniquement** : `charge` \| `volume` \| `moteur`. Chaque module = 20 min, préparation ciblée incluse. Les blocs d'un même module partagent la même valeur. Règles de placement que l'app doit appliquer : `charge` toujours en premier de la journée (corps frais) ; `volume` n'importe quand ; `moteur` n'importe quand mais ≥ 20 min après `charge`. Ordre enchaîné canonique : charge → volume → moteur (le volume fait office de coupure de 20 min). |
| `couche` (interne, pas affiché app) | `noyau` \| `equivalents` \| `ouverture` — utilisé pour les checks anti-monotonie, pas nécessairement à persister. |
| `controles_anti_monotonie` | Bloc de preuve interne à l'agent — démontre le respect des règles dures. Rien n'indique que l'app le persiste ; à toi de choisir si tu le stockes (ex. `notes_internes`) ou si tu le jettes après vérification. |
