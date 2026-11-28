"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { startCheckout } from "./actions";

export function SubscribeForm({ label }: { label: string }) {
  const [state, action] = useActionState(startCheckout, undefined);
  return (
    <form action={action} className="space-y-4">
      <label className="flex items-start gap-3 text-sm text-muted">
        <input type="checkbox" name="renonciation" required className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" />
        <span>
          Je veux accéder au programme dès le paiement et je reconnais perdre mon droit de rétractation de 14 jours pour ce
          contenu numérique. L&apos;abonnement reste résiliable à tout moment.
        </span>
      </label>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}
      <SubmitButton pendingLabel="Ouverture du paiement…">{label}</SubmitButton>
    </form>
  );
}
