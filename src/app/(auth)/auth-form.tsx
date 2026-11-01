"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "./actions";

type Props = {
  mode: "login" | "signup";
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  /** Code d'un lien d'accès gratuit, transmis à l'inscription. */
  code?: string;
};

const input =
  "w-full rounded-2xl border border-line bg-bg/70 px-5 py-4 text-base text-white placeholder:text-muted/60 outline-none focus:border-brand";

export function AuthForm({ mode, action, code }: Props) {
  const [state, formAction] = useActionState(action, undefined);
  const isSignup = mode === "signup";
  return (
    <form action={formAction} className="rounded-3xl border border-line bg-card p-6 space-y-5">
      {code && <input type="hidden" name="code" value={code} />}
      {isSignup && (
        <label className="block">
          <span className="eyebrow">{code ? "Prénom et nom" : "Prénom"}</span>
          <input name="name" required={Boolean(code)} autoComplete="given-name" placeholder="Damien" className={`${input} mt-2`} />
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
      {code && (
        <label className="flex items-start gap-3 text-sm text-muted">
          <input type="checkbox" name="marketingOptIn" className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" />
          <span>
            J&apos;accepte d&apos;être recontacté par e-mail pour les prochaines sessions gratuites et les offres
            d&apos;abonnement. Désactivable à tout moment dans mon profil.
          </span>
        </label>
      )}
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
