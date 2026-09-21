# Corpus Program

SaaS de programmation d'entraînement à trois profils — **CrossFit**, **Hybrid**, **Functional** —
*« Le corps d'abord. Le reste suit. »* (DS Coaching).

L'athlète prépare sa semaine avec un des trois agents (voir `docs/agents`), relit et modifie, puis
**importe le JSON validé** dans l'app. L'app affiche la semaine, fait exécuter les séances, enregistre
les charges réelles et calcule l'historique.

## Démarrer en local

```bash
npm install
cp .env.example .env        # puis génère AUTH_SECRET : openssl rand -base64 32
npm run db:dev              # Postgres local embarqué (port 5433), laisse ce terminal ouvert
npm run db:migrate          # dans un autre terminal : applique les migrations
npm run dev                 # http://localhost:3000
```

Aucun Docker requis : `npm run db:dev` télécharge un vrai Postgres (données dans `.data/`, ignoré par Git).

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm test` | Tests Vitest (validation du JSON d'import) |
| `npm run typecheck` / `npm run lint` | Contrôles statiques |
| `npm run build` | Build de production |
| `npm run db:migrate` | Nouvelle migration Prisma (dev) |
| `npm run db:studio` | Explorateur de base |

## Documentation produit

`docs/agents/` : analyse des documents Corpus Program, schéma d'échange JSON (`01-schema-sortie-commun.md`),
system prompts des trois agents, banque de mouvements.

## Déploiement

`render.yaml` décrit un service web Next.js + un Postgres géré (région Francfort) pour Render.
