// Page Instagram du coach : contact pour s'abonner ou poser une question.
export const COACH_INSTAGRAM_URL = "https://www.instagram.com/ds.coach.online/";
export const COACH_INSTAGRAM_HANDLE = "@ds.coach.online";

/** Ligne CSV (séparateur « ; » pour Excel FR), champs échappés. */
export function csvRow(fields: (string | null | undefined)[]): string {
  return fields.map((f) => `"${String(f ?? "").replace(/"/g, '""')}"`).join(";");
}
