"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { finishSession } from "../actions";
import { classifyBloc, parseNotation, parseRestSeconds } from "@/lib/format";
import { formatClock, resolveBlocRounds } from "@/lib/wod-format";
import { WodClock } from "./wod-clock";

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
  isWod: boolean;
  exercices: RunnerExercice[];
};

type SetState = { kg: string; reps: string; done: boolean };
type RestState = { endsAt: number; setIndex: number };

const num = (s: string): number | null => {
  const v = parseFloat(s.replace(",", "."));
  return Number.isFinite(v) ? v : null;
};

/** "8-10 (HORS BUDGET…)" -> 9 ; "10" -> 10 ; sinon null. */
function parseDureeMinutes(v: string | null): number | null {
  if (!v) return null;
  const m = v.match(/(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?/);
  if (!m) return null;
  const a = parseFloat(m[1].replace(",", "."));
  const b = m[2] ? parseFloat(m[2].replace(",", ".")) : a;
  return (a + b) / 2;
}

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
        <span className="font-mono text-3xl font-bold tabular-nums text-accent">{formatClock(remaining)}</span>
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

/** Chrono global d'un bloc échauffement / préparation ciblée — pas de séries à valider. */
function WarmupTimer({ durationMin }: { durationMin: number | null }) {
  const totalSeconds = durationMin ? Math.round(durationMin * 60) : null;
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const elapsed = startedAt ? Math.floor((now - startedAt) / 1000) : 0;
  const display = totalSeconds !== null ? Math.max(0, totalSeconds - elapsed) : elapsed;

  useEffect(() => {
    if (phase === "running" && totalSeconds !== null && elapsed >= totalSeconds) setPhase("done");
  }, [phase, elapsed, totalSeconds]);

  return (
    <div className="mt-4 rounded-2xl border border-line bg-bg/60 p-5 text-center">
      <p className={`font-mono text-4xl font-extrabold tabular-nums ${phase === "done" ? "text-brand" : "text-accent"}`}>
        {formatClock(phase === "idle" ? (totalSeconds ?? 0) : display)}
      </p>
      <p className="mt-1 eyebrow">
        {phase === "done" ? "Terminé ✓" : totalSeconds !== null ? `Durée cible ${durationMin}'` : "Chrono"}
      </p>
      <button
        type="button"
        onClick={() => {
          if (phase === "running") {
            setPhase("idle");
            setStartedAt(null);
          } else {
            setStartedAt(Date.now());
            setNow(Date.now());
            setPhase("running");
          }
        }}
        className={
          phase === "running"
            ? "mt-3 w-full rounded-full border border-line py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-muted"
            : "grad-accent mt-3 w-full rounded-full py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-black"
        }
      >
        {phase === "running" ? "Réinitialiser" : "Lancer"}
      </button>
    </div>
  );
}

/** Chrono compact par mouvement, pour les tenues chronométrées d'un bloc mobilité. */
function HoldTimer({ seconds }: { seconds: number }) {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const elapsed = startedAt ? Math.floor((now - startedAt) / 1000) : 0;
  const remaining = Math.max(0, seconds - elapsed);

  useEffect(() => {
    if (phase === "running" && remaining === 0) setPhase("done");
  }, [phase, remaining]);

  return (
    <div className="mt-1.5 flex items-center gap-2">
      <span className={`font-mono text-sm font-bold tabular-nums ${phase === "done" ? "text-brand" : "text-accent"}`}>
        {formatClock(phase === "idle" ? seconds : remaining)}
      </span>
      <button
        type="button"
        onClick={() => {
          if (phase === "running") {
            setPhase("idle");
            setStartedAt(null);
          } else {
            setStartedAt(Date.now());
            setNow(Date.now());
            setPhase("running");
          }
        }}
        className="rounded-full border border-accent/40 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-accent"
      >
        {phase === "running" ? "Reset" : phase === "done" ? "Relancer" : "Lancer"}
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
  // Échauffement / mobilité / WOD : pas de charge ni de validation de série ici
  // (chronos dédiés) — seuls les blocs de travail alimentent ce state. Pour
  // un bloc structuré en rounds ("4 rounds, Every 3:00", EMOM...), le nombre
  // de séries vient du format_entete (partagé par tous les mouvements du
  // bloc) plutôt que de la notation propre à chaque exercice.
  const [state, setState] = useState<Record<string, SetState[]>>(() =>
    Object.fromEntries(
      blocs
        .filter((b) => classifyBloc(b.nom, b.isWod) === "travail")
        .flatMap((b) => {
          const { totalRounds } = resolveBlocRounds(b.formatEntete);
          return b.exercices.map((e) => {
            const rounds = totalRounds > 0 ? totalRounds : e.sets;
            return [
              e.id,
              Array.from({ length: rounds }, () => ({ kg: "", reps: e.defaultReps ? String(e.defaultReps) : "", done: false })),
            ] as const;
          });
        }),
    ),
  );

  const [rest, setRest] = useState<Record<string, RestState | undefined>>({});
  const [blocRest, setBlocRest] = useState<Record<string, RestState | undefined>>({});
  const [wodScores, setWodScores] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Purge les repos écoulés pour ne pas garder un état obsolète.
  useEffect(() => {
    const purge = (r: Record<string, RestState | undefined>) => {
      const next: typeof r = {};
      let changed = false;
      for (const [id, v] of Object.entries(r)) {
        if (v && v.endsAt > now) next[id] = v;
        else changed = true;
      }
      return changed ? next : r;
    };
    setRest(purge);
    setBlocRest(purge);
  }, [now]);

  const elapsed = Math.floor((now - startedAt) / 1000);

  const total = Object.values(state).reduce((a, s) => a + s.length, 0);
  const doneCount = Object.values(state).reduce((a, s) => a + s.filter((x) => x.done).length, 0);

  const update = (id: string, i: number, patch: Partial<SetState>) =>
    setState((s) => ({ ...s, [id]: s[id].map((x, j) => (j === i ? { ...x, ...patch } : x)) }));

  // Bloc structuré en rounds ("4 rounds, Every 3:00", EMOM...) : le repos
  // s'enclenche automatiquement pour tout le bloc dès que le DERNIER
  // mouvement de la série est validé — pas un repos par exercice.
  const toggleBlocDone = (b: RunnerBloc, ex: RunnerExercice, i: number, totalRounds: number, restSeconds: number | null) => {
    const wasDone = state[ex.id][i].done;
    update(ex.id, i, { done: !wasDone });
    const isLastExercice = b.exercices[b.exercices.length - 1].id === ex.id;
    if (!isLastExercice) return;
    const isLastRound = i === totalRounds - 1;
    if (!wasDone && restSeconds && !isLastRound) {
      setBlocRest((r) => ({ ...r, [b.id]: { endsAt: Date.now() + restSeconds * 1000, setIndex: i } }));
    } else if (wasDone) {
      setBlocRest((r) => {
        const cur = r[b.id];
        if (!cur || cur.setIndex !== i) return r;
        const { [b.id]: _drop, ...next } = r;
        return next;
      });
    }
  };

  // Séries droites (notation "N×M" propre à l'exercice) : repos entre
  // chaque série du même mouvement.
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
      const wodScore = Object.values(wodScores).filter(Boolean).join(" · ") || null;
      const res = await finishSession({
        dayId,
        module,
        startedAt,
        wodScore,
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
        <span className="font-mono text-2xl font-bold tabular-nums text-brand">{formatClock(elapsed)}</span>
        <span className="eyebrow">
          {doneCount} / {total} séries
        </span>
      </div>

      {blocs.map((b) => {
        const kind = classifyBloc(b.nom, b.isWod);
        return (
          <section key={b.id} className="rounded-3xl border border-line bg-card p-5">
            <h3 className="flex items-start gap-3 text-base font-bold uppercase">
              <span className="grad-accent mt-1 h-5 w-1 shrink-0 rounded-full" />
              <span>
                {b.nom}
                {b.dureeMin && kind !== "echauffement" && <span className="text-muted"> ({b.dureeMin}&apos;)</span>}
              </span>
            </h3>
            {b.formatEntete && kind !== "wod" && (
              <p className="mt-3 rounded-xl bg-bg/60 px-3 py-2 text-sm">{b.formatEntete}</p>
            )}
            {b.note && <p className="mt-2 rounded-xl bg-brand/10 px-3 py-2 text-[0.8rem] text-brand">{b.note}</p>}

            {kind === "wod" && (
              <>
                {b.formatEntete && <p className="mt-3 rounded-xl bg-bg/60 px-3 py-2 text-sm">{b.formatEntete}</p>}
                <WodClock
                  formatEntete={b.formatEntete}
                  exercices={b.exercices}
                  onComplete={(score) => setWodScores((s) => ({ ...s, [b.id]: score }))}
                />
              </>
            )}

            {kind === "echauffement" && (
              <>
                <WarmupTimer durationMin={parseDureeMinutes(b.dureeMin)} />
                <ul className="mt-4 divide-y divide-line/70">
                  {b.exercices.map((e) => (
                    <li key={e.id} className="py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[0.95rem]">{e.nom}</span>
                        <span className="shrink-0 text-right text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                          {[e.notation, e.charge, e.repos].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                      {e.note && <p className="mt-1 text-[0.78rem] text-muted">{e.note}</p>}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {kind === "mobilite" && (
              <ul className="mt-4 divide-y divide-line/70">
                {b.exercices.map((e) => {
                  const holdSeconds = parseRestSeconds(parseNotation(e.notation).reps);
                  return (
                    <li key={e.id} className="py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[0.95rem]">{e.nom}</span>
                        <span className="shrink-0 text-right text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                          {[e.notation, e.charge, e.repos].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                      {e.note && <p className="mt-1 text-[0.78rem] text-muted">{e.note}</p>}
                      {holdSeconds && <HoldTimer seconds={holdSeconds} />}
                    </li>
                  );
                })}
              </ul>
            )}

            {kind === "travail" &&
              (() => {
                const { totalRounds, restSeconds } = resolveBlocRounds(b.formatEntete);
                return (
                  <div className="mt-4 space-y-5">
                    {totalRounds > 0 && <p className="eyebrow !text-accent">{totalRounds} séries</p>}
                    {b.exercices.map((e) => {
                      const reps = parseNotation(e.notation).reps;
                      const hasWeight = !!e.charge?.trim();
                      return (
                        <div key={e.id}>
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-[0.95rem] font-medium">{e.nom}</span>
                            <span className="text-right text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                              {[reps, e.charge, e.repos].filter(Boolean).join(" · ")}
                            </span>
                          </div>
                          {totalRounds === 0 && e.sets > 1 && (
                            <p className="mt-0.5 text-[0.68rem] uppercase tracking-[0.1em] text-muted">{e.sets} séries</p>
                          )}
                          {e.note && <p className="mt-1 text-[0.78rem] text-muted">{e.note}</p>}
                          <ul className="mt-2 space-y-2">
                            {state[e.id].map((s, i) => (
                              <li key={i} className="flex items-center gap-2">
                                {hasWeight && (
                                  <input
                                    aria-label={`Charge série ${i + 1}`}
                                    inputMode="decimal"
                                    placeholder="kg"
                                    value={s.kg}
                                    onChange={(ev) => update(e.id, i, { kg: ev.target.value })}
                                    className={input}
                                  />
                                )}
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
                                  onClick={() =>
                                    totalRounds > 0 ? toggleBlocDone(b, e, i, totalRounds, restSeconds) : toggleDone(e, i)
                                  }
                                  className={`ml-auto rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] ${
                                    s.done ? "grad-accent text-black" : "border border-line text-muted"
                                  }`}
                                >
                                  {s.done ? "✓ Fait" : "Fait ?"}
                                </button>
                              </li>
                            ))}
                          </ul>
                          {totalRounds === 0 && rest[e.id] && (
                            <RestTimer
                              endsAt={rest[e.id]!.endsAt}
                              now={now}
                              setIndex={rest[e.id]!.setIndex}
                              totalSets={e.sets}
                              nextLabel={[reps, e.charge].filter(Boolean).join(" · ")}
                              onSkip={() =>
                                setRest((r) => {
                                  const { [e.id]: _drop, ...next } = r;
                                  return next;
                                })
                              }
                            />
                          )}
                        </div>
                      );
                    })}
                    {totalRounds > 0 && blocRest[b.id] && (
                      <RestTimer
                        endsAt={blocRest[b.id]!.endsAt}
                        now={now}
                        setIndex={blocRest[b.id]!.setIndex}
                        totalSets={totalRounds}
                        nextLabel={b.exercices.map((e) => e.nom).join(" · ")}
                        onSkip={() =>
                          setBlocRest((r) => {
                            const { [b.id]: _drop, ...next } = r;
                            return next;
                          })
                        }
                      />
                    )}
                  </div>
                );
              })()}
          </section>
        );
      })}

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
