"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";

export type SaveState = { ok?: boolean; error?: string } | undefined;

export function SaveForm({
  action,
  children,
  label = "Enregistrer",
}: {
  action: (prev: SaveState, fd: FormData) => Promise<SaveState>;
  children: React.ReactNode;
  label?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-4">
      {children}
      {state?.error && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state?.ok && <p className="text-sm text-brand">✓ Enregistré</p>}
      <SubmitButton pendingLabel="Enregistrement…">{label}</SubmitButton>
    </form>
  );
}
