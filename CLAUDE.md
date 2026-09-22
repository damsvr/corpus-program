# CLAUDE.md — Corpus Program

SaaS Next.js 15 (App Router) + Prisma/Postgres + Auth.js (credentials, JWT) + Tailwind 4. UI en français, mobile-first.

## Ce que fait le produit
- 3 profils : `CROSSFIT`, `HYBRID`, `FUNCTIONAL` (enum Prisma `ProfileType`, `activeProfile` sur `User` ; teinte d'accent via `data-profile` dans `src/app/(app)/layout.tsx` et `globals.css` : rouge / jaune / orange).
- **Pas de génération IA dans l'app** (décision produit) : l'athlète utilise les agents de `docs/agents/`, relit, puis **importe le JSON** (`/import`). `src/lib/import-schema.ts` valide (erreurs bloquantes + avertissements), `src/lib/import-week.ts` écrit en base.
- Functional : 4 jours × 3 modules de 20 min (`Bloc.module` = CHARGE/VOLUME/MOTEUR) + 1 jour tampon (`Day.jourType = TAMPON`). Règles de placement : Charge en premier, Moteur ≥ 20 min après Charge (avertissement dans `/seance/[dayId]`). Complétion **par module** (`SessionLog.module`).
- Le JSON importé fait foi : contrat dans `docs/agents/01-schema-sortie-commun.md`. Toute évolution du contrat = mettre à jour ce fichier, `import-schema.ts`, les tests et les prompts d'agents ensemble.

## Règles métier codées ou à respecter
- ≈ 300 min/semaine pour les 3 profils ; séance ≤ 90 min (erreur au-delà) ; CrossFit 70–86 min (avertissement).
- CrossFit/Hybrid : 4 séances, pas de jour tampon ni de champ `module`. Hybrid/Functional : pas d'haltérophilie à la barre (avertissement sur les noms d'exercices).
- Charges exprimées en %TM / %PDC à partir des PR de `Prs` (l'agent les calcule ; l'app n'affiche que du texte).

## Local
- `npm run db:dev` (Postgres embarqué, port 5433, `.data/`), `npm run db:migrate`, `npm run dev`. Tests : `npm test`.
- Ne jamais saisir de mot de passe réel dans un navigateur piloté par Claude. Pour tester l'UI connecté : créer un utilisateur synthétique en base et forger un cookie de session `authjs.session-token` avec `next-auth/jwt` (`encode`, salt = nom du cookie, secret = `AUTH_SECRET`).

## Feuille de route (hors v1)
Stripe (essai gratuit puis 39 €/mois — champs `subscriptionStatus`/`trialEndsAt` déjà présents), e-mails (vérification, reset mot de passe), rappels quotidiens (`reminderTime` stocké, envoi non implémenté), filtrage par palier de matériel, vue coach, CI.

## Dépôt et déploiement
- GitHub : `git@github.com:damsvr/corpus-program.git` (privé). Clé SSH dédiée sur cette machine : `~/.ssh/id_ed25519_corpus_program` (config dans `~/.ssh/config`, host `github.com`).
- Render (`render.yaml`) : service web sur le plan **free** (se met en veille après inactivité — attendu tant que le produit n'est pas lancé). Base de données **hors Render** pour rester gratuit : Neon (Postgres géré, plan gratuit, région Francfort/eu-central-1). `DATABASE_URL` est saisi à la main dans les variables d'environnement du service Render (`sync: false` dans le blueprint), pas dérivé d'une base Render. Repasser en payant (Render Postgres ou autre) au lancement réel du produit.
