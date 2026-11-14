/**
 * Version courte d'une séance, séance sautable à 3×/semaine, séance légère à 5×.
 * Les agents marquent `optionnel` / `optionnelle` dans le JSON ; sur les
 * semaines déjà importées sans marque, on retombe sur le nom des sections
 * (complémentaire, finisher, retour au calme).
 */
export const SESSIONS_PER_WEEK = [3, 4, 5] as const;
export type SessionsPerWeek = (typeof SESSIONS_PER_WEEK)[number];

/** « 8 » -> 8 ; « 6-7 » -> 6,5 ; sinon 0. */
function minutes(v: string | null): number {
  const m = v?.match(/(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?/);
  if (!m) return 0;
  const a = parseFloat(m[1].replace(",", "."));
  return m[2] ? (a + parseFloat(m[2].replace(",", "."))) / 2 : a;
}

const OPTIONAL_NAME = /compl[ée]mentaire|finisher|accessoire|retour au calme|cool.?down|bonus/i;

type OptionalBloc = { nom: string; optionnel: boolean };

export function isOptionalBloc(b: OptionalBloc): boolean {
  return b.optionnel || OPTIONAL_NAME.test(b.nom);
}

/** Minutes que retire la version courte (somme des durées déclarées des sections optionnelles). */
export function shortVersionSavings(blocs: (OptionalBloc & { dureeMin: string | null })[]): number {
  return Math.round(
    blocs.filter(isOptionalBloc).reduce((a, b) => a + minutes(b.dureeMin), 0),
  );
}

export function normalizeSessionsPerWeek(n: number | null | undefined): SessionsPerWeek {
  return (SESSIONS_PER_WEEK as readonly number[]).includes(n ?? 0) ? (n as SessionsPerWeek) : 4;
}

/**
 * Séance à sauter quand l'athlète s'entraîne 3×/semaine : celle que le coach a
 * marquée, sinon la dernière séance d'entraînement de la semaine.
 */
export function skippableDayId(days: { id: string; jour: number; jourType: string; optionnel: boolean }[]): string | null {
  const training = days.filter((d) => d.jourType === "ENTRAINEMENT").sort((a, b) => a.jour - b.jour);
  if (training.length < 4) return null;
  return (training.find((d) => d.optionnel) ?? training[training.length - 1]).id;
}
