"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible : le lien reste sélectionnable à la main.
    }
  };
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-line bg-bg/70 p-2 pl-4">
      <span className="min-w-0 flex-1 select-all break-all text-sm">{url}</span>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-full border border-line px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-brand"
      >
        {copied ? "Copié ✓" : "Copier"}
      </button>
    </div>
  );
}
