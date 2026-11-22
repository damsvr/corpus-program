"use client";

import { useEffect, useState } from "react";
import { MovementThumb } from "@/components/video-button";
import { Note } from "@/components/note";
import { useVariant } from "@/components/variant";
import { prescription as buildPrescription, splitMovement } from "@/lib/bloc-view";
import { applyVariant, hasVariants } from "@/lib/variants";
import { extractLevels, type Level } from "@/lib/levels";

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
  hideLabel,
  note,
  children,
}: {
  ex: CardExercice;
  /** Notation complète (« 2×10 ») : échauffement, mobilité, WOD. */
  keepSets?: boolean;
  /** Repère « 2 — » déjà montré par la partie qui contient la carte. */
  hideLabel?: boolean;
  note?: string | null;
  children?: React.ReactNode;
}) {
  const { mode, setMode } = useVariant();
  const variants = hasVariants(ex);
  // Bascule locale à cet exercice ; se réaligne quand le choix global change.
  const [override, setOverride] = useState<typeof mode | null>(null);
  useEffect(() => setOverride(null), [mode]);
  const active = override ?? mode;
  const shown = variants ? applyVariant(ex, active) : ex;
  // Niveaux N3 / N2 / N1 : options à choisir entre elles, jamais à enchaîner.
  const leveled = extractLevels(shown, note);
  const view = leveled ? { ...shown, ...leveled.ex } : shown;
  const cardNote = leveled ? leveled.note : note;
  const nom = view.nom;
  const { label, title, detail } = splitMovement(nom);
  const prescription = buildPrescription(view, { keepSets });
  // Répétitions en accent, charge / repos en retrait (la charge peut être un long texte du coach).
  const [lead, ...restParts] = (prescription ?? "").split(" · ");
  const rest = restParts.join(" · ");
  return (
    <div className="flex overflow-hidden rounded-2xl border border-line bg-card2/70">
      <MovementThumb nom={nom} className="w-[5.25rem] shrink-0 self-stretch sm:w-28" />
      <div className="min-w-0 flex-1 px-3.5 py-3">
        {label && !hideLabel && <p className="eyebrow !text-brand">{label}</p>}
        <p className="text-[1.05rem] font-extrabold uppercase leading-tight tracking-[0.01em]">{title}</p>
        {lead && (
          <p className="mt-1 leading-snug">
            {/* Répétitions : aussi visibles que le nom du mouvement. */}
            <span className="text-[1.05rem] font-extrabold uppercase tracking-[0.01em] text-accent">{bareCount(lead)}</span>
            {rest && <span className="text-[0.8rem] text-white/70"> · {rest}</span>}
          </p>
        )}
        {detail && <p className="mt-1 text-[0.76rem] italic leading-snug text-muted">{detail}</p>}
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
        {leveled && <LevelPicker levels={leveled.levels} />}
        {cardNote && <Note text={cardNote} inline />}
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

/** « 10 » seul ne dit pas ce qu'on compte : « 10 reps ». */
const bareCount = (lead: string) => (/^\d+(?:\s*[-–]\s*\d+)?$/.test(lead.trim()) ? `${lead.trim()} reps` : lead);

const LEVEL_HINT: Record<Level["n"], string> = {
  3: "prioritaire",
  2: "si le niveau 3 est trop dur",
  1: "le plus accessible",
};

/** « Choisis UN niveau » : N3 (prioritaire), N2, N1 sont des options, pas des mouvements à faire tous. */
function LevelPicker({ levels }: { levels: Level[] }) {
  const [chosen, setChosen] = useState<Level["n"]>(levels[0].n);
  return (
    <div className="mt-2.5" role="radiogroup" aria-label="Niveau au choix">
      <p className="eyebrow mb-1.5 !text-accent">Choisis UN niveau — pas les trois</p>
      <div className="space-y-1.5">
        {levels.map((l) => {
          const on = l.n === chosen;
          return (
            <button
              key={l.n}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setChosen(l.n)}
              className={`flex w-full items-start gap-2.5 rounded-xl border px-3 py-2 text-left ${
                on ? "border-accent bg-accent/10" : "border-line opacity-60"
              }`}
            >
              <span
                aria-hidden
                className={`mt-1 size-3.5 shrink-0 rounded-full border-2 ${on ? "border-accent bg-accent" : "border-white/40"}`}
              />
              <span className="min-w-0">
                <span className="block text-[0.64rem] font-bold uppercase tracking-[0.12em] text-brand">
                  Niveau {l.n} · {LEVEL_HINT[l.n]}
                </span>
                <span className="block text-[0.82rem] leading-snug">{l.text || "—"}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
