"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { finishSession } from "../actions";
import { classifyBloc, isPerSide, parseHoldSeconds, parseNotation, parseRestSeconds } from "@/lib/format";
import { restGroups } from "@/lib/rest-plan";
import { shortExerciceName } from "@/lib/share";
import { formatClock, resolveBlocRounds } from "@/lib/wod-format";
import { WodClock } from "./wod-clock";
import {
  BlocIntervalClock,
  HoldTimer,
  HoldTimerList,
  REST_GRACE_MS,
  RestTimer,
  WarmupTimer,
  type Rest,
} from "./timers";

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

const isWorkBloc = (b: RunnerBloc) => {
  const k = classifyBloc(b.nom, b.isWod);
  return k === "travail" || k === "wod";
};

const noopSubscribe = () => () => {};

/** Faux tant que le JS de la page n'a pas hydraté : les boutons ne répondent pas avant, autant le montrer. */
function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** Garde l'écran allumé pendant la séance : les chronos restent visibles et les vibrations de fin de repos partent. */
function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = async () => {
      try {
        const l = await navigator.wakeLock?.request("screen");
        if (!l) return;
        if (cancelled) void l.release();
        else lock = l;
      } catch {
        // refus (économie d'énergie, onglet masqué) : sans effet sur la séance
      }
    };
    void request();
    const onVisible = () => {
      if (document.visibilityState === "visible") void request();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release().catch(() => {});
    };
  }, []);
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

  // Repos en cours : clé = id du bloc (bloc en rounds) ou du premier exercice du groupe.
  const [rests, setRests] = useState<Record<string, Rest | undefined>>({});
  // Départ du chrono « Every X:XX » d'un bloc en rounds, par id de bloc.
  const [blocStarts, setBlocStarts] = useState<Record<string, number | undefined>>({});
  const [wodScores, setWodScores] = useState<Record<string, string | null>>({});

  useWakeLock();
  const hydrated = useHydrated();

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // « Repos terminé » reste affiché un moment avant de disparaître seul.
  useEffect(() => {
    setRests((r) => {
      const next: typeof r = {};
      let changed = false;
      for (const [id, v] of Object.entries(r)) {
        if (v && v.endsAt + REST_GRACE_MS > now) next[id] = v;
        else changed = true;
      }
      return changed ? next : r;
    });
  }, [now]);

  const elapsed = Math.floor((now - startedAt) / 1000);

  const total = Object.values(state).reduce((a, s) => a + s.length, 0);
  const doneCount = Object.values(state).reduce((a, s) => a + s.filter((x) => x.done).length, 0);

  const update = (id: string, i: number, patch: Partial<SetState>) =>
    setState((s) => ({ ...s, [id]: s[id].map((x, j) => (j === i ? { ...x, ...patch } : x)) }));

  const dropRest = (key: string) =>
    setRests((r) => {
      const { [key]: _drop, ...next } = r;
      return next;
    });

  // La charge n'est rappelée que si elle est courte ("70% TM"), pas pour un texte libre du coach.
  const nameWithLoad = (e: RunnerExercice) =>
    [shortExerciceName(e.nom), parseNotation(e.notation).reps, e.charge && e.charge.length <= 16 ? e.charge : null]
      .filter(Boolean)
      .join(" ");

  // Valide / dévalide une série. Le repos s'enclenche automatiquement quand le
  // DERNIER mouvement de la série (round, ou groupe en superset) est validé.
  const toggleSet = (blocIndex: number, b: RunnerBloc, ex: RunnerExercice, i: number) => {
    const wasDone = state[ex.id][i].done;
    update(ex.id, i, { done: !wasDone });

    const { totalRounds, restSeconds: intervalSeconds } = resolveBlocRounds(b.formatEntete);
    const groups = restGroups(b.exercices);
    const group = groups.find((g) => g.some((e) => e.id === ex.id)) ?? [ex];
    const restKey = totalRounds > 0 ? b.id : group[0].id;

    if (wasDone) {
      setRests((r) => {
        if (r[restKey]?.setIndex !== i) return r;
        const { [restKey]: _drop, ...next } = r;
        return next;
      });
      return;
    }

    const nowMs = Date.now();

    if (totalRounds > 0) {
      if (ex.id !== b.exercices[b.exercices.length - 1].id || !intervalSeconds || i >= totalRounds - 1) return;
      const blocStart = blocStarts[b.id];
      const endsAt = blocStart ? Math.max(nowMs, blocStart + (i + 1) * intervalSeconds * 1000) : nowMs + intervalSeconds * 1000;
      setRests((r) => ({
        ...r,
        [restKey]: {
          endsAt,
          setIndex: i,
          title: `Repos · série ${i + 1} / ${totalRounds}`,
          next: `Prochaine : série ${i + 2} / ${totalRounds} · ${b.exercices.map((e) => shortExerciceName(e.nom)).join(" + ")}`,
        },
      }));
      return;
    }

    if (group[group.length - 1].id !== ex.id) return;
    const seconds = parseRestSeconds(group[0].repos);
    if (!seconds) return;
    const groupSets = Math.max(...group.map((e) => state[e.id].length));
    const nextGroup = groups[groups.indexOf(group) + 1];
    const nextBloc = blocs.slice(blocIndex + 1).find(isWorkBloc);
    let next: string;
    if (i < groupSets - 1) next = `Prochaine : série ${i + 2} / ${groupSets} · ${group.map(nameWithLoad).join(" + ")}`;
    else if (nextGroup) next = `Ensuite : ${nextGroup.map(nameWithLoad).join(" + ")}`;
    else if (nextBloc) next = `Ensuite : ${nextBloc.nom}`;
    else return;
    setRests((r) => ({
      ...r,
      [restKey]: {
        endsAt: nowMs + seconds * 1000,
        setIndex: i,
        title: groupSets > 1 ? `Repos · série ${i + 1} / ${groupSets}` : "Repos",
        next,
      },
    }));
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
    "w-16 rounded-lg border border-line bg-bg/60 px-2 py-2 text-center text-sm outline-none focus:border-brand";

  return (
    <div
      data-ready={hydrated}
      className="space-y-5 transition-opacity data-[ready=false]:pointer-events-none data-[ready=false]:opacity-60"
    >
      <div className="sticky top-0 z-30 -mx-5 flex items-center justify-between border-b border-line bg-bg/95 px-5 py-3 backdrop-blur">
        <span className="font-mono text-2xl font-bold tabular-nums text-brand">{formatClock(elapsed)}</span>
        <span className="eyebrow">
          {doneCount} / {total} séries
        </span>
      </div>

      {blocs.map((b, blocIndex) => {
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
                  const n = parseNotation(e.notation);
                  const holdSeconds = parseHoldSeconds(n.reps);
                  return (
                    <li key={e.id} className="py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[0.95rem]">{e.nom}</span>
                        <span className="shrink-0 text-right text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                          {[e.notation, e.charge, e.repos].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                      {e.note && <p className="mt-1 text-[0.78rem] text-muted">{e.note}</p>}
                      {holdSeconds && <HoldTimerList seconds={holdSeconds} sets={n.sets} perSide={isPerSide(n.reps)} />}
                    </li>
                  );
                })}
              </ul>
            )}

            {kind === "travail" &&
              (() => {
                const { totalRounds, restSeconds } = resolveBlocRounds(b.formatEntete);
                const groups = restGroups(b.exercices);
                return (
                  <div className="mt-4 space-y-5">
                    {totalRounds > 0 && restSeconds && (
                      <>
                        <p className="eyebrow !text-accent">{totalRounds} séries</p>
                        <BlocIntervalClock
                          startedAt={blocStarts[b.id]}
                          now={now}
                          roundSeconds={restSeconds}
                          totalRounds={totalRounds}
                          onStart={() => setBlocStarts((s) => ({ ...s, [b.id]: Date.now() }))}
                          onReset={() => {
                            setBlocStarts((s) => ({ ...s, [b.id]: undefined }));
                            dropRest(b.id);
                          }}
                        />
                      </>
                    )}
                    {b.exercices.map((e) => {
                      const n = parseNotation(e.notation);
                      const holdSeconds = parseHoldSeconds(n.reps);
                      const hasWeight = !!e.charge?.trim();
                      const group = groups.find((g) => g.some((x) => x.id === e.id)) ?? [e];
                      const showGroupRest = totalRounds === 0 && group[group.length - 1].id === e.id;
                      return (
                        <div key={e.id}>
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-[0.95rem] font-medium">{e.nom}</span>
                            <span className="text-right text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                              {[n.reps, e.charge, e.repos].filter(Boolean).join(" · ")}
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
                                {holdSeconds ? (
                                  <HoldTimer seconds={holdSeconds} steps={isPerSide(n.reps) ? 2 : 1} className="" />
                                ) : (
                                  <input
                                    aria-label={`Répétitions série ${i + 1}`}
                                    inputMode="numeric"
                                    placeholder="reps"
                                    value={s.reps}
                                    onChange={(ev) => update(e.id, i, { reps: ev.target.value })}
                                    className={input}
                                  />
                                )}
                                <button
                                  type="button"
                                  aria-pressed={s.done}
                                  onClick={() => toggleSet(blocIndex, b, e, i)}
                                  className={`ml-auto rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] ${
                                    s.done ? "grad-accent text-black" : "border border-line text-muted"
                                  }`}
                                >
                                  {s.done ? "✓ Fait" : "Fait ?"}
                                </button>
                              </li>
                            ))}
                          </ul>
                          {showGroupRest && rests[group[0].id] && (
                            <RestTimer rest={rests[group[0].id]!} now={now} onSkip={() => dropRest(group[0].id)} />
                          )}
                        </div>
                      );
                    })}
                    {totalRounds > 0 && rests[b.id] && (
                      <RestTimer rest={rests[b.id]!} now={now} onSkip={() => dropRest(b.id)} />
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
