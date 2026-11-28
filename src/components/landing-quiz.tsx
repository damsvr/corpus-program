"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProfileType } from "@prisma/client";
import { QUIZ_QUESTIONS } from "@/lib/profile-quiz";

const RESULT: Record<ProfileType, { key: string; label: string; promise: string; why: string }> = {
  CROSSFIT: {
    key: "crossfit",
    label: "CrossFit",
    promise: "Apprends les mouvements qui te bloquent.",
    why: "Tu peux bloquer tes créneaux et tu acceptes que la technique prenne du temps. On va enfin débloquer ce qui te résiste.",
  },
  HYBRID: {
    key: "hybrid",
    label: "Hybrid",
    promise: "Plus lourd, plus vite, plus loin.",
    why: "Tu veux voir tes chiffres monter, pour un Hyrox, un TyRun ou juste pour toi. Force et cardio, testés régulièrement.",
  },
  FUNCTIONAL: {
    key: "functional",
    label: "Functional",
    promise: "Un corps qui tient.",
    why: "Ta semaine bouge sans prévenir. 3 modules de 20 min à placer quand tu peux, et un jour tampon pour rattraper.",
  },
};

/** Quiz public de la landing : le profil trouvé est transmis à l'inscription (?profil=…). */
export function LandingQuiz({ source }: { source?: string }) {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<ProfileType | null>(null);

  const answer = (yes: boolean) => {
    const q = QUIZ_QUESTIONS[step - 1];
    const next = yes ? q.yes : q.no;
    if (typeof next === "number") setStep(next);
    else setResult(next);
  };

  if (result) {
    const r = RESULT[result];
    const href = `/signup?profil=${r.key}${source ? `&src=${encodeURIComponent(source)}` : ""}`;
    return (
      <div data-profile={r.key} className="space-y-5 rounded-3xl border border-accent bg-card p-6">
        <p className="eyebrow">Ton profil</p>
        <p className="grad-text text-5xl font-extrabold">{r.label}</p>
        <p className="text-lg font-bold">{r.promise}</p>
        <p className="text-muted">{r.why}</p>
        <Link
          href={href}
          className="grad-accent flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black"
        >
          Commencer en {r.label} · gratuit
        </Link>
        <button
          onClick={() => {
            setResult(null);
            setStep(1);
          }}
          className="w-full text-xs uppercase tracking-[0.16em] text-muted"
        >
          Refaire le quiz
        </button>
      </div>
    );
  }

  const q = QUIZ_QUESTIONS[step - 1];
  return (
    <div className="space-y-5 rounded-3xl border border-line bg-card p-6">
      <p className="eyebrow !text-brand">Question {step} / 3</p>
      <p className="text-lg leading-relaxed">{q.q}</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => answer(true)} className="grad-accent rounded-full py-4 text-sm font-bold uppercase tracking-[0.14em] text-black">
          Oui
        </button>
        <button onClick={() => answer(false)} className="rounded-full border border-line py-4 text-sm font-bold uppercase tracking-[0.14em]">
          Non
        </button>
      </div>
    </div>
  );
}
