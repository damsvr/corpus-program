/**
 * Niveaux d'un mouvement écrits par le coach dans la notation ou la note :
 * « N3 : 5 strict / N2 : 5 avec élastique / N1 : ring row ». N3 est le mouvement
 * prioritaire ; N2 et N1 sont des options plus accessibles — l'athlète en choisit
 * UNE, il ne les fait pas toutes.
 */

export type Level = { n: 3 | 2 | 1; text: string };

type Fields = { notation: string | null; charge: string | null; repos: string | null };

export type Leveled<T extends Fields> = {
  levels: Level[];
  /** Le mouvement sans le texte des niveaux (reste : séries, charge commune…). */
  ex: T;
  note: string | null;
};

const TOKEN = /(^|[\s(;,/|—–·-])N([123])(?![\w])\s*[:=)—–.-]?\s*/g;
const TRAILING = /[\s/;,|—–·:(-]+$/;

function cleanSegment(s: string): string {
  let t = s.replace(TRAILING, "").trim();
  // « … (N1 : ring row) » : parenthèse fermante orpheline.
  while (t.endsWith(")") && (t.match(/\)/g) ?? []).length > (t.match(/\(/g) ?? []).length) t = t.slice(0, -1).trim();
  return t;
}

/** Sépare un texte en {préambule, niveaux}. */
function splitField(text: string): { rest: string; levels: Level[] } {
  const hits = [...text.matchAll(TOKEN)];
  if (!hits.length) return { rest: text, levels: [] };
  const levels: Level[] = hits.map((h, i) => {
    const from = (h.index ?? 0) + h[0].length;
    const to = i + 1 < hits.length ? (hits[i + 1].index ?? text.length) : text.length;
    return { n: Number(h[2]) as Level["n"], text: cleanSegment(text.slice(from, to)) };
  });
  const head = cleanSegment(text.slice(0, hits[0].index ?? 0)).replace(/^niveaux?\s*$/i, "").replace(/\bniveaux?\s*$/i, "").trim();
  return { rest: head.replace(TRAILING, "").trim(), levels };
}

/** Niveaux N3 / N2 / N1 présents dans la notation, la charge, le repos ou la note (au moins deux, sinon rien). */
export function extractLevels<T extends Fields>(ex: T, note: string | null | undefined): Leveled<T> | null {
  const merged = new Map<number, string[]>();
  const out = { ...ex };
  let outNote: string | null = note ?? null;
  const fields: ("notation" | "charge" | "repos")[] = ["notation", "charge", "repos"];
  const take = (text: string): string => {
    const { rest, levels } = splitField(text);
    for (const l of levels) merged.set(l.n, [...(merged.get(l.n) ?? []), l.text].filter(Boolean));
    return rest;
  };
  for (const f of fields) {
    const v = ex[f];
    if (v) (out as Fields)[f] = take(v) || null;
  }
  if (outNote) outNote = take(outNote) || null;
  if (merged.size < 2) return null;
  const levels = ([3, 2, 1] as const)
    .filter((n) => merged.has(n))
    .map((n) => ({ n, text: (merged.get(n) ?? []).join(" · ") }));
  return { levels, ex: out, note: outNote };
}

/** Notation sans le texte des niveaux : « 4× — N3 : 5 strict / N2 : 6 banded » → « 4× » (pour compter séries et reps). */
export function stripLevels(text: string): string {
  const { rest, levels } = splitField(text);
  return new Set(levels.map((l) => l.n)).size >= 2 ? rest : text;
}
