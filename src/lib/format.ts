/** "5×4" -> { sets: 5, reps: "4" } ; "2×30''" -> { sets: 2, reps: "30''" } ; sinon 1 série. */
export function parseNotation(notation?: string | null): { sets: number; reps: string } {
  if (!notation) return { sets: 1, reps: "" };
  const m = notation.match(/^\s*(\d+)\s*[×xX]\s*(.+?)\s*$/);
  if (!m) return { sets: 1, reps: notation.trim() };
  return { sets: Math.min(parseInt(m[1], 10), 20), reps: m[2] };
}

/** Répétitions pré-remplies : entier simple, avec ou sans "/côté" ("8", "8/côté"). Pas les distances ni durées. */
export function repsAsNumber(reps: string): number | null {
  const m = reps.trim().match(/^(\d+)(?:\s*\/\s*(?:côté|cote|jambe|bras|side|leg|arm))?$/i);
  return m ? parseInt(m[1], 10) : null;
}

/** "R 60''" -> 60 ; "R 2'" -> 120 ; "R 2-3'" -> 150 (moyenne) ; sinon null. */
export function parseRestSeconds(repos?: string | null): number | null {
  if (!repos) return null;
  const m = repos.match(/(\d+(?:[.,]\d+)?)\s*(?:[-–]\s*(\d+(?:[.,]\d+)?)\s*)?('{1,2}|sec|min|s|m)/i);
  if (!m) return null;
  const a = parseFloat(m[1].replace(",", "."));
  const b = m[2] ? parseFloat(m[2].replace(",", ".")) : a;
  const avg = (a + b) / 2;
  const unit = m[3].toLowerCase();
  const seconds = unit === "'" || unit === "min" || unit === "m" ? avg * 60 : avg;
  return Math.round(seconds);
}

const INFORMATIONAL_BLOC_KEYWORDS = ["echauffement", "mobilite", "preparation ciblee"];

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/**
 * Échauffement / mobilité (et prépa ciblée Functional) : blocs informatifs,
 * pas de charge ni de validation de série à l'exécution (demande coach).
 */
export function isInformationalBloc(nom: string): boolean {
  const n = stripAccents(nom).toLowerCase();
  return INFORMATIONAL_BLOC_KEYWORDS.some((k) => n.includes(k));
}

/**
 * Parmi les blocs informatifs, lequel est de la mobilité pure (chrono par
 * mouvement) plutôt qu'un échauffement (chrono global du bloc). Un bloc qui
 * mentionne les deux ("ÉCHAUFFEMENT GÉNÉRAL & MOBILITÉ") reste traité comme
 * échauffement — un seul enchaînement continu, pas mouvement par mouvement.
 */
export function isMobiliteBloc(nom: string): boolean {
  const n = stripAccents(nom).toLowerCase();
  return n.includes("mobilite") && !n.includes("echauffement");
}

export type BlocKind = "wod" | "echauffement" | "mobilite" | "travail";

export function classifyBloc(nom: string, isWod: boolean): BlocKind {
  if (isWod) return "wod";
  if (!isInformationalBloc(nom)) return "travail";
  return isMobiliteBloc(nom) ? "mobilite" : "echauffement";
}

export function formatDateFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

/** Lundi 00:00 de la semaine de d. */
export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
