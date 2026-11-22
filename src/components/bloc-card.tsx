import type { BlocFull } from "@/lib/program";
import { BlocHeader } from "@/components/bloc-header";
import { ExerciseCard, ExerciseGroup } from "@/components/exercise-card";
import { ExerciseParts } from "@/components/exercise-parts";
import { classifyBloc } from "@/lib/format";
import { exerciseParts, movementGroups } from "@/lib/bloc-view";
import { personalizeCharge, type PrValues } from "@/lib/load-calc";

const hasParts = (ex: { nom: string }[]) => exerciseParts(ex)[0].part !== null;

/** Section de séance en lecture seule (page Programme). */
export function BlocCard({ bloc, prs = null }: { bloc: BlocFull; prs?: PrValues | null }) {
  // Charges en % TM / % PDC : ajoute les kg de l'athlète quand ses PR sont connus.
  const exercices = bloc.exercices.map((e) => ({ ...e, charge: personalizeCharge(e.nom, e.charge, prs).text || e.charge }));
  const kind = classifyBloc(bloc.nom, bloc.isWod);
  const informational = kind === "echauffement" || kind === "mobilite";
  // Échauffement, mobilité et WOD gardent « 2×10 » ; les blocs de travail montrent les séries sous le titre.
  const keepSets = kind !== "travail";
  const groups = movementGroups(bloc.formatEntete, exercices, bloc.isWod);
  return (
    <section className="border-t border-line pt-6">
      <BlocHeader bloc={bloc} />
      <div className="mt-4 space-y-4">
        {informational ? (
          <ExerciseParts
            exercices={exercices}
            renderItem={(e) => <ExerciseCard key={e.id} ex={e} keepSets hideLabel={hasParts(exercices)} note={e.note} />}
          />
        ) : (
          groups.map((g, i) => (
            <ExerciseGroup key={i} label={g.label}>
              {g.items.map((e) => (
                <ExerciseCard key={e.id} ex={e} keepSets={keepSets} note={e.note} />
              ))}
            </ExerciseGroup>
          ))
        )}
      </div>
    </section>
  );
}
