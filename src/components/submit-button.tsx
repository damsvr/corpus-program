"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "…",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`grad-accent w-full rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black transition active:scale-[0.99] disabled:opacity-60 ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
