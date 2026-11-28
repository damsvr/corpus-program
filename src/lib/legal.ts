/**
 * Identité légale affichée sur le site (Code de droit économique, art. III.6 et
 * XII.6 : nom, adresse, e-mail, numéro d'entreprise BCE, TVA). Renseignée par
 * variables d'environnement pour ne rien écrire en dur ; tant qu'une valeur
 * manque, la page affiche « à compléter ».
 */
export function legalInfo() {
  const v = (k: string) => process.env[k]?.trim() || null;
  return {
    name: v("LEGAL_NAME"), // ex. « Damien Sauveur — DS Coaching »
    address: v("LEGAL_ADDRESS"),
    email: v("LEGAL_EMAIL"),
    bce: v("LEGAL_BCE"), // numéro d'entreprise (BCE), ex. 0123.456.789
    // Tant que tu es sous le régime de la franchise : mention obligatoire.
    vatFranchise: process.env.LEGAL_VAT_FRANCHISE !== "false",
    host: "Render Services, Inc. (San Francisco, États-Unis) — données hébergées à Francfort (UE) : Render et Neon",
  };
}

export const TODO = "[à compléter]";
