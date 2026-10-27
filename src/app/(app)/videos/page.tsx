import Link from "next/link";
import { requireCoach } from "@/lib/session";
import { listMovements } from "@/lib/video-library";
import { watchUrl, youtubeSearchUrl } from "@/lib/video";
import { SaveForm } from "@/components/save-form";
import { saveVideo } from "./actions";

export const metadata = { title: "Vidéos des mouvements — Corpus Program" };

const pill = (active: boolean) =>
  `rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] ${
    active ? "border-accent text-accent" : "border-line text-white/80"
  }`;

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const sp = await searchParams;
  const coach = await requireCoach();
  const all = await listMovements(coach.id);
  const withVideo = all.filter((m) => m.video).length;
  const onlyMissing = sp.f !== "all";
  const rows = onlyMissing ? all.filter((m) => !m.video) : all;

  return (
    <div className="space-y-6">
      <Link href="/profil" className="eyebrow !text-brand">
        ← Profil
      </Link>
      <div>
        <p className="eyebrow !text-brand">Coach</p>
        <h1 className="mt-1 text-3xl font-extrabold uppercase leading-tight">Vidéos des mouvements</h1>
        <p className="mt-2 text-sm text-muted">
          Colle un lien YouTube par mouvement : il s&apos;applique à toutes les semaines, présentes et futures. Sans lien, les athlètes
          ont un bouton ▶ qui ouvre la recherche YouTube du mouvement.
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-brand">
          {withVideo} / {all.length} mouvements avec vidéo
        </p>
      </div>

      <div className="flex gap-2">
        <Link href="/videos" className={pill(onlyMissing)}>
          À compléter ({all.length - withVideo})
        </Link>
        <Link href="/videos?f=all" className={pill(!onlyMissing)}>
          Tous ({all.length})
        </Link>
      </div>

      {rows.length === 0 && (
        <p className="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-brand">
          {all.length === 0 ? "Aucun mouvement : importe d'abord une semaine." : "Tous les mouvements ont une vidéo."}
        </p>
      )}

      <ul className="space-y-3">
        {rows.map((m) => (
          <li key={m.key} className="rounded-3xl border border-line bg-card p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium leading-snug">{m.nom}</p>
              <span className="shrink-0 text-[0.68rem] uppercase tracking-[0.1em] text-muted">
                {m.count} fois
              </span>
            </div>
            <div className="mt-3">
              <SaveForm action={saveVideo} label="Enregistrer">
                <input type="hidden" name="nom" value={m.nom} />
                <input
                  name="url"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  placeholder="https://www.youtube.com/watch?v=…"
                  defaultValue={m.video ? watchUrl(m.video) : ""}
                  aria-label={`Lien YouTube : ${m.nom}`}
                  className="w-full rounded-xl border border-line bg-bg/70 px-3 py-3 text-sm outline-none focus:border-brand"
                />
              </SaveForm>
            </div>
            <a
              href={youtubeSearchUrl(m.nom)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[0.68rem] uppercase tracking-[0.12em] text-accent"
            >
              Chercher sur YouTube ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
