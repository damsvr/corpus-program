import type { BlocFull } from "@/lib/program";
import { BlocHeader } from "@/components/bloc-header";
import { ExerciseCard, ExerciseGroup } from "@/components/exercise-card";
import { movementGroups, prescription } from "@/lib/bloc-view";

/** Section de séance en lecture seule (page Programme). */
export function BlocCard({ bloc }: { bloc: BlocFull }) {
  const groups = movementGroups(bloc.formatEntete, bloc.exercices, bloc.isWod);
  return (
    <section className="border-t border-line pt-6">
      <BlocHeader bloc={bloc} />
      <div className="mt-4 space-y-4">
        {groups.map((g, i) => (
          <ExerciseGroup key={i} label={g.label}>
            {g.items.map((e) => (
              <ExerciseCard key={e.id} nom={e.nom} prescription={prescription(e)} note={e.note} />
            ))}
          </ExerciseGroup>
        ))}
      </div>
    </section>
  );
}
