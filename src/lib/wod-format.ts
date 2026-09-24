/**
 * Interprète `format_entete` (texte libre écrit par l'agent) pour déterminer
 * quel type de chrono un bloc a besoin — EMOM / intervalles / AMRAP / for
 * time. Sert aux blocs WOD (chrono dédié, cf. wod-clock.tsx) mais aussi aux
 * blocs de travail non-WOD structurés en rounds ("4 rounds, Every 3:00",
 * "EMOM 14'"...) via `resolveBlocRounds`, pour dériver le nombre de séries
 * du bloc et la durée de repos automatique entre rounds.
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

/**
 * Nombre de séries d'un bloc de travail (non-WOD) et repos automatique
 * entre chacune — dérivés de `format_entete` quand il décrit une structure
 * en rounds (EMOM / "N rounds, Every X:XX"). `totalRounds: 0` signale
 * l'absence de structure en rounds : l'appelant retombe sur le nombre de
 * séries propre à chaque exercice (notation "N×M").
 */
export function resolveBlocRounds(formatEntete: string | null | undefined): { totalRounds: number; restSeconds: number | null } {
  const program = parseWodFormat(formatEntete);
  if (program.kind === "interval" || program.kind === "emom") {
    return { totalRounds: program.totalRounds, restSeconds: program.roundSeconds };
  }
  return { totalRounds: 0, restSeconds: null };
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
