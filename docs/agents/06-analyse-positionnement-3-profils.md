# Analyse — « Corpus Program · Les trois profils » (v1.0, 2026)

*DS Coaching · Damien Sauveur · 6 pages · « Le corps d'abord. Le reste suit. »*

---

## 1. Nature du document

C'est le **document de positionnement produit** des trois profils : « qui va où, et
pourquoi ». Là où le document d'architecture (`00-analyse-…`) décrit la mécanique
interne (slots, blocs, moteur anti-monotonie), celui-ci définit **la promesse, le
public, le format et ce que chaque profil n'est pas**. Il pilote aussi la
conception du parcours d'onboarding de l'app (3 questions pour choisir).

**Il prime sur le document d'architecture là où les deux divergent** (c'est ta
consigne : adapter les agents à ce document). Les divergences et leur résolution
sont listées section 4.

## 2. Ce que dit le document

### L'axe : ce que tu viens chercher (pas le niveau, pas le matériel)

| | **CrossFit** | **Hybrid** | **Functional** |
|---|---|---|---|
| Tu cherches | La compétence | La performance | La robustesse |
| Promesse | Apprends les mouvements qui te bloquent. | Plus lourd, plus vite, plus loin. | Un corps qui tient. |
| Pour qui | Progresser en CrossFit, technique comprise | Force + cardio sur mouvements simples, **avec ou sans échéance** | Un corps solide : semaine imprévisible, reprise, renforcement |
| Prix à payer | Du temps technique | De la charge et du volume | De la régularité |
| Format | 4 séances complètes, **70 à 86 min** | 4 séances complètes, **efforts continus** | **4 jours + 1 jour tampon, 3 modules de 20 min** |
| Ce qui n'y est pas | La flexibilité horaire | Le découpage des efforts longs | L'haltérophilie technique complète |

### Ce qui ne change jamais (les 3 profils)
- 4 qualités en parallèle chaque semaine : force, haltérophilie, gymnastique, endurance. Aucune n'attend plus d'une semaine.
- Blocs de 6 semaines : 5 de progression + 1 allégée.
- **≈ 300 min/semaine, le même volume pour les trois.**
- Mobilité et adaptations calées sur les **limitations personnelles**.

### CrossFit
- Semaine type : **lun Force et musculation ≈ 78 min · mar Haltérophilie ≈ 86 · jeu Gymnastique ≈ 69 · ven Endurance ≈ 76** (≈ 309).
- L'ordre des jours s'adapte ; **seule règle fixe : ne jamais enchaîner deux séances qui sollicitent la même chose.**
- Le prix : **jusqu'à 25 min/semaine sur UN seul mouvement olympique**, récupérations longues.
- Cible : les mouvements qui bloquent (arraché, épaulé-jeté, tractions strictes, équilibre).
- N'y est pas : la flexibilité horaire — **les séances ne se découpent pas** ; pas de raccourci.

### Hybrid
- Force + cardio sur mouvements **simples et répétables**, avec ou sans dossard (Hyrox, AthX, TyRun ou autre).
- Ce que le profil travaille : force lourde (squat, soulevé, presse, tirage) ; puissance sur **variantes accessibles**, sans exigence olympique ; **endurance de base en efforts continus de 25 à 30 min** + intervalles ; gainage et renforcement **ciblé sur ce que l'épreuve va exiger** ; **tests réguliers** pour ajuster les charges.
- N'y est pas : le **découpage des efforts longs** (30 min coupées en 2 × 15 ≠ le même entraînement) ; l'olympique technique complet.

### Functional
- **20 min/module · 3 modules/jour · 300 min/semaine.**
- 4 jours (une qualité par jour, 3 modules chacun) + **1 jour tampon** qui absorbe les modules sautés ; rien sauté → mobilité + point faible.
- Modules : **Charge** (lourd, mouvement principal — *toujours en premier, corps frais*), **Volume** (renforcement, tempo, développement musculaire — *n'importe quand*), **Moteur** (WOD, intervalles, finisher — *n'importe quand, ≥ 20 min après Charge*). Chaque module contient sa propre préparation ciblée.
- N'y est pas : haltérophilie technique complète (→ variantes de puissance accessibles) ; **blocs cardio continus de 30 min (→ intervalles)** ; **une version allégée** (même volume, même progression).

### Choisir (3 questions) et règles commerciales
1. Peux-tu bloquer 75 min, 4×/semaine, 6 semaines d'affilée sans négocier ? **Non → Functional.**
2. Prêt à passer du temps sur la technique sans résultat visible tout de suite ? **Oui → CrossFit.**
3. Veux-tu voir tes chiffres monter, avec ou sans dossard ? **Oui → Hybrid.**

Même prix pour les trois · **changement libre** de profil, sans frais et **sans repartir de zéro** · même exigence · **suivi personnel** (limitations, points faibles, sensations ajustent le programme ; tests réguliers valident sur des chiffres).

## 3. Ce que j'ai changé dans les agents

| Sujet | Avant (doc d'architecture / v1 des agents) | Maintenant (aligné sur ce doc) | Agents |
|---|---|---|---|
| **Noms** | Hybrid Racing · Fitness Fonctionnel | **Hybrid** · **Functional** (enum : `crossfit` / `hybrid` / `functional`) ; TyRun, AthX orthographiés comme dans le doc | 3 + schéma + fichiers renommés (`03-agent-hybrid.md`, `04-agent-functional.md`) |
| **Volume hebdo** | Non contraint (≈ 90 min/séance) | **≈ 300 min/semaine pour les 3** ; vérifié dans la checklist | 3 |
| **Functional — format** | 4 séances de 85 min en 5 blocs (+ format court 57 min) | **4 jours × 3 modules de 20 min + jour tampon**, règles de placement Charge/Volume/Moteur, préparation ciblée dans chaque module | Functional (réécrit) |
| **Functional — version courte** | « Format court ≈ 57 min » en option | **Supprimée** (« une version allégée : n'y est pas ») | Functional |
| **Functional — cardio** | Capacité de travail, WOD 10–18 min | **Aucun cardio continu de 30 min** → intervalles | Functional |
| **CrossFit — durées** | ≈ 90 min, plafond 90, version courte | **70–86 min** (cibles 78/86/69/76), **pas de version courte, séances non découpables** | CrossFit |
| **CrossFit — enchaînement** | J'avais interdit Force puis Haltéro consécutifs (interprétation trop stricte de ma part) | **Lun Force → mar Halté est le modèle de référence** ; règle réelle = ne pas enchaîner deux séances qui sollicitent la même chose (jugée sur la sollicitation principale) | CrossFit + exemple du schéma |
| **CrossFit — technique** | Alternance Arraché ↔ Épaulé-jeté par bloc | + **≤ 25 min/semaine sur UN seul mouvement olympique**, repos longs ; + **mouvements bloquants** de l'athlète comme moteur des progressions | CrossFit |
| **Hybrid — haltérophilie** | « Aucun mouvement d'haltérophilie » (contredisait l'exemple *arraché haltère + rameur* du même doc) | **Interdit : haltéro technique à la barre.** Autorisé : puissance sur variantes accessibles (haltère, KB, landmine, med ball, sauts) | Hybrid |
| **Hybrid — efforts** | WOD par slot, pièce longue 35–45 min | + **efforts continus de 25 à 30 min (plancher) jamais découpés** ; pièce longue 35–45 min conservée, continue | Hybrid |
| **Hybrid — tests / cible** | Simulation de course en semaine de réalisation | + **tests réguliers** (recalibrage sur 2000 m / 5 km / stations) ; **renforcement ciblé selon l'épreuve** ; fonctionne **avec ou sans échéance** | Hybrid |
| **Suivi personnel** | Limitations + gates | + **points faibles**, **sensations**, **tests récents** en entrée | 3 + schéma d'entrée |
| **Changement libre** | Non traité | `transition_profil` en entrée : on **conserve position dans le bloc, PR/TM, gates, historique (tous profils)** ; seul le format s'adapte | 3 + schéma d'entrée |
| **Jour tampon** | — | Nouvelle entrée `jour_type: "tampon"` (contenu par défaut : mobilité + point faible ; reprise des `modules_sautes` sinon) | Functional + schéma |
| **Modules** | — | Champ optionnel `bloc.module` (`charge`/`volume`/`moteur`) pour l'app | Functional + schéma |

## 4. Points de tension entre les deux documents — et comment je les ai tranchés

À confirmer par toi ; j'ai retenu l'option la plus cohérente avec **ce** document.

1. **Durée de l'effort continu Hybrid : 25–30 min (ce doc) vs 35–45 min (slot Cardio/Race, doc d'architecture).**
   *Retenu :* 25–30 min = plancher d'effort continu (jamais découpé) ; 35–45 min = pièce longue Cardio/Race qui reste continue. → **À confirmer : la pièce longue de 35–45 min est-elle toujours voulue ?**
2. **Durée moyenne d'une séance Hybrid : 75–90 min (architecture) vs ≈ 300 min/semaine (ce doc, soit 75 min de moyenne).**
   *Retenu :* moyenne ≈ 75 min, total ≈ 300, plafond 90.
3. **Functional — où vivent l'ouverture élargie (12–15 min), le Bloc Intensité et la fermeture core, maintenant qu'il n'y a que des modules de 20 min ?**
   *Retenu :* préparation ciblée **dans** chaque module (plus d'ouverture unique) ; Bloc Équilibre → module Volume ; Bloc Intensité + finisher → module Moteur ; fermeture core → fin du module Volume (ou Moteur si saturé). Les tableaux de groupes musculaires par slot, la progression S1→S6 et les 4 familles core sont conservés.
4. **Durée du jour tampon** : non donnée. *Déduit :* 300 − (4 × 60) = **≈ 60 min**.
5. **Répartition des minutes dans un module de 20 min** (préparation vs travail) : non donnée. *Retenu :* heuristiques indicatives dans le prompt (Charge ≈ 4–6 min de prépa ; Volume/Moteur ≈ 2–4 min), présentées comme ajustables.

## 5. Questions ouvertes pour toi

- **Jour tampon débordé** : s'il y a plus de modules sautés que le tampon n'en absorbe (3 max ≈ 60 min), quelle priorité de rattrapage ? (Je n'ai rien inventé ; l'agent reporte les modules « à l'identique ».)
- **Semaine imprévisible en cours de route** : le réajustement passe par `modules_sautes` en entrée de l'agent. Est-ce l'app qui gère seule le report vers le jour tampon (sans repasser par un agent) ? C'est mon hypothèse pour l'app.
- **Fréquence des tests** en Hybrid/CrossFit : « réguliers » — j'ai imposé au minimum un test par bloc (semaine de réalisation). Trop peu / trop ?
- **« L'équilibre »** (CrossFit) : je l'ai lu comme un mouvement bloquant possible (handstand/équilibre en gymnastique). Correct ?

## 6. Implications pour l'application (plan d'exécution)

- **Onboarding** : le quiz « Trois questions. Pas dix. » (section 5 du doc) devient l'écran de choix de profil recommandé, avec modification libre ensuite.
- **Changement de profil sans frais ni reset** : l'app doit conserver PR, gates, historique et position dans le bloc, et passer `transition_profil` aux agents.
- **Functional** : l'app doit afficher une journée en **3 modules indépendants**, permettre de les faire d'une traite **ou séparément dans la journée** (statut par module), appliquer les règles de placement (Charge en premier, Moteur ≥ 20 min après), et gérer le **jour tampon** (absorption des modules sautés, sinon mobilité + point faible).
- **Volume** : afficher/valider le total ≈ 300 min/semaine à l'import du JSON.
- **Couleurs par profil** (déjà demandées) : CrossFit rouge · Hybrid jaune · Functional orange. Le doc utilise un dégradé jaune→orange + turquoise sur fond sombre.
