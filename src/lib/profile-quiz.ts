import type { ProfileType } from "@prisma/client";

/**
 * Les 3 questions du document de positionnement (« Trois questions. Pas dix. »),
 * partagées par le quiz de l'app (/onboarding) et celui de la landing (/).
 * `yes` / `no` : profil recommandé, ou numéro (1-based) de la question suivante.
 */
export const QUIZ_QUESTIONS: readonly { q: string; yes: ProfileType | number; no: ProfileType | number }[] = [
  {
    q: "Est-ce que tu peux bloquer 75 minutes, quatre fois par semaine, six semaines d'affilée, sans avoir à négocier avec qui que ce soit ?",
    no: "FUNCTIONAL",
    yes: 2,
  },
  {
    q: "Est-ce que tu es prêt à passer du temps sur la technique, sans que le résultat se voie tout de suite ?",
    yes: "CROSSFIT",
    no: 3,
  },
  {
    q: "Est-ce que tu veux voir tes chiffres monter, avec ou sans dossard ?",
    yes: "HYBRID",
    no: "FUNCTIONAL",
  },
];
