"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Variant } from "@/lib/variants";

const KEY = "corpus.variant";
const Ctx = createContext<{ mode: Variant; setMode: (v: Variant) => void }>({ mode: "rx", setMode: () => {} });

/** Version choisie (RX ou scaled), retenue sur l'appareil pour toutes les séances. */
export function VariantProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Variant>("rx");
  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === "scaled") setModeState("scaled");
    } catch {
      /* stockage indisponible : on reste en RX */
    }
  }, []);
  const setMode = (v: Variant) => {
    setModeState(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* ignoré */
    }
  };
  return <Ctx.Provider value={{ mode, setMode }}>{children}</Ctx.Provider>;
}

export const useVariant = () => useContext(Ctx);

/** Choix global RX / scaled, affiché quand la séance contient des variantes. */
export function VariantToggle() {
  const { mode, setMode } = useVariant();
  const btn = (v: Variant, label: string) => (
    <button
      type="button"
      onClick={() => setMode(v)}
      aria-pressed={mode === v}
      className={`rounded-full px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] ${
        mode === v ? "grad-accent text-black" : "text-white/80"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-3">
      <p className="text-[0.78rem] text-muted">Cette séance propose des versions RX et scaled.</p>
      <div className="flex shrink-0 rounded-full border border-line p-0.5">
        {btn("rx", "RX")}
        {btn("scaled", "Scaled")}
      </div>
    </div>
  );
}
