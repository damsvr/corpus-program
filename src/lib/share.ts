export type Pattern = "force" | "gym" | "halterophilie" | "autre";

export const PATTERN_LABEL: Record<Pattern, string> = {
  force: "Force",
  gym: "Gym",
  halterophilie: "Haltérophilie",
  autre: "Autre",
};

// Le partage affiche « Hyrox » pour le profil Hybrid.
export const SHARE_PROFILE_LABEL = { CROSSFIT: "CrossFit", HYBRID: "Hyrox", FUNCTIONAL: "Functional" } as const;

export const SHARE_ACCENT = { CROSSFIT: "#f0454f", HYBRID: "#f7b90f", FUNCTIONAL: "#fa8225" } as const;

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/** Pattern du jour d'après le préfixe du titre ("FORCE ET MUSCULATION — BACK SQUAT" -> force). */
export function detectPattern(titre: string): Pattern {
  const head = stripAccents(titre.split(/[—–]/)[0]).toLowerCase();
  if (head.includes("halter")) return "halterophilie";
  if (head.includes("gym")) return "gym";
  if (head.includes("force") || head.includes("muscu")) return "force";
  return "autre";
}

/** Partie du titre après le tiret ("… — BACK SQUAT" -> "BACK SQUAT"), sans le détail entre parenthèses. */
export function movementFromTitle(titre: string): string {
  const parts = titre.split(/[—–]/);
  const tail = (parts.length > 1 ? parts.slice(1).join(" — ") : parts[0]).replace(/\s*\(.*$/, "").trim();
  return tail;
}

// Équivalents métaboliques (MET) approximatifs — estimation, pas une mesure.
const MET: Record<Pattern, number> = { force: 5, gym: 4.5, halterophilie: 5.5, autre: 8 };
const DEFAULT_BODY_KG = 75;

/** kcal ≈ MET × poids (kg) × heures, arrondi à 5 kcal. */
export function estimateCalories(pattern: Pattern, minutes: number, bodyKg?: number | null): number {
  const kg = bodyKg && bodyKg > 0 ? bodyKg : DEFAULT_BODY_KG;
  const kcal = MET[pattern] * kg * (Math.max(0, minutes) / 60);
  return Math.round(kcal / 5) * 5;
}

/** 72 -> "1h12" ; 48 -> "48 min". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

type LoggedSet = { kg: number | null; reps: number | null; done: boolean };
export type LoggedExercice = { nom: string; sets: LoggedSet[] };

export type SetsSummary = {
  doneSets: number;
  totalReps: number;
  volumeKg: number;
  best: { nom: string; kg: number; reps: number | null } | null;
};

/** "Back squat — barre à vide" -> "Back squat" ; "Tirage (variante)" -> "Tirage". */
export function shortExerciceName(nom: string): string {
  return nom.split(/\s[—–-]\s|\s*\(/)[0].trim();
}

export function summarizeSets(logs: LoggedExercice[]): SetsSummary {
  let doneSets = 0;
  let totalReps = 0;
  let volumeKg = 0;
  let best: SetsSummary["best"] = null;
  for (const ex of logs) {
    for (const s of ex.sets) {
      if (!s.done) continue;
      doneSets += 1;
      totalReps += s.reps ?? 0;
      if (s.kg && s.reps) volumeKg += s.kg * s.reps;
      if (s.kg && s.kg > 0 && (!best || s.kg > best.kg || (s.kg === best.kg && (s.reps ?? 0) > (best.reps ?? 0)))) {
        best = { nom: shortExerciceName(ex.nom), kg: s.kg, reps: s.reps };
      }
    }
  }
  return { doneSets, totalReps, volumeKg: Math.round(volumeKg), best };
}

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

/** Jusqu'à 3 lignes de performance, choisies selon le pattern du jour. */
export function performanceLines(pattern: Pattern, s: SetsSummary, wodScore: string | null): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = [];
  const bestText = s.best ? `${s.best.nom} · ${nf.format(s.best.kg)} kg${s.best.reps ? ` × ${s.best.reps}` : ""}` : null;

  if ((pattern === "force" || pattern === "halterophilie") && bestText) {
    lines.push({ label: "Meilleure série", value: bestText });
    if (s.volumeKg > 0) lines.push({ label: "Volume", value: `${nf.format(s.volumeKg)} kg` });
  } else if (pattern === "gym" && s.totalReps > 0) {
    lines.push({ label: "Répétitions", value: nf.format(s.totalReps) });
    if (bestText) lines.push({ label: "Meilleure charge", value: bestText });
  } else if (bestText) {
    lines.push({ label: "Meilleure série", value: bestText });
  }
  if (s.doneSets > 0) lines.push({ label: "Séries validées", value: String(s.doneSets) });
  if (!wodScore) return lines.slice(0, 3);
  return [...lines.slice(0, 2), { label: "Score WOD", value: wodScore }];
}
