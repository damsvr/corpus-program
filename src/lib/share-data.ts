import { db } from "@/lib/db";
import {
  detectPattern,
  estimateCalories,
  formatDuration,
  movementFromTitle,
  performanceLines,
  PATTERN_LABEL,
  SHARE_ACCENT,
  SHARE_PROFILE_LABEL,
  summarizeSets,
  type LoggedExercice,
} from "@/lib/share";

export type ShareData = {
  profileLabel: string;
  accent: string;
  patternLabel: string;
  movement: string;
  duration: string;
  calories: number;
  performance: { label: string; value: string }[];
  date: string;
};

/** Données affichées sur l'image de partage. Null si la séance n'existe pas, n'est pas à cet utilisateur ou n'est pas terminée. */
export async function loadShareData(userId: string, sessionId: string): Promise<ShareData | null> {
  const s = await db.sessionLog.findFirst({
    where: { id: sessionId, userId, endedAt: { not: null } },
    include: {
      day: { select: { titre: true, week: { select: { program: { select: { profile: true } } } } } },
      exerciceLogs: { include: { exercice: { select: { nom: true } } } },
    },
  });
  if (!s || !s.endedAt) return null;

  const prs = await db.prs.findUnique({ where: { userId }, select: { poidsDeCorpsKg: true } });
  const pattern = detectPattern(s.day.titre);
  const minutes = s.durationMin ?? Math.max(1, Math.round((s.endedAt.getTime() - s.startedAt.getTime()) / 60000));

  const logged: LoggedExercice[] = s.exerciceLogs.map((l) => ({
    nom: l.exercice.nom,
    sets: Array.isArray(l.sets) ? (l.sets as LoggedExercice["sets"]) : [],
  }));

  const profile = s.day.week.program.profile;
  return {
    profileLabel: SHARE_PROFILE_LABEL[profile],
    accent: SHARE_ACCENT[profile],
    patternLabel: PATTERN_LABEL[pattern],
    movement: movementFromTitle(s.day.titre),
    duration: formatDuration(minutes),
    calories: estimateCalories(pattern, minutes, prs?.poidsDeCorpsKg),
    performance: performanceLines(pattern, summarizeSets(logged), s.wodScore),
    date: s.endedAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
  };
}
