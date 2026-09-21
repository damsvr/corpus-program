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
