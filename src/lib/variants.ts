/**
 * Variantes RX / scaled écrites par les agents dans le même champ :
 * « HSPU (RX) / Pike push-up pieds sur banc (scaled) », « 15 (RX) / 10 (scaled) »,
 * « 24 kg (RX) / 16 kg (scaled) ». L'athlète choisit sa variante ; le choix
 * s'applique à nom, notation, charge et repos.
 */

export type Variant = "rx" | "scaled";

const PAIR = /^(.*?)\s*\(\s*RX\s*\)\s*(?:\/|ou)\s*(.*?)\s*\(\s*scaled\s*\)\s*$/i;

type VariantFields = { nom: string; notation: string | null; charge: string | null; repos: string | null };

function pick(text: string | null, variant: Variant): string | null {
  if (!text) return text;
  const m = text.match(PAIR);
  if (!m) return text;
  return (variant === "rx" ? m[1] : m[2]).trim() || text;
}

export function hasVariants(e: VariantFields): boolean {
  return [e.nom, e.notation, e.charge, e.repos].some((t) => !!t && PAIR.test(t));
}

export function applyVariant<T extends VariantFields>(e: T, variant: Variant): T {
  return {
    ...e,
    nom: pick(e.nom, variant) ?? e.nom,
    notation: pick(e.notation, variant),
    charge: pick(e.charge, variant),
    repos: pick(e.repos, variant),
  };
}

export function anyVariants(blocs: { exercices: VariantFields[] }[]): boolean {
  return blocs.some((b) => b.exercices.some(hasVariants));
}
