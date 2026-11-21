type WeekRef = { blocNumero: number; semaineDansBloc: number };

/**
 * Libellé d'une semaine d'après son contenu (cycle + semaine dans le cycle), pas
 * d'après son rang d'import : `Week.numero` suit l'ordre dans lequel le coach
 * a importé les fichiers, donc une semaine 2 importée en premier s'appelait
 * « Week 01 » et semblait absente. Un cycle = un bloc du JSON des agents.
 */
export function weekLabel(w: WeekRef): string {
  return `Cycle ${w.blocNumero} · S${w.semaineDansBloc}`;
}

/** Ordre chronologique du programme : cycle puis semaine dans le cycle. */
export function compareWeeks(a: WeekRef, b: WeekRef): number {
  return a.blocNumero - b.blocNumero || a.semaineDansBloc - b.semaineDansBloc;
}

const DAY_MS = 86_400_000;

/** Lundi (UTC) de la semaine k d'un cycle dont la semaine 1 commence à `startsOn`. */
export function weekStart(startsOn: Date, semaineDansBloc: number): Date {
  return new Date(startsOn.getTime() + (semaineDansBloc - 1) * 7 * DAY_MS);
}

/** Dimanche qui clôt la semaine commençant à `start`. */
export const weekEnd = (start: Date): Date => new Date(start.getTime() + 6 * DAY_MS);

const dd = (d: Date, withYear: boolean) =>
  d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", ...(withYear ? { year: "2-digit" } : {}), timeZone: "UTC" });

/** « 04/01/27 au 10/01/27 » */
export function formatRange(start: Date, short = false): string {
  const end = weekEnd(start);
  return short ? `${dd(start, false)} → ${dd(end, true)}` : `${dd(start, true)} au ${dd(end, true)}`;
}

/** « Cycle 3 · Semaine 1 · 04/01/27 au 10/01/27 » (sans dates si le cycle n'est pas calé sur le calendrier). */
export function weekTitle(w: WeekRef, startsOn?: Date | null): string {
  const base = `Cycle ${w.blocNumero} · Semaine ${w.semaineDansBloc}`;
  return startsOn ? `${base} · ${formatRange(weekStart(startsOn, w.semaineDansBloc))}` : base;
}

/** Date UTC (minuit) d'un jour calendaire local. */
export const utcDay = (d: Date): Date => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

/** Numéro d'import de la semaine qui couvre `today` d'après le calendrier des cycles, sinon null. */
export function currentWeekNumero<T extends WeekRef & { numero: number }>(
  weeks: T[],
  starts: Map<number, Date>,
  today: Date,
): number | null {
  const t = utcDay(today).getTime();
  for (const w of weeks) {
    const s = starts.get(w.blocNumero);
    if (!s) continue;
    const from = weekStart(s, w.semaineDansBloc).getTime();
    if (t >= from && t < from + 7 * DAY_MS) return w.numero;
  }
  return null;
}

/** « 2027-01-04 » → date UTC si c'est un lundi, sinon null. */
export function parseMonday(input: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const d = new Date(`${input}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.getUTCDay() !== 1 ? null : d;
}
