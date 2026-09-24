"use client";

import { useState } from "react";

const primary = "grad-accent w-full rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black disabled:opacity-60";
const ghost = "w-full rounded-full border border-line px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-muted disabled:opacity-60";

export function SharePanel({ sessionId }: { sessionId: string }) {
  const [style, setStyle] = useState<"fond" | "sticker">("fond");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const url = `/api/share/${sessionId}?style=${style}`;

  const fetchFile = async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Image indisponible");
    const blob = await res.blob();
    return new File([blob], `corpus-seance-${style}.png`, { type: "image/png" });
  };

  const download = (file: File) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setMessage("Le partage a échoué, réessaie.");
    } finally {
      setBusy(false);
    }
  };

  const share = () =>
    run(async () => {
      const file = await fetchFile();
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        download(file);
        setMessage("Partage direct indisponible sur cet appareil : l'image a été enregistrée.");
      }
    });

  const save = () => run(async () => download(await fetchFile()));

  const tab = (value: "fond" | "sticker", label: string) => (
    <button
      type="button"
      onClick={() => setStyle(value)}
      aria-pressed={style === value}
      className={`flex-1 rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] ${
        style === value ? "grad-accent text-black" : "border border-line text-muted"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {tab("fond", "Avec fond")}
        {tab("sticker", "Sticker transparent")}
      </div>

      <div
        className="mx-auto w-full max-w-[300px] overflow-hidden rounded-3xl border border-line"
        style={
          style === "sticker"
            ? {
                backgroundColor: "#3a3a3a",
                backgroundImage:
                  "conic-gradient(#555 25%, #3a3a3a 0 50%, #555 0 75%, #3a3a3a 0)",
                backgroundSize: "24px 24px",
              }
            : undefined
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={style} src={url} alt="Aperçu de la carte de séance" className="block aspect-[9/16] w-full" />
      </div>
      {style === "sticker" && (
        <p className="text-center text-xs text-muted">
          Enregistre le sticker, puis ajoute-le sur ta photo dans la story Instagram ou Snapchat.
        </p>
      )}

      <div className="space-y-3">
        <button type="button" onClick={share} disabled={busy} className={primary}>
          {busy ? "Préparation…" : "Partager"}
        </button>
        <button type="button" onClick={save} disabled={busy} className={ghost}>
          Enregistrer l&apos;image
        </button>
      </div>
      {message && <p role="status" className="text-center text-sm text-muted">{message}</p>}
    </div>
  );
}
