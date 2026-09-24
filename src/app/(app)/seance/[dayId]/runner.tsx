"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { finishSession } from "../actions";
import { parseRestSeconds } from "@/lib/format";

export type RunnerExercice = {
  id: string;
  nom: string;
  notation: string | null;
  charge: string | null;
  repos: string | null;
  note: string | null;
  sets: number;
  defaultReps: number | null;
};
export type RunnerBloc = {
  id: string;
  nom: string;
  dureeMin: string | null;
  formatEntete: string | null;
  note: string | null;
  exercices: RunnerExercice[];
};

type SetState = { kg: string; reps: string; done: boolean };
type RestState = { endsAt: number; setIndex: number };

const num = (s: string): number | null => {
  const v = parseFloat(s.replace(",", "."));
  return Number.isFinite(v) ? v : null;
};

function RestTimer({
  endsAt,
  now,
  setIndex,
  totalSets,
  nextLabel,
  onSkip,
}: {
  endsAt: number;
  now: number;
  setIndex: number;
  totalSets: number;
  nextLabel: string;
  onSkip: () => void;
}) {
  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return (
    <div className="mt-3 rounded-2xl border border-accent/40 bg-accent/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent">
            Repos · série {setIndex + 1} / {totalSets}
          </p>
          <p className="mt-1 text-[0.75rem] text-muted">
            Prochaine : série {setIndex + 2} / {totalSets}
            {nextLabel ? ` · ${nextLabel}` : ""}
          </p>
        </div>
        <span className="font-mono text-3xl font-bold tabular-nums text-accent">
          {mm}:{ss}
        </span>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="mt-3 w-full rounded-full border border-accent/40 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent"
      >
        Passer le repos
      </button>
    </div>
  );
}

export function SessionRunner({
  dayId,
  module,
  blocs,
}: {
  dayId: string;
  module: "CHARGE" | "VOLUME" | "MOTEUR" | null;
  blocs: RunnerBloc[];
}) {
  const router = useRouter();
  const startedAt = useMemo(() => Date.now(), []);
  const [now, setNow] = useState(startedAt);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<Record<string, SetState[]>>(() =>
    Object.fromEntries(
      blocs.flatMap((b) =>
        b.exercices.map((e) => [
          e.id,
          Array.from({ length: e.sets }, () => ({ kg: "", reps: e.defaultReps ? String(e.defaultReps) : "", done: false })),
        ]),
      ),
    ),
  );

  const [rest, setRest] = useState<Record<string, RestState | undefined>>({});

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Purge les repos écoulés pour ne pas garder un état obsolète.
  useEffect(() => {
    setRest((r) => {
      const next: typeof r = {};
      let changed = false;
      for (const [id, v] of Object.entries(r)) {
        if (v && v.endsAt > now) next[id] = v;
        else changed = true;
      }
      return changed ? next : r;
    });
  }, [now]);

  const elapsed = Math.floor((now - startedAt) / 1000);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const total = Object.values(state).reduce((a, s) => a + s.length, 0);
  const doneCount = Object.values(state).reduce((a, s) => a + s.filter((x) => x.done).length, 0);

  const update = (id: string, i: number, patch: Partial<SetState>) =>
    setState((s) => ({ ...s, [id]: s[id].map((x, j) => (j === i ? { ...x, ...patch } : x)) }));

  const toggleDone = (ex: RunnerExercice, i: number) => {
    const wasDone = state[ex.id][i].done;
    update(ex.id, i, { done: !wasDone });
    if (!wasDone) {
      const restSeconds = parseRestSeconds(ex.repos);
      const isLastSet = i === ex.sets - 1;
      if (restSeconds && !isLastSet) {
        setRest((r) => ({ ...r, [ex.id]: { endsAt: Date.now() + restSeconds * 1000, setIndex: i } }));
      }
    } else {
      setRest((r) => {
        const cur = r[ex.id];
        if (!cur || cur.setIndex !== i) return r;
        const { [ex.id]: _drop, ...next } = r;
        return next;
      });
    }
  };

  const finish = () =>
    start(async () => {
      setError(null);
      const res = await finishSession({
        dayId,
        module,
        startedAt,
        logs: Object.entries(state).map(([exerciceId, sets]) => ({
          exerciceId,
          sets: sets.map((x) => ({ kg: num(x.kg), reps: num(x.reps), done: x.done })),
        })),
      });
      if (res.ok) router.push("/historique");
      else setError(res.error ?? "Erreur");
    });

  const input =
    "w-16 rounded-lg border border-line bg-bg/70 px-2 py-2 text-center text-sm outline-none focus:border-brand";

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-30 -mx-5 flex items-center justify-between border-b border-line bg-bg/95 px-5 py-3 backdrop-blur">
        <span className="font-mono text-2xl font-bold tabular-nums text-brand">
          {mm}:{ss}
        </span>
        <span className="eyebrow">
          {doneCount} / {total} séries
        </span>
      </div>

      {blocs.map((b) => (
        <section key={b.id} className="rounded-3xl border border-line bg-card p-5">
          <h3 className="flex items-start gap-3 text-base font-bold uppercase">
            <span className="grad-accent mt-1 h-5 w-1 shrink-0 rounded-full" />
            <span>
              {b.nom}
              {b.dureeMin && <span className="text-muted"> ({b.dureeMin}&apos;)</span>}
            </span>
          </h3>
          {b.formatEntete && <p className="mt-3 rounded-xl bg-bg/60 px-3 py-2 text-sm">{b.formatEntete}</p>}
          {b.note && <p className="mt-2 rounded-xl bg-brand/10 px-3 py-2 text-[0.8rem] text-brand">{b.note}</p>}
          <div className="mt-4 space-y-5">
            {b.exercices.map((e) => (
              <div key={e.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[0.95rem] font-medium">{e.nom}</span>
                  <span className="text-right text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                    {[e.notation, e.charge, e.repos].filter(Boolean).join(" · ")}
                  </span>
                </div>
                {e.note && <p className="mt-1 text-[0.78rem] text-muted">{e.note}</p>}
                <ul className="mt-2 space-y-2">
                  {state[e.id].map((s, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-6 text-xs text-muted">{i + 1}</span>
                      <input
                        aria-label={`Charge série ${i + 1}`}
                        inputMode="decimal"
                        placeholder="kg"
                        value={s.kg}
                        onChange={(ev) => update(e.id, i, { kg: ev.target.value })}
                        className={input}
                      />
                      <input
                        aria-label={`Répétitions série ${i + 1}`}
                        inputMode="numeric"
                        placeholder="reps"
                        value={s.reps}
                        onChange={(ev) => update(e.id, i, { reps: ev.target.value })}
                        className={input}
                      />
                      <button
                        type="button"
                        aria-pressed={s.done}
                        onClick={() => toggleDone(e, i)}
                        className={`ml-auto rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] ${
                          s.done ? "grad-accent text-black" : "border border-line text-muted"
                        }`}
                      >
                        {s.done ? "✓ Fait" : "Fait ?"}
                      </button>
                    </li>
                  ))}
                </ul>
                {rest[e.id] && (
                  <RestTimer
                    endsAt={rest[e.id]!.endsAt}
                    now={now}
                    setIndex={rest[e.id]!.setIndex}
                    totalSets={e.sets}
                    nextLabel={[e.notation, e.charge].filter(Boolean).join(" · ")}
                    onSkip={() =>
                      setRest((r) => {
                        const { [e.id]: _drop, ...next } = r;
                        return next;
                      })
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {error && <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <button
        type="button"
        onClick={finish}
        disabled={pending}
        className="grad-accent w-full rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Terminer la séance"}
      </button>
    </div>
  );
}
