"use client";

import Link from "next/link";
import { useState } from "react";
import { setProfile } from "../profil/actions";

const QUESTIONS = [
  {
    q: "Est-ce que tu peux bloquer 75 minutes, quatre fois par semaine, six semaines d'affilée, sans avoir à négocier avec qui que ce soit ?",
    no: "FUNCTIONAL",
    yes: 2,
  },
  {
    q: "Est-ce que tu es prêt à passer du temps sur la technique, sans que le résultat se voie tout de suite ?",
    yes: "CROSSFIT",
    no: 3,
  },
  {
    q: "Est-ce que tu veux voir tes chiffres monter, avec ou sans dossard ?",
    yes: "HYBRID",
    no: "FUNCTIONAL",
  },
] as const;

const RESULT: Record<string, { label: string; promise: string }> = {
  CROSSFIT: { label: "CrossFit", promise: "Apprends les mouvements qui te bloquent." },
  HYBRID: { label: "Hybrid", promise: "Plus lourd, plus vite, plus loin." },
  FUNCTIONAL: { label: "Functional", promise: "Un corps qui tient." },
};

export function Quiz() {
  const [step, setStep] = useState<number>(1);
  const [result, setResult] = useState<string | null>(null);

  const answer = (yes: boolean) => {
    const q = QUESTIONS[step - 1];
    const next = yes ? q.yes : q.no;
    if (typeof next === "number") setStep(next);
    else setResult(next);
  };

  if (result) {
    const r = RESULT[result];
    return (
      <div data-profile={result.toLowerCase()} className="space-y-5 rounded-3xl border border-accent bg-card p-6">
        <p className="eyebrow">Ton profil</p>
        <p className="grad-text text-5xl font-extrabold">{r.label}</p>
        <p className="text-lg">{r.promise}</p>
        <form action={setProfile}>
          <input type="hidden" name="profile" value={result} />
          <button type="submit" className="grad-accent w-full rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black">
            Choisir {r.label}
          </button>
        </form>
        <button onClick={() => { setResult(null); setStep(1); }} className="w-full text-xs uppercase tracking-[0.16em] text-muted">
          Recommencer
        </button>
        <Link href="/aujourdhui" className="block text-center text-xs uppercase tracking-[0.16em] text-brand">
          Continuer →
        </Link>
      </div>
    );
  }

  const q = QUESTIONS[step - 1];
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
