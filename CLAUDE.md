# CLAUDE.md — Corpus Program

SaaS Next.js 15 (App Router) + Prisma/Postgres + Auth.js (credentials, JWT) + Tailwind 4. UI en français, mobile-first.

## Ce que fait le produit
- 3 profils : `CROSSFIT`, `HYBRID`, `FUNCTIONAL` (enum Prisma `ProfileType`, `activeProfile` sur `User` ; teinte d'accent via `data-profile` dans `src/app/(app)/layout.tsx` et `globals.css` : rouge / jaune / orange).
- **Pas de génération IA dans l'app** (décision produit) : l'athlète utilise les agents de `docs/agents/`, relit, puis **importe le JSON** (`/import`). `src/lib/import-schema.ts` valide (erreurs bloquantes + avertissements), `src/lib/import-week.ts` écrit en base.
- Functional : 4 jours × 3 modules de 20 min (`Bloc.module` = CHARGE/VOLUME/MOTEUR) + 1 jour tampon (`Day.jourType = TAMPON`). Règles de placement : Charge en premier, Moteur ≥ 20 min après Charge (avertissement dans `/seance/[dayId]`). Complétion **par module** (`SessionLog.module`).
- Le JSON importé fait foi : contrat dans `docs/agents/01-schema-sortie-commun.md`. Toute évolution du contrat = mettre à jour ce fichier, `import-schema.ts`, les tests et les prompts d'agents ensemble.
- **Rôles et partage** : `User.role` = `COACH` (Damien — possède la programmation, seul à voir `/import`) ou `ATHLETE` (par défaut à l'inscription — suit la programmation du coach en lecture seule, garde son propre suivi). `src/lib/program.ts#programOwnerId(user)` résout QUI possède le `Program` à afficher (le coach lui-même, ou le coach trouvé en base pour un athlète) — **toujours l'utiliser** pour `getActiveProgram`/`getWeek`/les lookups de `Day` dans les pages et actions de séance, jamais `user.id` directement pour ça. En revanche `SessionLog`/`Prs`/`AthleteProfile`/`activeProfile` restent scopés à `user.id` (suivi et préférences personnels, même en suivant la programmation de quelqu'un d'autre). `Day.weekday` (planification) n'est modifiable que par le coach (`setDayWeekday` vérifie le rôle) puisque c'est une donnée partagée. Promotion COACH à l'inscription : `src/lib/roles.ts#isCoachEmail` (env `COACH_EMAILS`, replis sur l'e-mail fondateur) ; le compte fondateur existant a été promu via la migration de données `promote_founder_coach`.
- **Partage de séance** : `/partager/[id]` (lien « Partager » dans `/historique`) propose une carte 1080×1920 façon Strava — avec fond ou sticker transparent — générée par `src/app/api/share/[id]/route.tsx` (`next/og`, polices Poppins dans `src/assets/fonts`, licence OFL). Contenu : profil (CrossFit / Hybrid / Functional), pattern du jour (`detectPattern` sur le préfixe du titre : force / gym / haltérophilie / autre), durée, calories **estimées** (MET × poids de corps des PR, 75 kg par défaut) et performance choisie selon le pattern (`src/lib/share.ts`, testé). Partage natif via Web Share API sur mobile, téléchargement du PNG sinon.
- **Limite connue** : les charges affichées (ex. « 70% TM ») viennent du JSON importé par le coach, calculées sur SES PR à lui — l'app ne recalcule pas encore les % en kg pour chaque athlète à partir de ses propres PR. À construire si la personnalisation par athlète devient nécessaire.

## Règles métier codées ou à respecter
- ≈ 300 min/semaine pour les 3 profils ; séance ≤ 90 min (erreur au-delà) ; CrossFit 70–86 min (avertissement).
- CrossFit/Hybrid : 4 séances, pas de jour tampon ni de champ `module`. Hybrid/Functional : pas d'haltérophilie à la barre (avertissement sur les noms d'exercices).
- Charges exprimées en %TM / %PDC à partir des PR de `Prs` (l'agent les calcule ; l'app n'affiche que du texte).

## Local
- `npm run db:dev` (Postgres embarqué, port 5433, `.data/`), `npm run db:migrate`, `npm run dev`. Tests : `npm test`.
- Ne jamais saisir de mot de passe réel dans un navigateur piloté par Claude. Pour tester l'UI connecté : créer un utilisateur synthétique en base et forger un cookie de session `authjs.session-token` avec `next-auth/jwt` (`encode`, salt = nom du cookie, secret = `AUTH_SECRET`).

## Feuille de route (hors v1)
Stripe (essai gratuit puis 39 €/mois — champs `subscriptionStatus`/`trialEndsAt` déjà présents), e-mails (vérification, reset mot de passe), rappels quotidiens (`reminderTime` stocké, envoi non implémenté), filtrage par palier de matériel, %TM personnalisé par athlète (voir « limite connue » ci-dessus), CI.

## Dépôt et déploiement
- GitHub : `git@github.com:damsvr/corpus-program.git` (privé). Clé SSH dédiée sur cette machine : `~/.ssh/id_ed25519_corpus_program` (config dans `~/.ssh/config`, host `github.com`).
- Render (`render.yaml`) : service web sur le plan **free** (se met en veille après inactivité — attendu tant que le produit n'est pas lancé). Base de données **hors Render** pour rester gratuit : Neon (Postgres géré, plan gratuit, région Francfort/eu-central-1). `DATABASE_URL` est saisi à la main dans les variables d'environnement du service Render (`sync: false` dans le blueprint), pas dérivé d'une base Render. Repasser en payant (Render Postgres ou autre) au lancement réel du produit.
