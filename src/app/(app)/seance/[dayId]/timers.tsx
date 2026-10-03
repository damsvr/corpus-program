"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatClock } from "@/lib/wod-format";

/** Horloge qui avance seconde par seconde tant que `active` ; resynchronisée dès l'activation. */
export function useTick(active: boolean, ms = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [active, ms]);
  return now;
}

/**
 * Ignore les appuis répétés dans les `ms` qui suivent un appui accepté : sur
 * mobile, un double-tap sur « Lancer » relançait aussitôt « Réinitialiser »
 * (le bouton change de rôle dès le premier appui).
 */
export function usePressGuard(ms = 600) {
  const last = useRef(0);
  return useCallback(
    (fn: () => void) => () => {
      const t = Date.now();
      if (t - last.current < ms) return;
      last.current = t;
      fn();
    },
    [ms],
  );
}

const primaryBtn =
  "grad-accent mt-3 w-full rounded-full py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-black";
const secondaryBtn =
  "mt-3 w-full rounded-full border border-line py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-muted";

/** Chrono global d'un bloc échauffement / préparation ciblée — pas de séries à valider. */
export function WarmupTimer({ durationMin }: { durationMin: number | null }) {
  const guard = usePressGuard();
  const totalSeconds = durationMin ? Math.round(durationMin * 60) : null;
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const now = useTick(startedAt !== null);

  const elapsed = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  const done = totalSeconds !== null && startedAt !== null && elapsed >= totalSeconds;
  const running = startedAt !== null && !done;
  const display = totalSeconds !== null ? Math.max(0, totalSeconds - elapsed) : elapsed;

  const start = () => setStartedAt(Date.now());
  const reset = () => setStartedAt(null);

  return (
    <div className="mt-4 rounded-2xl border border-line bg-bg/60 p-5 text-center">
      <p className={`font-mono text-4xl font-extrabold tabular-nums ${done ? "text-brand" : "text-accent"}`}>
        {formatClock(startedAt === null ? (totalSeconds ?? 0) : display)}
      </p>
      <p className="mt-1 eyebrow">
        {done ? "Terminé ✓" : totalSeconds !== null ? `Durée cible ${durationMin}'` : "Chrono"}
      </p>
      {running ? (
        <button type="button" onClick={guard(reset)} className={secondaryBtn}>
          Réinitialiser
        </button>
      ) : (
        <button type="button" onClick={guard(start)} className={primaryBtn}>
          {done ? "Relancer" : "Lancer"}
        </button>
      )}
    </div>
  );
}

/**
 * Chrono compact d'une tenue chronométrée (ex. 30'' ou 20''/côté). `steps`
 * = 2 pour un exercice par côté : une fois le premier côté terminé, le
 * bouton propose « Côté 2 ».
 */
export function HoldTimer({ seconds, steps = 1, className = "mt-1.5" }: { seconds: number; steps?: number; className?: string }) {
  const guard = usePressGuard();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const now = useTick(startedAt !== null);

  const elapsed = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  const done = startedAt !== null && elapsed >= seconds;
  const running = startedAt !== null && !done;
  const remaining = Math.max(0, seconds - elapsed);
  const hasNextSide = done && step < steps - 1;

  const begin = (nextStep: number) => {
    setStep(nextStep);
    setStartedAt(Date.now());
  };

  let label = "Lancer";
  let action = () => begin(0);
  if (running) {
    label = "Reset";
    action = () => {
      setStartedAt(null);
      setStep(0);
    };
  } else if (hasNextSide) {
    label = `Côté ${step + 2}`;
    action = () => begin(step + 1);
  } else if (done) {
    label = "Relancer";
    action = () => begin(0);
  }

  return (
    <div className={`${className} flex items-center gap-2`}>
      <span className={`font-mono text-sm font-bold tabular-nums ${done ? "text-brand" : "text-accent"}`}>
        {formatClock(startedAt === null ? seconds : remaining)}
      </span>
      {steps > 1 && startedAt !== null && (
        <span className="text-[0.62rem] uppercase tracking-[0.1em] text-muted">
          côté {step + 1}/{steps}
        </span>
      )}
      <button
        type="button"
        onClick={guard(action)}
        className="rounded-full border border-accent/40 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-accent"
      >
        {label}
      </button>
    </div>
  );
}

/** Un chrono par série pour une tenue chronométrée de mobilité (« 2×20'' » = 2 chronos). */
export function HoldTimerList({ seconds, sets, perSide }: { seconds: number; sets: number; perSide: boolean }) {
  return (
    <div className="mt-1.5 space-y-1.5">
      {Array.from({ length: sets }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          {sets > 1 && <span className="w-14 text-[0.62rem] uppercase tracking-[0.1em] text-muted">Série {i + 1}</span>}
          <HoldTimer seconds={seconds} steps={perSide ? 2 : 1} className="" />
        </div>
      ))}
    </div>
  );
}

export type Rest = { endsAt: number; setIndex: number; title: string; next: string };

/** Durée pendant laquelle « Repos terminé » reste affiché avant de disparaître seul. */
export const REST_GRACE_MS = 15_000;

export function RestTimer({
  rest,
  now,
  onSkip,
}: {
  rest: Rest;
  now: number;
  onSkip: () => void;
}) {
  const guard = usePressGuard();
  const remaining = Math.max(0, Math.ceil((rest.endsAt - now) / 1000));
  const finished = remaining === 0;

  useEffect(() => {
    if (finished && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate([250, 120, 250]);
  }, [finished]);

  return (
    <div className={`mt-3 rounded-2xl border p-4 ${finished ? "border-brand/50 bg-brand/10" : "border-accent/40 bg-accent/10"}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-[0.68rem] font-bold uppercase tracking-[0.14em] ${finished ? "text-brand" : "text-accent"}`}>
            {finished ? "Repos terminé — c'est reparti" : rest.title}
          </p>
          <p className="mt-1 text-[0.75rem] text-muted">{rest.next}</p>
        </div>
        <span className={`font-mono text-3xl font-bold tabular-nums ${finished ? "text-brand" : "text-accent"}`}>
          {formatClock(remaining)}
        </span>
      </div>
      <button
        type="button"
        onClick={guard(onSkip)}
        className={`mt-3 w-full rounded-full border py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] ${
          finished ? "border-brand/40 text-brand" : "border-accent/40 text-accent"
        }`}
      >
        {finished ? "OK" : "Passer le repos"}
      </button>
    </div>
  );
}

/**
 * Chrono « Every X:XX » d'un bloc de travail : optionnel, il cale le repos
 * sur l'intervalle (le prochain round démarre à heure fixe, quel que soit le
 * temps passé à travailler). Sans lui, le repos dure l'intervalle entier.
 */
export function BlocIntervalClock({
  startedAt,
  now,
  roundSeconds,
  totalRounds,
  onStart,
  onReset,
}: {
  startedAt: number | undefined;
  now: number;
  roundSeconds: number;
  totalRounds: number;
  onStart: () => void;
  onReset: () => void;
}) {
  const guard = usePressGuard();
  if (startedAt === undefined) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg/60 px-4 py-3">
        <p className="text-[0.75rem] text-muted">
          {totalRounds} rounds, un toutes les {formatClock(roundSeconds)}
        </p>
        <button
          type="button"
          onClick={guard(onStart)}
          className="grad-accent shrink-0 rounded-full px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-black"
        >
          Lancer le chrono
        </button>
      </div>
    );
  }
  const elapsed = Math.max(0, (now - startedAt) / 1000);
  const over = elapsed >= roundSeconds * totalRounds;
  const round = Math.min(totalRounds, Math.floor(elapsed / roundSeconds) + 1);
  const nextIn = roundSeconds - (Math.floor(elapsed) % roundSeconds);
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3">
      <div>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent">
          {over ? "Chrono terminé ✓" : `Round ${round} / ${totalRounds}`}
        </p>
        {!over && round < totalRounds && (
          <p className="text-[0.75rem] text-muted">Prochain round dans {formatClock(nextIn)}</p>
        )}
      </div>
      <button
        type="button"
        onClick={guard(onReset)}
        className="shrink-0 rounded-full border border-accent/40 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-accent"
      >
        Reset
      </button>
    </div>
  );
}
