"use client";

import { useState } from "react";

const LONG = 150;

/** Note du coach : GATE / MARQUEUR mis en évidence, texte long replié avec « Lire plus ». */
export function Note({ text, inline = false }: { text: string; inline?: boolean }) {
  const [open, setOpen] = useState(false);
  const isGate = /^\s*GATE\s*:/i.test(text);
  const isMarker = /^\s*MARQUEUR\s*:/i.test(text);
  const long = text.length > LONG;
  const tone = isGate ? "text-brand" : isMarker ? "text-accent" : "text-muted";
  return (
    <div className={inline ? "mt-1.5" : "mt-3"}>
      <p className={`text-[0.8rem] leading-relaxed ${tone} ${long && !open ? "line-clamp-3" : ""}`}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen(!open)} className="mt-1 text-[0.72rem] font-medium uppercase tracking-[0.1em] text-white/80 underline-offset-4 hover:underline">
          {open ? "Réduire" : "Lire plus"}
        </button>
      )}
    </div>
  );
}
