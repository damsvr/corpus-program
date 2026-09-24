"use client";

import { useState } from "react";

const box =
  "w-16 rounded-xl border border-line bg-bg/70 px-2 py-2 text-center text-base outline-none focus:border-brand";

/** Saisie mm:ss en deux champs numériques : le clavier numérique mobile n'a pas de touche « : ». */
export function TimeInput({ name, defaultValue, id }: { name: string; defaultValue?: string | null; id?: string }) {
  const [initMin, initSec] = (defaultValue ?? "").split(":");
  const [min, setMin] = useState(initMin ?? "");
  const [sec, setSec] = useState(initSec ?? "");

  const digits = (s: string) => s.replace(/\D/g, "").slice(0, 2);
  const value = min === "" && sec === "" ? "" : `${min || "0"}:${sec.padStart(2, "0") || "00"}`;

  return (
    <span className="flex items-center gap-1.5">
      <input type="hidden" name={name} value={value} />
      <input
        id={id}
        aria-label="Minutes"
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="next"
        placeholder="min"
        value={min}
        onChange={(e) => setMin(digits(e.target.value))}
        className={box}
      />
      <span className="text-muted">:</span>
      <input
        aria-label="Secondes"
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="done"
        placeholder="sec"
        value={sec}
        onChange={(e) => setSec(digits(e.target.value))}
        className={box}
      />
    </span>
  );
}
