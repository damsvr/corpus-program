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
