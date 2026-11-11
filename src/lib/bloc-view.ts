import { parseNotation } from "@/lib/format";
import { planBloc } from "@/lib/bloc-plan";
import { restGroups } from "@/lib/rest-plan";
import { formatClock, parseWodFormat } from "@/lib/wod-format";
import { shortExerciceName } from "@/lib/share";

/**
 * « BLOC A — SQUAT, MOUVEMENT PRINCIPAL » -> étiquette « BLOC A » + gros titre ;
 * « MOBILITÉ CIBLÉE — hanche/cheville » -> titre « MOBILITÉ CIBLÉE » + précision.
 */
export function splitBlocName(nom: string): { eyebrow: string | null; title: string; subtitle: string | null } {
  const m = nom.match(/^(.+?)\s+[—–]\s+(.+)$/);
  if (!m) return { eyebrow: null, title: nom.trim(), subtitle: null };
  const head = m[1].trim();
  const tail = m[2].trim();
  if (/^(BLOC\s+[A-Z0-9]{1,2}|WOD)$/i.test(head)) return { eyebrow: head, title: tail, subtitle: null };
  return { eyebrow: null, title: head, subtitle: tail };
}

const minutes = (s: number) => {
  const m = s / 60;
  return Number.isInteger(m) ? String(m) : m.toFixed(1).replace(".", ",");
};

type MetaBloc = {
  dureeMin: string | null;
  formatEntete: string | null;
  isWod: boolean;
  exercices: { notation: string | null; repos: string | null }[];
};

export function blocDuration(b: Pick<MetaBloc, "dureeMin">): string | null {
  const d = b.dureeMin?.match(/^\s*(\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?)/);
  return d ? `${d[1].replace(/\s+/g, "")} min` : null;
}

/** Structure du bloc : « 4 rounds · toutes les 3:00 », « 5 séries », « AMRAP 13 min »… ; null pour des mouvements indépendants. */
export function blocStructure(b: MetaBloc): string | null {
  if (b.isWod) {
    const p = parseWodFormat(b.formatEntete);
    if (p.kind === "emom") return `EMOM ${minutes(p.totalSeconds)} min`;
    if (p.kind === "interval") return `${p.totalRounds} rounds · toutes les ${formatClock(p.roundSeconds)}`;
    if (p.kind === "amrap") return `AMRAP ${minutes(p.totalSeconds)} min`;
    if (p.kind === "fortime") return p.capSeconds ? `For time · cap ${minutes(p.capSeconds)} min` : "For time";
    return null;
  }
  const plan = planBloc(
    b.formatEntete,
    b.exercices.map((e) => ({ repos: e.repos, sets: parseNotation(e.notation).sets })),
  );
  if (plan.kind === "interval") return `${plan.total} rounds · toutes les ${formatClock(plan.roundSeconds)}`;
  if (plan.kind === "sets") return `${plan.total} séries`;
  return null;
}

/** Lignes de contexte sous le titre : durée, puis structure. */
export function blocMeta(b: MetaBloc): string[] {
  return [blocDuration(b), blocStructure(b)].filter((x): x is string => !!x);
}

/** Nom du mouvement en titre, précisions du coach (« — tempo 30X1 », « (RX) ») en détail. */
export function splitMovement(nom: string): { title: string; detail: string | null } {
  const title = shortExerciceName(nom);
  const rest = nom.slice(title.length).replace(/^\s*[—–-]\s*/, "").trim();
  return { title, detail: rest || null };
}

/**
 * « 5 · 70% TM · R 2' » : répétitions, charge, repos — sans le « N× » dans les blocs
 * de travail (les séries sont sous le titre du bloc). Échauffement / mobilité
 * (`keepSets`) gardent la notation complète (« 2×10 »).
 */
export function prescription(
  e: { notation: string | null; charge: string | null; repos: string | null },
  opts: { keepSets?: boolean } = {},
): string {
  // « en superset avec le squat » n'est pas un repos : le regroupement est déjà montré par le filet de superset.
  const repos = e.repos && /super\s?set/i.test(e.repos) ? null : e.repos;
  return [opts.keepSets ? e.notation : parseNotation(e.notation).reps, e.charge, repos].filter(Boolean).join(" · ");
}

/**
 * Regroupe les mouvements d'un bloc comme ils s'enchaînent : tous ensemble à
 * chaque round (« Circuit »), en superset (« Superset · 5 séries »), ou un par
 * un. Un WOD n'est pas regroupé.
 */
export function movementGroups<T extends { notation: string | null; repos: string | null }>(
  formatEntete: string | null,
  exercices: T[],
  isWod = false,
): { label: string | null; items: T[] }[] {
  if (isWod || exercices.length === 0) return [{ label: null, items: exercices }];
  const plan = planBloc(
    formatEntete,
    exercices.map((e) => ({ repos: e.repos, sets: parseNotation(e.notation).sets })),
  );
  if (plan.kind === "interval") return [{ label: exercices.length > 1 ? `Circuit · ${plan.total} rounds` : null, items: exercices }];
  return restGroups(exercices).map((items) => ({
    label: items.length > 1 ? (plan.kind === "sets" ? `Superset · ${plan.total} séries` : "Superset") : null,
    items,
  }));
}
