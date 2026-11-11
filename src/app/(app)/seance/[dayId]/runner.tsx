"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { finishSession } from "../actions";
import { classifyBloc, isPerSide, parseHoldSeconds, parseNotation, parseRestSeconds } from "@/lib/format";
import { restGroups } from "@/lib/rest-plan";
import { shortExerciceName } from "@/lib/share";
import { planBloc } from "@/lib/bloc-plan";
import { formatClock } from "@/lib/wod-format";
import { BlocRun } from "./bloc-run";
import { FeedbackBox, type Feedback } from "./feedback-box";
import { BlocHeader } from "@/components/bloc-header";
import { ExerciseCard, ExerciseGroup } from "@/components/exercise-card";
import { movementGroups, prescription } from "@/lib/bloc-view";
import { WodClock } from "./wod-clock";
import {
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

export type SetState = { kg: string; reps: string; done: boolean };

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
  // (chronos dédiés) — seuls les blocs de travail alimentent ce state. Un bloc
  // en rounds ou en « N séries de » partage son nombre de séries entre tous
  // ses mouvements ; sinon chaque exercice a les siennes (notation « N×M »).
  const [state, setState] = useState<Record<string, SetState[]>>(() =>
    Object.fromEntries(
      blocs
        .filter((b) => classifyBloc(b.nom, b.isWod) === "travail")
        .flatMap((b) => {
          const plan = planBloc(b.formatEntete, b.exercices);
          return b.exercices.map((e) => {
            const rounds = plan.kind === "sequence" ? e.sets : plan.total;
            return [
              e.id,
              Array.from({ length: rounds }, () => ({ kg: "", reps: e.defaultReps ? String(e.defaultReps) : "", done: false })),
            ] as const;
          });
        }),
    ),
  );

  // Repos en cours des blocs « séquence » : clé = id du premier exercice du groupe.
  const [rests, setRests] = useState<Record<string, Rest | undefined>>({});
  const [wodScores, setWodScores] = useState<Record<string, string | null>>({});
  const [feedback, setFeedback] = useState<Feedback>({ text: "", audio: null });
  // Séance déjà enregistrée : un nouvel appui ne la recrée pas, il renvoie seulement le message vocal.
  const [savedId, setSavedId] = useState<string | null>(null);

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

  const markDone = (ids: string[], from: number, to: number, done: boolean) =>
    setState((s) => {
      const next = { ...s };
      for (const id of ids) {
        if (next[id]) next[id] = next[id].map((x, j) => (j >= from && j < to ? { ...x, done } : x));
      }
      return next;
    });

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

  // Valide / dévalide une série d'un bloc « séquence ». Le repos s'enclenche
  // automatiquement quand le DERNIER mouvement du groupe (superset) est validé.
  const toggleSet = (blocIndex: number, b: RunnerBloc, ex: RunnerExercice, i: number) => {
    const wasDone = state[ex.id][i].done;
    update(ex.id, i, { done: !wasDone });

    const groups = restGroups(b.exercices);
    const group = groups.find((g) => g.some((e) => e.id === ex.id)) ?? [ex];
    const restKey = group[0].id;

    if (wasDone) {
      setRests((r) => {
        if (r[restKey]?.setIndex !== i) return r;
        const { [restKey]: _drop, ...next } = r;
        return next;
      });
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
        endsAt: Date.now() + seconds * 1000,
        setIndex: i,
        title: groupSets > 1 ? `Repos · série ${i + 1} / ${groupSets}` : "Repos",
        next,
      },
    }));
  };

  const uploadVoice = async (sessionId: string, audio: NonNullable<Feedback["audio"]>) => {
    try {
      const res = await fetch(`/api/voix/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": audio.mime, "X-Duration-Sec": String(audio.durationSec) },
        body: audio.blob,
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const finish = () =>
    start(async () => {
      setError(null);
      let id = savedId;
      if (!id) {
        const wodScore = Object.values(wodScores).filter(Boolean).join(" · ") || null;
        const res = await finishSession({
          dayId,
          module,
          startedAt,
          wodScore,
          comment: feedback.text.trim() || null,
          logs: Object.entries(state).map(([exerciceId, sets]) => ({
            exerciceId,
            sets: sets.map((x) => ({ kg: num(x.kg), reps: num(x.reps), done: x.done })),
          })),
        });
        if (!res.ok || !res.sessionId) {
          setError(res.error ?? "Erreur");
          return;
        }
        id = res.sessionId;
        setSavedId(id);
      }
      if (feedback.audio && !(await uploadVoice(id, feedback.audio))) {
        setError("Séance enregistrée, mais le message vocal n'a pas pu être envoyé. Réessaie ou continue sans.");
        return;
      }
      router.push("/historique");
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
          <section key={b.id} className="border-t border-line pt-6">
            <BlocHeader bloc={b} hideDuration={kind === "echauffement"} />

            {kind === "wod" && (
              <>
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
                <div className="mt-4 space-y-2.5">
                  {b.exercices.map((e) => (
                    <ExerciseCard key={e.id} nom={e.nom} prescription={prescription(e, { keepSets: true })} note={e.note} />
                  ))}
                </div>
              </>
            )}

            {kind === "mobilite" && (
              <div className="mt-4 space-y-2.5">
                {b.exercices.map((e) => {
                  const n = parseNotation(e.notation);
                  const holdSeconds = parseHoldSeconds(n.reps);
                  return (
                    <ExerciseCard key={e.id} nom={e.nom} prescription={prescription(e, { keepSets: true })} note={e.note}>
                      {holdSeconds && <HoldTimerList seconds={holdSeconds} sets={n.sets} perSide={isPerSide(n.reps)} />}
                    </ExerciseCard>
                  );
                })}
              </div>
            )}

            {kind === "travail" &&
              (() => {
                const plan = planBloc(b.formatEntete, b.exercices);
                if (plan.kind !== "sequence") {
                  return <BlocRun bloc={b} plan={plan} now={now} state={state} update={update} markDone={markDone} />;
                }
                const groups = restGroups(b.exercices);
                return (
                  <div className="mt-4 space-y-4">
                    {movementGroups(b.formatEntete, b.exercices).map((g, gi) => (
                      <ExerciseGroup key={gi} label={g.label}>
                        {g.items.map((e) => {
                          const n = parseNotation(e.notation);
                          const timed = parseHoldSeconds(n.reps) !== null;
                          const hasWeight = !!e.charge?.trim();
                          const group = groups.find((x) => x.some((y) => y.id === e.id)) ?? [e];
                          const showGroupRest = group[group.length - 1].id === e.id;
                          return (
                            <div key={e.id}>
                              <ExerciseCard nom={e.nom} prescription={prescription(e)} note={e.note}>
                                {e.sets > 1 && (
                                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.1em] text-muted">{e.sets} séries</p>
                                )}
                                <ul className="mt-2.5 space-y-2">
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
                                      {!timed && (
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
                              </ExerciseCard>
                              {showGroupRest && rests[group[0].id] && (
                                <RestTimer rest={rests[group[0].id]!} now={now} onSkip={() => dropRest(group[0].id)} />
                              )}
                            </div>
                          );
                        })}
                      </ExerciseGroup>
                    ))}
                  </div>
                );
              })()}
          </section>
        );
      })}

      <FeedbackBox value={feedback} onChange={setFeedback} disabled={savedId !== null} />

      {error && <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <button
        type="button"
        onClick={finish}
        disabled={pending}
        className="grad-accent w-full rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : savedId ? "Renvoyer le message vocal" : "Terminer la séance"}
      </button>
      {savedId && (
        <button type="button" onClick={() => router.push("/historique")} className="block w-full text-center text-[0.7rem] uppercase tracking-[0.12em] text-muted underline-offset-4 hover:underline">
          Continuer sans le message vocal
        </button>
      )}
    </div>
  );
}
