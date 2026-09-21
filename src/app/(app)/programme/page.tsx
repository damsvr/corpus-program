import Link from "next/link";
import { requireUser } from "@/lib/session";
import { MODULE_META, PROFILE_META } from "@/lib/profiles";
import { MODULES, filterModule, getActiveProgram, getWeek } from "@/lib/program";
import { BlocCard } from "@/components/bloc-card";

export const metadata = { title: "Programme — Corpus Program" };

const pill = (active: boolean) =>
  `shrink-0 rounded-full border px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] ${
    active ? "border-accent text-accent" : "border-line text-white/80"
  }`;

export default async function ProgrammePage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string; j?: string }>;
}) {
  const sp = await searchParams;
  const user = await requireUser();
  const meta = PROFILE_META[user.activeProfile];
  const program = await getActiveProgram(user.id, user.activeProfile);

  if (!program || program.weeks.length === 0) {
    return (
      <div className="space-y-6">
        <p className="eyebrow">Programmation</p>
        <h1 className="text-3xl font-extrabold uppercase">{meta.label}</h1>
        <p className="text-muted">Aucune semaine importée pour ce profil.</p>
        <Link href="/import" className="grad-accent inline-block rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black">
          Importer une semaine
        </Link>
      </div>
    );
  }

  const requested = sp.w ? parseInt(sp.w, 10) : undefined;
  const week = await getWeek(program.id, Number.isFinite(requested) ? requested : undefined);
  if (!week) return <p className="text-muted">Semaine introuvable.</p>;

  const requestedDay = sp.j ? parseInt(sp.j, 10) : undefined;
  const day = week.days.find((d) => d.jour === requestedDay) ?? week.days[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow !text-brand">Programmation</p>
        <h1 className="mt-1 text-2xl font-extrabold uppercase">{program.name}</h1>
      </div>

      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
        {program.weeks.map((w) => (
          <Link key={w.id} href={`/programme?w=${w.numero}`} className={pill(w.numero === week.numero)}>
            Week {String(w.numero).padStart(2, "0")}
          </Link>
        ))}
      </div>

      <p className="eyebrow">Séances de la semaine — dans l&apos;ordre que tu veux</p>
      <div className="flex gap-3 overflow-x-auto">
        {week.days.map((d) => (
          <Link
            key={d.id}
            href={`/programme?w=${week.numero}&j=${d.jour}`}
            className={`flex h-20 w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-2xl border text-center ${
              d.id === day?.id ? "grad-accent border-transparent text-black" : "border-line bg-card"
            }`}
          >
            <span className="text-[0.6rem] uppercase tracking-[0.16em]">{d.jourType === "TAMPON" ? "Tampon" : "Jour"}</span>
            <span className="text-2xl font-extrabold">{d.jourType === "TAMPON" ? "★" : d.jour}</span>
          </Link>
        ))}
      </div>

      {day && (
        <div className="space-y-4">
          <div>
            <p className="eyebrow">
              Jour {day.jour} · {day.jourType === "TAMPON" ? "Jour tampon" : "Séance"}
              {day.dureeEstimeeMin ? ` · ≈ ${day.dureeEstimeeMin} min` : ""}
            </p>
            <h2 className="mt-1 text-3xl font-extrabold uppercase leading-tight">{day.titre}</h2>
          </div>

          {day.blocs.some((b) => b.module)
            ? MODULES.map((m) => {
                const blocs = filterModule(day, m);
                if (!blocs.length) return null;
                return (
                  <div key={m} className="space-y-3">
                    <p className="eyebrow !text-accent">
                      Module {MODULE_META[m].label} · 20&apos; — {MODULE_META[m].rule}
                    </p>
                    {blocs.map((b) => (
                      <BlocCard key={b.id} bloc={b} />
                    ))}
                  </div>
                );
              })
            : day.blocs.map((b) => <BlocCard key={b.id} bloc={b} />)}

          <Link
            href={`/seance/${day.id}`}
            className="grad-accent block rounded-full px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.14em] text-black"
          >
            Démarrer
          </Link>
        </div>
      )}
    </div>
  );
}
