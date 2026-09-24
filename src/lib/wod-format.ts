/**
 * Interprète `format_entete` (texte libre écrit par l'agent) pour déterminer
 * quel type de chrono le WOD a besoin — EMOM / intervalles / AMRAP / for time.
 * Seuls les blocs WOD (isWod) passent par ici : les autres formats "Every X
 * min" (Bloc B/C, Complémentaire...) restent sur le mécanisme simple
 * valider-la-série → repos, déjà en place.
 */

export type WodProgram =
  | { kind: "emom"; totalSeconds: number; roundSeconds: number; totalRounds: number }
  | { kind: "interval"; totalSeconds: number; roundSeconds: number; totalRounds: number }
  | { kind: "amrap"; totalSeconds: number }
  | { kind: "fortime"; capSeconds: number | null }
  | { kind: "unknown" };

function toSeconds(min: string, sec?: string): number {
  return parseInt(min, 10) * 60 + (sec ? parseInt(sec, 10) : 0);
}

export function parseWodFormat(formatEntete: string | null | undefined): WodProgram {
  const text = (formatEntete ?? "").toLowerCase();
  if (!text) return { kind: "unknown" };

  if (/\bemom\b/.test(text)) {
    const totalMin = text.match(/emom\s*(\d+)\s*'/)?.[1];
    const roundsExplicit = text.match(/\((\d+)\s*rounds?/)?.[1];
    const totalMinutes = totalMin ? parseInt(totalMin, 10) : roundsExplicit ? parseInt(roundsExplicit, 10) : null;
    if (totalMinutes) {
      const totalRounds = roundsExplicit ? parseInt(roundsExplicit, 10) : totalMinutes;
      return { kind: "emom", totalSeconds: totalMinutes * 60, roundSeconds: 60, totalRounds };
    }
  }

  // "Every 3:30 x 4 rounds" ou "4 rounds, Every 3:00" — les deux ordres apparaissent.
  const everyA = text.match(/every\s+(\d+):(\d{2})\s*x\s*(\d+)\s*rounds?/);
  const everyB = text.match(/(\d+)\s*rounds?,\s*every\s+(\d+):(\d{2})/);
  if (everyA) {
    const roundSeconds = toSeconds(everyA[1], everyA[2]);
    const totalRounds = parseInt(everyA[3], 10);
    return { kind: "interval", roundSeconds, totalRounds, totalSeconds: roundSeconds * totalRounds };
  }
  if (everyB) {
    const totalRounds = parseInt(everyB[1], 10);
    const roundSeconds = toSeconds(everyB[2], everyB[3]);
    return { kind: "interval", roundSeconds, totalRounds, totalSeconds: roundSeconds * totalRounds };
  }

  if (/\bamrap\b/.test(text)) {
    const m = text.match(/amrap\s*(\d+)\s*'/);
    if (m) return { kind: "amrap", totalSeconds: parseInt(m[1], 10) * 60 };
  }

  if (/\bfor time\b/.test(text)) {
    const cap = text.match(/cap\s*(\d+)\s*'/)?.[1];
    return { kind: "fortime", capSeconds: cap ? parseInt(cap, 10) * 60 : null };
  }

  return { kind: "unknown" };
}

/** "score = rounds + reps" -> "rounds + reps" (pour le placeholder de saisie). */
export function extractScoreHint(formatEntete: string | null | undefined): string | null {
  if (!formatEntete) return null;
  const m = formatEntete.match(/score\s*=\s*([^—-]+)/i);
  return m ? m[1].trim().replace(/\.$/, "") : null;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
