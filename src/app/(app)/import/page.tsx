import { ImportForm } from "./import-form";

export const metadata = { title: "Importer — Corpus Program" };

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow !text-brand">Import de programmation</p>
        <h1 className="mt-1 text-3xl font-extrabold uppercase">Importer une semaine</h1>
        <p className="mt-3 text-sm text-muted">
          L&apos;agent prépare, tu relis et tu modifies, puis tu importes. Le JSON est vérifié avant toute écriture :
          structure, règles du profil, volume ≈ 300 min.
        </p>
      </div>
      <ImportForm />
    </div>
  );
}
