// Comptes promus COACH à l'inscription — configurable via la variable
// d'environnement COACH_EMAILS (liste séparée par des virgules), avec le
// compte fondateur en repli. Voir aussi la migration promote_founder_coach.sql
// qui promeut le compte existant lors du déploiement.
const FALLBACK_COACH_EMAILS = ["damien.sauveur@gmail.com"];

export function isCoachEmail(email: string): boolean {
  const list = (process.env.COACH_EMAILS ?? FALLBACK_COACH_EMAILS.join(","))
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase().trim());
}
