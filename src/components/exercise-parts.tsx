import { exerciseParts } from "@/lib/bloc-view";

/**
 * Échauffement / mobilité découpés en parties lisibles (« PARTIE 1 », « PARTIE 2 »)
 * quand le coach numérote ses mouvements ; sinon une simple liste.
 */
export function ExerciseParts<T extends { id: string; nom: string }>({
  exercices,
  renderItem,
}: {
  exercices: T[];
  renderItem: (e: T) => React.ReactNode;
}) {
  const parts = exerciseParts(exercices);
  return (
    <div className="space-y-5">
      {parts.map((g, i) => (
        <div key={i} className={g.part ? "rounded-3xl border border-line/80 bg-bg/40 p-3" : undefined}>
          {g.part && (
            <p className="mb-2.5 flex items-center gap-2 px-1 text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-brand">
              <span className="grid size-6 place-items-center rounded-full bg-brand/15 text-[0.75rem]">{g.part}</span>
              Partie {g.part}
              <span className="h-px flex-1 bg-line" />
            </p>
          )}
          <div className="space-y-2.5">{g.items.map((e) => renderItem(e))}</div>
        </div>
      ))}
    </div>
  );
}
