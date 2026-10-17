"use client";

import { useEffect, useRef, useState } from "react";
import { parseNotation } from "@/lib/format";
import type { BlocPlan } from "@/lib/bloc-plan";
import { formatClock } from "@/lib/wod-format";
import type { RunnerBloc, RunnerExercice, SetState } from "./runner";
import { REST_GRACE_MS, RestTimer, usePressGuard, type Rest } from "./timers";

type RunPlan = Extract<BlocPlan, { kind: "sets" | "interval" }>;

const bigBtn = "grad-accent w-full rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black";
const linkBtn = "text-[0.68rem] uppercase tracking-[0.12em] text-muted/80 underline-offset-4 hover:underline";
const smallInput =
  "w-16 rounded-lg border border-line bg-bg/60 px-2 py-2 text-center text-sm outline-none focus:border-brand";

/**
 * Bloc de travail présenté comme sur les notes du coach : « 4 séries de : »,
 * la liste des mouvements, un gros « Démarrer », puis un gros chrono avec
 * « Série x / 4 » et le rappel des mouvements. Pas de chrono par mouvement.
 */
export function BlocRun({
  bloc,
  plan,
  now,
  state,
  update,
  markDone,
}: {
  bloc: RunnerBloc;
  plan: RunPlan;
  now: number;
  state: Record<string, SetState[]>;
  update: (id: string, i: number, patch: Partial<SetState>) => void;
  markDone: (ids: string[], from: number, to: number, done: boolean) => void;
}) {
  const guard = usePressGuard();
  const ids = bloc.exercices.map((e) => e.id);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  // sets : série en cours (0-based) ; fin du bloc ; repos entre séries.
  const [setIndex, setSetIndex] = useState(0);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [rest, setRest] = useState<Rest | null>(null);

  const elapsed = startedAt === null ? 0 : Math.max(0, ((finishedAt ?? now) - startedAt) / 1000);

  // interval : le round courant découle de l'horloge ; les rounds écoulés sont validés au passage.
  const intervalRound =
    plan.kind === "interval" ? Math.min(plan.total - 1, Math.floor(elapsed / plan.roundSeconds)) : 0;
  const intervalOver = plan.kind === "interval" && startedAt !== null && elapsed >= plan.total * plan.roundSeconds;
  const applied = useRef(0);
  useEffect(() => {
    if (plan.kind !== "interval" || startedAt === null) return;
    const target = intervalOver ? plan.total : intervalRound;
    if (target > applied.current) {
      markDone(ids, applied.current, target, true);
      applied.current = target;
    }
  }, [plan, startedAt, intervalOver, intervalRound]); // eslint-disable-line react-hooks/exhaustive-deps

  const started = startedAt !== null;
  const finished = plan.kind === "sets" ? finishedAt !== null : intervalOver;
  const current = plan.kind === "sets" ? setIndex : intervalRound;

  const start = () => {
    applied.current = 0;
    setSetIndex(0);
    setFinishedAt(null);
    setRest(null);
    setStartedAt(Date.now());
  };

  const reset = () => {
    markDone(ids, 0, plan.total, false);
    applied.current = 0;
    setStartedAt(null);
    setSetIndex(0);
    setFinishedAt(null);
    setRest(null);
  };

  const finishSet = () => {
    if (plan.kind !== "sets") return;
    markDone(ids, setIndex, setIndex + 1, true);
    if (setIndex >= plan.total - 1) {
      setFinishedAt(Date.now());
      setRest(null);
      return;
    }
    setSetIndex(setIndex + 1);
    setRest(
      plan.restSeconds
        ? {
            endsAt: Date.now() + plan.restSeconds * 1000,
            setIndex,
            title: `Repos · série ${setIndex + 1} / ${plan.total}`,
            next: `Prochaine : série ${setIndex + 2} / ${plan.total}`,
          }
        : null,
    );
  };

  const previousSet = () => {
    if (plan.kind !== "sets") return;
    const back = finishedAt !== null ? plan.total - 1 : setIndex - 1;
    if (back < 0) return;
    markDone(ids, back, back + 1, false);
    setSetIndex(back);
    setFinishedAt(null);
    setRest(null);
  };

  const visibleRest = rest && now < rest.endsAt + REST_GRACE_MS ? rest : null;

  const heading =
    plan.kind === "sets"
      ? `${plan.total} séries de :`
      : `${plan.total} rounds · un toutes les ${formatClock(plan.roundSeconds)} :`;

  let clock = elapsed;
  let label = "";
  if (plan.kind === "sets") {
    label = finished ? "Bloc terminé ✓" : `Série ${setIndex + 1} / ${plan.total}`;
  } else if (finished) {
    clock = plan.total * plan.roundSeconds;
    label = "Bloc terminé ✓";
  } else {
    clock = plan.roundSeconds - (Math.floor(elapsed) % plan.roundSeconds);
    label = `Round ${intervalRound + 1} / ${plan.total}`;
  }

  return (
    <div className="mt-4 space-y-4">
      <p className="eyebrow !text-accent">{heading}</p>

      {started && (
        <div
          className={`rounded-3xl border p-5 text-center ${
            finished ? "border-brand/50 bg-brand/10" : "border-accent/40 bg-accent/10"
          }`}
        >
          <p className={`font-mono text-6xl font-extrabold tabular-nums ${finished ? "text-brand" : "text-accent"}`}>
            {formatClock(clock)}
          </p>
          <p className={`mt-2 text-xs font-bold uppercase tracking-[0.16em] ${finished ? "text-brand" : "text-accent"}`}>
            {label}
          </p>
          {plan.kind === "interval" && !finished && (
            <p className="mt-1 text-[0.72rem] text-muted">
              {intervalRound + 1 < plan.total ? "avant le round suivant" : "avant la fin du bloc"}
            </p>
          )}
          {plan.kind === "sets" && !finished && (
            <button type="button" onClick={guard(finishSet)} className={`${bigBtn} mt-4`}>
              Série terminée
            </button>
          )}
          <div className="mt-3 flex items-center justify-center gap-5">
            {plan.kind === "sets" && (setIndex > 0 || finished) && (
              <button type="button" onClick={guard(previousSet)} className={linkBtn}>
                Série précédente
              </button>
            )}
            <button type="button" onClick={guard(reset)} className={linkBtn}>
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {visibleRest && <RestTimer rest={visibleRest} now={now} onSkip={() => setRest(null)} />}

      <ul className="space-y-4">
        {bloc.exercices.map((e) => (
          <Movement
            key={e.id}
            e={e}
            slot={started && !finished ? state[e.id]?.[current] : undefined}
            onChange={(patch) => update(e.id, current, patch)}
            setNumber={current + 1}
          />
        ))}
      </ul>

      {!started && (
        <button type="button" onClick={guard(start)} className={bigBtn}>
          Démarrer
        </button>
      )}
    </div>
  );
}

/** Un mouvement : répétitions à gauche (« 3 », « 5/jambe », « 20'' »), nom, charge ; kg/reps de la série en cours une fois lancé. */
function Movement({
  e,
  slot,
  onChange,
  setNumber,
}: {
  e: RunnerExercice;
  slot: SetState | undefined;
  onChange: (patch: Partial<SetState>) => void;
  setNumber: number;
}) {
  const reps = parseNotation(e.notation).reps;
  const hasWeight = !!e.charge?.trim();
  const hasReps = e.defaultReps !== null;
  return (
    <li className="flex gap-3">
      <span
        className={`w-[4.75rem] shrink-0 pt-0.5 text-right font-extrabold leading-tight text-accent ${
          reps.length > 4 ? "text-sm" : "text-base"
        }`}
      >
        {reps || "·"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.95rem] font-medium leading-snug">{e.nom}</p>
        {e.charge && <p className="mt-0.5 text-[0.72rem] uppercase tracking-[0.08em] text-muted">{e.charge}</p>}
        {e.note && <p className="mt-0.5 text-[0.78rem] text-muted">{e.note}</p>}
        {slot && (hasWeight || hasReps) && (
          <div className="mt-2 flex items-center gap-2">
            {hasWeight && (
              <input
                aria-label={`Charge série ${setNumber} — ${e.nom}`}
                inputMode="decimal"
                placeholder="kg"
                value={slot.kg}
                onChange={(ev) => onChange({ kg: ev.target.value })}
                className={smallInput}
              />
            )}
            {hasReps && (
              <input
                aria-label={`Répétitions série ${setNumber} — ${e.nom}`}
                inputMode="numeric"
                placeholder="reps"
                value={slot.reps}
                onChange={(ev) => onChange({ reps: ev.target.value })}
                className={smallInput}
              />
            )}
          </div>
        )}
      </div>
    </li>
  );
}
