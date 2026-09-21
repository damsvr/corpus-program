"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { confirmImport, previewImport, type ImportPreview } from "./actions";

export function ImportForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [replace, setReplace] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, start] = useTransition();

  const onValidate = () =>
    start(async () => {
      setErrors([]);
      setPreview(await previewImport(text));
    });

  const onImport = () =>
    start(async () => {
      const r = await confirmImport(text, replace);
      if (r.ok) router.push(`/programme?w=${r.numero}`);
      else setErrors(r.errors);
    });

  return (
    <div className="space-y-5">
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setPreview(null);
        }}
        rows={12}
        spellCheck={false}
        placeholder='Colle ici le JSON produit par l’agent (contrat de sortie, docs/agents/01-schema-sortie-commun.md)'
        className="w-full rounded-2xl border border-line bg-card2 p-4 font-mono text-xs text-white outline-none focus:border-brand"
      />
      <button
        type="button"
        onClick={onValidate}
        disabled={pending || !text.trim()}
        className="w-full rounded-full border border-brand px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-brand disabled:opacity-40"
      >
        {pending ? "…" : "Valider le JSON"}
      </button>

      {preview && !preview.ok && (
        <div role="alert" className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-bold uppercase tracking-[0.12em]">{preview.errors.length} erreur(s) — import bloqué</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {preview.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {preview && preview.warnings.length > 0 && (
        <div className="rounded-2xl bg-amber-400/10 p-4 text-sm text-amber-200">
          <p className="font-bold uppercase tracking-[0.12em]">{preview.warnings.length} avertissement(s)</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {preview.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {preview?.ok && (
        <div className="rounded-3xl border border-line bg-card p-5">
          <p className="eyebrow !text-brand">JSON valide — aperçu</p>
          <p className="mt-2 text-lg font-extrabold uppercase">
            {preview.summary.profil} · bloc {preview.summary.bloc} · S{preview.summary.semaine} ({preview.summary.type})
          </p>
          {preview.summary.total && <p className="text-sm text-muted">≈ {preview.summary.total} min / semaine</p>}
          <ul className="mt-3 divide-y divide-line/70 text-sm">
            {preview.summary.seances.map((s, i) => (
              <li key={i} className="flex justify-between gap-3 py-2">
                <span>
                  J{s.jour} · {s.titre}
                  {s.jourType === "tampon" && <span className="text-brand"> (tampon)</span>}
                </span>
                <span className="shrink-0 text-muted">
                  {s.blocs} blocs{s.min ? ` · ${s.min} min` : ""}
                </span>
              </li>
            ))}
          </ul>
          <label className="mt-4 flex items-center gap-3 text-sm text-muted">
            <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} className="size-4 accent-[var(--brand)]" />
            Remplacer cette semaine si elle existe déjà
          </label>
          <button
            type="button"
            onClick={onImport}
            disabled={pending}
            className="grad-accent mt-4 w-full rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black disabled:opacity-60"
          >
            {pending ? "Import…" : "Importer dans mon programme"}
          </button>
          {errors.length > 0 && (
            <ul role="alert" className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-300">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
