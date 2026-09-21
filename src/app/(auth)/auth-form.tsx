"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "./actions";

type Props = {
  mode: "login" | "signup";
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
};

const input =
  "w-full rounded-2xl border border-line bg-bg/70 px-5 py-4 text-base text-white placeholder:text-muted/60 outline-none focus:border-brand";

export function AuthForm({ mode, action }: Props) {
  const [state, formAction] = useActionState(action, undefined);
  const isSignup = mode === "signup";
  return (
    <form action={formAction} className="rounded-3xl border border-line bg-card p-6 space-y-5">
      {isSignup && (
        <label className="block">
          <span className="eyebrow">Prénom</span>
          <input name="name" autoComplete="given-name" placeholder="Damien" className={`${input} mt-2`} />
        </label>
      )}
      <label className="block">
        <span className="eyebrow">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@corpus.fit"
          className={`${input} mt-2`}
        />
      </label>
      <label className="block">
        <span className="eyebrow">Mot de passe</span>
        <input
          name="password"
          type="password"
          required
          minLength={isSignup ? 8 : 1}
          autoComplete={isSignup ? "new-password" : "current-password"}
          placeholder={isSignup ? "8 caractères minimum" : "••••••••"}
          className={`${input} mt-2`}
        />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}
      <SubmitButton pendingLabel={isSignup ? "Création…" : "Connexion…"}>
        {isSignup ? "Créer mon compte" : "Se connecter"}
      </SubmitButton>
      <p className="text-center text-xs uppercase tracking-[0.16em] text-muted">
        {isSignup ? "Déjà un compte ? " : "Pas de compte ? "}
        <Link href={isSignup ? "/login" : "/signup"} className="text-brand">
          {isSignup ? "Se connecter" : "Créer un compte"}
        </Link>
      </p>
    </form>
  );
}
