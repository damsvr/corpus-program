import { MovementThumb } from "@/components/video-button";
import { Note } from "@/components/note";
import { splitMovement } from "@/lib/bloc-view";

/**
 * Un mouvement, façon carte : vignette vidéo à gauche, nom en capitales,
 * prescription (reps · charge · repos) dessous. `children` accueille ce qui
 * est propre à l'écran (saisie kg/reps, chrono de tenue…).
 */
export function ExerciseCard({
  nom,
  prescription,
  note,
  children,
}: {
  nom: string;
  prescription?: string;
  note?: string | null;
  children?: React.ReactNode;
}) {
  const { title, detail } = splitMovement(nom);
  // Répétitions en accent, charge / repos en retrait (la charge peut être un long texte du coach).
  const [lead, ...restParts] = (prescription ?? "").split(" · ");
  const rest = restParts.join(" · ");
  return (
    <div className="flex overflow-hidden rounded-2xl border border-line bg-card2/70">
      <MovementThumb nom={nom} className="w-[5.25rem] shrink-0 self-stretch sm:w-28" />
      <div className="min-w-0 flex-1 px-3.5 py-3">
        <p className="text-[0.92rem] font-bold uppercase leading-snug tracking-[0.01em]">{title}</p>
        {lead && (
          <p className="mt-0.5 text-[0.8rem] leading-snug">
            <span className="font-bold text-accent">{lead}</span>
            {rest && <span className="text-white/70"> · {rest}</span>}
          </p>
        )}
        {detail && <p className="mt-0.5 text-[0.76rem] leading-snug text-muted">{detail}</p>}
        {note && <Note text={note} inline />}
        {children}
      </div>
    </div>
  );
}

/** Mouvements enchaînés (superset / circuit) : filet d'accent à gauche et libellé. */
export function ExerciseGroup({ label, children }: { label?: string | null; children: React.ReactNode }) {
  if (!label) return <div className="space-y-2.5">{children}</div>;
  return (
    <div className="border-l-2 border-accent/60 pl-3">
      <p className="eyebrow mb-2 !text-accent">{label}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}
