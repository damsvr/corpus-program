"use client";

import { useEffect, useState } from "react";
import { extractScoreHint, formatClock, parseWodFormat, type WodProgram } from "@/lib/wod-format";
import type { RunnerExercice } from "./runner";

function ExerciceRef({ e }: { e: RunnerExercice }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-[0.9rem]">{e.nom}</span>
      <span className="shrink-0 text-right text-[0.68rem] uppercase tracking-[0.1em] text-muted">
        {[e.notation, e.charge, e.repos].filter(Boolean).join(" · ")}
      </span>
    </div>
  );
}

const bigClock = "font-mono text-6xl font-extrabold tabular-nums text-accent";
const launchBtn =
  "grad-accent w-full rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black";
const ghostBtn =
  "w-full rounded-full border border-line py-3 text-xs font-bold uppercase tracking-[0.14em] text-muted";
const cancelLink = "block w-full pt-1 text-center text-[0.68rem] uppercase tracking-[0.12em] text-muted/70";

export function WodClock({
  formatEntete,
  exercices,
  onComplete,
}: {
  formatEntete: string | null;
  exercices: RunnerExercice[];
  onComplete: (score: string | null) => void;
}) {
  const program = parseWodFormat(formatEntete);
  const [phase, setPhase] = useState<"idle" | "running" | "score" | "done">("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [scoreInput, setScoreInput] = useState("");
  const [doneScore, setDoneScore] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [phase]);

  const elapsed = startedAt ? (now - startedAt) / 1000 : 0;

  // Transitions automatiques — dérivées du temps écoulé, jamais d'état à piloter à la main.
  useEffect(() => {
    if (phase !== "running") return;
    if (program.kind === "emom" && elapsed >= program.totalSeconds) setPhase("done");
    else if (program.kind === "interval" && elapsed >= program.totalSeconds) setPhase("done");
    else if (program.kind === "amrap" && elapsed >= program.totalSeconds) setPhase("score");
    else if (program.kind === "fortime" && program.capSeconds !== null && elapsed >= program.capSeconds) setPhase("score");
  }, [elapsed, phase, program]);

  const start = () => {
    setStartedAt(Date.now());
    setNow(Date.now());
    setPhase("running");
  };

  const cancel = () => {
    setPhase("idle");
    setStartedAt(null);
  };

  const finishNow = () => {
    // For time / repli inconnu : le chrono lui-même est le score.
    const score = formatClock(elapsed);
    setDoneScore(score);
    setPhase("done");
    onComplete(score);
  };

  const validateScore = () => {
    const score = scoreInput.trim() || null;
    setDoneScore(score);
    setPhase("done");
    onComplete(score);
  };

  const validateEmptyDone = () => {
    setPhase("done");
    onComplete(scoreInput.trim() || null);
  };

  const reference = (
    <div className="mt-4 divide-y divide-line/70 border-t border-line/70">
      {exercices.map((e) => (
        <ExerciceRef key={e.id} e={e} />
      ))}
    </div>
  );

  if (phase === "idle") {
    return (
      <div className="mt-3 space-y-4">
        <button type="button" onClick={start} className={launchBtn}>
          Lancer le WOD
        </button>
        {reference}
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="mt-3 rounded-2xl border border-brand/40 bg-brand/10 p-4 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">WOD terminé ✓</p>
        {doneScore && <p className="mt-1 text-2xl font-extrabold text-brand">{doneScore}</p>}
      </div>
    );
  }

  if (phase === "score") {
    const hint = extractScoreHint(formatEntete);
    return (
      <div className="mt-3 space-y-3 rounded-2xl border border-accent/40 bg-accent/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
          {program.kind === "fortime" ? "Temps écoulé — score à saisir" : "Temps écoulé — valide ton score"}
        </p>
        <input
          autoFocus
          value={scoreInput}
          onChange={(e) => setScoreInput(e.target.value)}
          placeholder={hint ? `ex. ${hint}` : "ex. 4 rounds + 12 reps"}
          className="w-full rounded-xl border border-line bg-bg/70 px-4 py-3 text-center text-lg outline-none focus:border-brand"
        />
        <button type="button" onClick={validateScore} className={launchBtn}>
          Valider le score
        </button>
      </div>
    );
  }

  // phase === "running"
  return (
    <div className="mt-3 space-y-4">
      {program.kind === "emom" && <EmomRunning program={program} elapsed={elapsed} exercices={exercices} />}
      {program.kind === "interval" && <IntervalRunning program={program} elapsed={elapsed} exercices={exercices} />}
      {program.kind === "amrap" && (
        <div className="rounded-3xl border border-accent/40 bg-accent/10 p-6 text-center">
          <p className={bigClock}>{formatClock(program.totalSeconds - elapsed)}</p>
          <p className="mt-2 eyebrow !text-accent">Temps restant — AMRAP</p>
        </div>
      )}
      {(program.kind === "fortime" || program.kind === "unknown") && (
        <div className="rounded-3xl border border-accent/40 bg-accent/10 p-6 text-center">
          <p className={bigClock}>{formatClock(elapsed)}</p>
          <p className="mt-2 eyebrow !text-accent">
            {program.kind === "fortime" && program.capSeconds !== null
              ? `Chrono en cours — cap ${formatClock(program.capSeconds)}`
              : "Chrono en cours"}
          </p>
        </div>
      )}

      {(program.kind === "fortime" || program.kind === "unknown") && (
        <button type="button" onClick={finishNow} className={launchBtn}>
          Terminé !
        </button>
      )}
      {(program.kind === "emom" || program.kind === "interval") && (
        <button type="button" onClick={validateEmptyDone} className={ghostBtn}>
          Terminer maintenant
        </button>
      )}

      {reference}
      <button type="button" onClick={cancel} className={cancelLink}>
        Annuler ce lancement
      </button>
    </div>
  );
}

function EmomRunning({
  program,
  elapsed,
  exercices,
}: {
  program: Extract<WodProgram, { kind: "emom" }>;
  elapsed: number;
  exercices: RunnerExercice[];
}) {
  const round = Math.min(program.totalRounds, Math.floor(elapsed / 60) + 1);
  const secsLeft = 60 - (Math.floor(elapsed) % 60);
  const next = round < program.totalRounds ? exercices[round % exercices.length] : null;
  const current = exercices.length ? exercices[(round - 1) % exercices.length] : null;
  return (
    <div className="rounded-3xl border border-accent/40 bg-accent/10 p-6 text-center">
      <p className={bigClock}>{formatClock(secsLeft)}</p>
      <p className="mt-2 eyebrow !text-accent">
        EMOM · round {round} / {program.totalRounds}
      </p>
      {current && <p className="mt-3 text-lg font-bold">{current.nom}</p>}
      <p className="mt-2 text-[0.75rem] text-muted">
        {next ? (
          <>
            Prochain (round {round + 1}) : <span className="text-white">{next.nom}</span>
          </>
        ) : (
          "Dernier round"
        )}
      </p>
    </div>
  );
}

function IntervalRunning({
  program,
  elapsed,
  exercices,
}: {
  program: Extract<WodProgram, { kind: "interval" }>;
  elapsed: number;
  exercices: RunnerExercice[];
}) {
  const round = Math.min(program.totalRounds, Math.floor(elapsed / program.roundSeconds) + 1);
  const secsLeft = program.roundSeconds - (Math.floor(elapsed) % program.roundSeconds);
  return (
    <div className="rounded-3xl border border-accent/40 bg-accent/10 p-6 text-center">
      <p className={bigClock}>{formatClock(secsLeft)}</p>
      <p className="mt-2 eyebrow !text-accent">
        Round {round} / {program.totalRounds}
      </p>
      <div className="mt-3 space-y-1 text-left">
        <p className="text-[0.68rem] uppercase tracking-[0.12em] text-muted">Mouvements de ce round</p>
        {exercices.map((e) => (
          <p key={e.id} className="text-sm">
            {e.nom} <span className="text-muted">— {[e.notation, e.charge].filter(Boolean).join(" · ")}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
