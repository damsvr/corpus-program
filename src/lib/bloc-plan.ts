import { parseRestSeconds } from "@/lib/format";
import { restGroups } from "@/lib/rest-plan";
import { resolveBlocRounds } from "@/lib/wod-format";

type PlanExercice = { repos: string | null; sets: number };

/**
 * Comment un bloc de travail (non-WOD) se déroule à l'écran :
 * - interval : « N rounds, Every X:XX » / EMOM — un round démarre à heure fixe, tous les mouvements à chaque round ;
 * - sets : « N séries de » un même enchaînement (un mouvement ou un superset), repos entre les séries ;
 * - sequence : mouvements indépendants, chacun avec ses propres séries (montée en charge, séries droites mixtes).
 */
export type BlocPlan =
  | { kind: "interval"; total: number; roundSeconds: number }
  | { kind: "sets"; total: number; restSeconds: number | null }
  | { kind: "sequence" };

export function planBloc(formatEntete: string | null | undefined, exercices: PlanExercice[]): BlocPlan {
  const rounds = resolveBlocRounds(formatEntete);
  if (rounds.totalRounds > 0 && rounds.restSeconds) {
    return { kind: "interval", total: rounds.totalRounds, roundSeconds: rounds.restSeconds };
  }
  const groups = restGroups(exercices.map((e) => ({ ...e, repos: e.repos })));
  if (groups.length === 1 && groups[0][0].sets > 1) {
    return { kind: "sets", total: groups[0][0].sets, restSeconds: parseRestSeconds(groups[0][0].repos) };
  }
  return { kind: "sequence" };
}
