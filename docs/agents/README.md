# Corpus Program — Agents IA de programmation (3 profils)

Kit dérivé de *« Corpus Program : Architecture du système et des trois profils »*
(SD Coaching, v1). Un agent par profil, pour établir la programmation semaine
après semaine dans ton application.

## Fichiers

| Fichier | Contenu |
|---|---|
| `00-analyse-corpus-program.md` | Analyse complète du document : système, architecture commune, les 3 profils, mécanismes transverses, angles morts à trancher. |
| `01-schema-sortie-commun.md` | Contrat d'ENTRÉE et de SORTIE partagé par les 3 agents (JSON). **v2 — calibré sur des données réelles observées dans l'app** (voir ci-dessous). |
| `02-agent-crossfit.md` | System prompt du profil CrossFit + exemple d'appel. |
| `03-agent-hybrid.md` | System prompt du profil Hybrid + exemple d'appel. |
| `04-agent-functional.md` | System prompt du profil Functional (4 jours × 3 modules de 20 min + jour tampon) + exemple d'appel. |
| `06-analyse-positionnement-3-profils.md` | Analyse du doc « Corpus Program · Les trois profils » : ce qu'il dit, ce qui a changé dans les agents, tensions avec le doc d'architecture, questions ouvertes. |
| `05-banque-mouvements.md` | Banque de mouvements (source : ta « Une base de mouvements.pages »), nettoyée et mappée sur les couches Noyau/Équivalents/Ouverture. Référencée par les 3 agents. |

## Principe de conception

Les agents ne « créent » pas un entraînement : ils **remplissent une trame
imposée sous contraintes dures** (moteur anti-monotonie, règles cardinales par
profil, gates de progression). Chaque sortie contient un bloc
`controles_anti_monotonie` qui **prouve** le respect des règles, et chaque agent
termine par une **auto-vérification** avant d'émettre.

Deux modes : `semaine` (1 semaine) et `bloc` (les 5–6 semaines du bloc d'un coup).

## Ce qu'il reste à faire côté app

1. **Schéma JSON** ✅ calibré sur des données réelles (v2, voir ci-dessous).
   Reste à confirmer : ce mapping tient une fois qu'un vrai backend sera
   branché (aujourd'hui les semaines semblent embarquées dans le bundle JS,
   aucun appel réseau vers une base observé).
2. **Base de mouvements** ✅ couverte par `05-banque-mouvements.md`. Reste
   ouvert : tagging par palier de matériel (salle complète / minimaliste /
   déplacement) — la banque source n'a pas cette dimension.
3. **État persistant** : historique 3 semaines (mouvements signature + formats
   WOD par slot), position dans le cycle long des blocs (rotation Force
   Squat→Hinge→Poussée→Tirage ; cycle musculaire 6 blocs du profil Fitness
   Fonctionnel), résultats des gates. Rien de tout ça n'existe encore dans
   l'app (Historique n'affiche que 2 séances de test) — à construire.
4. **Les 3 profils du document ne sont pas encore ceux de l'app** : le
   programme actif s'appelle *« CrossFit / Hybrid Baseline »*, pas
   `crossfit` / `hybrid` / `functional`. À clarifier : est-ce
   un profil de test à remplacer, ou un 4e profil à conserver en plus des 3 ?

## App ds-workouts.lovable.app — ce qui a été vu (connexion du 17/09/2026)

- **Navigation** : 4 onglets — Aujourd'hui, Programme, Historique, Profil.
- **Programme** : semaines (`Week 01/02/05`) → jours (`Jour 1-4`) → séance
  (titre + suite de **blocs nommés en texte libre**). `Week 05` colle déjà de
  très près à l'architecture du document (échauffement dynamique, mobilité
  ciblée, montée en charge, WOD, Bloc A/B/C, complémentaire, gates et
  marqueurs en notes texte). `Week 01/02` sont des données de démo plus
  simples, probablement à remplacer.
- **Profil** : PR personnels (arraché, épaulé-jeté, back squat, front squat,
  soulevé de terre, développé couché, développé militaire, poids de corps,
  références 2000 m rameur et 5 km course) — tous vides actuellement. Les
  charges des séances sont calculées à partir de ces PR (%TM, %PDC).
- **Historique** : séances passées avec date, durée, volume (kg) — 2 entrées
  de test seulement.
- **Techniquement** : aucun appel réseau vers une base de données observé
  pendant la navigation — données probablement encore statiques (bundle JS),
  pas de backend confirmé pour l'instant. Le schéma `01-…` reflète donc le
  format d'AFFICHAGE observé ; il faudra revérifier une fois un vrai backend
  branché (Supabase ou autre).

`01-schema-sortie-commun.md` a été réécrit (v2) pour coller à ce format réel :
blocs en texte libre, notation `sets×reps`/`charge`/`repos` libre, gates et
marqueurs en notes préfixées, charges en %TM/%PDC calculées depuis les PR.

## Réglages recommandés

- Température basse (0–0.3) : c'est de la génération sous contraintes.
- Réponse en JSON strict (mode JSON / grammaire si dispo).
- Si tu passes par l'API Claude : `claude-sonnet-5`, `max_tokens` large pour le
  mode `bloc`.
