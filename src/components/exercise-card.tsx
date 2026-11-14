"use client";

import { useEffect, useState } from "react";
import { MovementThumb } from "@/components/video-button";
import { Note } from "@/components/note";
import { useVariant } from "@/components/variant";
import { prescription as buildPrescription, splitMovement } from "@/lib/bloc-view";
import { applyVariant, hasVariants } from "@/lib/variants";

export type CardExercice = { nom: string; notation: string | null; charge: string | null; repos: string | null };

/**
 * Un mouvement, façon carte : vignette vidéo à gauche, nom en capitales,
 * prescription (reps · charge · repos) dessous. Quand le coach écrit une
 * variante « (RX) / (scaled) », l'athlète bascule d'une version à l'autre
 * (↔) ; son choix par défaut est retenu pour toute la séance.
 * `children` accueille ce qui est propre à l'écran (saisie kg/reps, chrono…).
 */
export function ExerciseCard({
  ex,
  keepSets,
  note,
  children,
}: {
  ex: CardExercice;
  /** Notation complète (« 2×10 ») : échauffement, mobilité, WOD. */
  keepSets?: boolean;
  note?: string | null;
  children?: React.ReactNode;
}) {
  const { mode, setMode } = useVariant();
  const variants = hasVariants(ex);
  // Bascule locale à cet exercice ; se réaligne quand le choix global change.
  const [override, setOverride] = useState<typeof mode | null>(null);
  useEffect(() => setOverride(null), [mode]);
  const active = override ?? mode;
  const view = variants ? applyVariant(ex, active) : ex;
  const nom = view.nom;
  const { title, detail } = splitMovement(nom);
  const prescription = buildPrescription(view, { keepSets });
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
        {variants && (
          <button
            type="button"
            onClick={() => {
              const next = active === "rx" ? "scaled" : "rx";
              setOverride(next);
              setMode(next);
            }}
            aria-label={`Passer en version ${active === "rx" ? "scaled" : "RX"} : ${title}`}
            className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-accent/50 px-2.5 py-1 text-[0.64rem] font-bold uppercase tracking-[0.1em] text-accent"
          >
            <span aria-hidden>↔</span>
            {active === "rx" ? "RX · voir scaled" : "Scaled · voir RX"}
          </button>
        )}
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
