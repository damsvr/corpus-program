import Link from "next/link";
import type { ModuleType } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { MODULE_META, PROFILE_META } from "@/lib/profiles";
import { MODULES, countSets, filterModule, getActiveProgram, getWeek, type DayFull } from "@/lib/program";

export const metadata = { title: "Aujourd'hui — Corpus Program" };

const startBtn =
  "grad-accent inline-flex items-center justify-center rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black";

export default async function AujourdhuiPage() {
  const user = await requireUser();
  const meta = PROFILE_META[user.activeProfile];
  const program = await getActiveProgram(user.id, user.activeProfile);
  const week = program ? await getWeek(program.id) : null;

  if (!week) {
    return (
      <div className="space-y-6">
        <p className="eyebrow">Profil {meta.label}</p>
        <h1 className="text-3xl font-extrabold">Pas encore de programme</h1>
        <p className="text-muted">
          Prépare ta semaine avec l&apos;agent {meta.label}, relis-la, puis importe le JSON validé.
        </p>
        <Link href="/import" className={startBtn}>
          Importer une semaine
        </Link>
      </div>
    );
  }

  const dayIds = week.days.map((d) => d.id);
  const done = await db.sessionLog.findMany({
    where: { userId: user.id, dayId: { in: dayIds }, endedAt: { not: null } },
    select: { dayId: true, module: true },
  });
  const isDone = (dayId: string, module: ModuleType | null) =>
    done.some((s) => s.dayId === dayId && s.module === module);

  const training = week.days.filter((d) => d.jourType === "ENTRAINEMENT");
  const tampon = week.days.find((d) => d.jourType === "TAMPON");

  const missed: string[] = [];
  if (tampon) {
    for (const d of training) {
      for (const m of MODULES) {
        if (filterModule(d, m).length && !isDone(d.id, m)) {
          missed.push(`Jour ${d.jour} · ${MODULE_META[m].label}`);
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-line bg-gradient-to-b from-card2 to-card p-6">
        <div className="grad-accent h-[3px] w-12 rounded-full" />
        <p className="eyebrow mt-4 !text-brand">
          Semaine {String(week.numero).padStart(2, "0")} · bloc {week.blocNumero} · S{week.semaineDansBloc}
        </p>
        <h1 className="mt-1 text-4xl font-extrabold uppercase">Ta semaine</h1>
        <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em]">
          <span className="rounded-full border border-line px-4 py-2">{training.length} séances</span>
          <span className="rounded-full border border-line px-4 py-2 text-accent">{meta.label}</span>
          {week.dureeTotaleMin && (
            <span className="rounded-full border border-line px-4 py-2">≈ {week.dureeTotaleMin} min</span>
          )}
        </div>
      </section>

      <Link
        href="/programme"
        className="flex items-center justify-between rounded-3xl border border-line bg-card px-6 py-5 text-lg font-extrabold uppercase"
      >
        Voir le programme <span className="text-accent">→</span>
      </Link>

      <p className="eyebrow">Séances de la semaine — dans l&apos;ordre que tu veux</p>

      {training.map((day) => (
        <DayCard key={day.id} day={day} isDone={isDone} />
      ))}

      {tampon && (
        <section className="rounded-3xl border border-dashed border-line bg-card p-6">
          <p className="eyebrow !text-brand">Jour tampon</p>
          <h2 className="mt-1 text-xl font-extrabold uppercase">{tampon.titre}</h2>
          <p className="mt-3 text-sm text-muted">
            Il absorbe les modules sautés de la semaine. Rien n&apos;a été sauté ? Il devient mobilité et point faible.
          </p>
          {missed.length > 0 ? (
            <div className="mt-4 rounded-2xl bg-accent/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
                Encore à faire cette semaine ({missed.length})
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {missed.map((m) => (
                  <li key={m}>• {m}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">
                Ceux qui n&apos;auront pas été faits en fin de semaine se rattrapent ici : Charge en premier, Moteur au moins 20 min après.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-brand">Tout est réalisé : le tampon = mobilité et point faible.</p>
          )}
          <div className="mt-5">
            <Link href={`/seance/${tampon.id}`} className={startBtn}>
              Démarrer
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function DayCard({
  day,
  isDone,
}: {
  day: DayFull;
  isDone: (dayId: string, module: ModuleType | null) => boolean;
}) {
  const sets = day.blocs.reduce((a, b) => a + countSets(b), 0);
  const hasModules = day.blocs.some((b) => b.module);
  return (
    <section className="rounded-3xl border border-line bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow !text-brand">Jour {day.jour}</p>
          <h2 className="mt-1 text-2xl font-extrabold uppercase leading-tight">{day.titre}</h2>
          <p className="eyebrow mt-2">
            {day.blocs.length} blocs · {sets} séries
            {day.dureeEstimeeMin ? ` · ≈ ${day.dureeEstimeeMin} min` : ""}
          </p>
        </div>
        <span className="text-4xl font-extrabold text-line">{String(day.jour).padStart(2, "0")}</span>
      </div>

      {hasModules ? (
        <ul className="mt-5 space-y-3">
          {MODULES.map((m) => {
            const blocs = filterModule(day, m);
            if (!blocs.length) return null;
            const finished = isDone(day.id, m);
            return (
              <li key={m} className="flex items-center justify-between gap-3 rounded-2xl bg-bg/60 px-4 py-3">
                <div>
                  <p className="text-sm font-bold uppercase">
                    {MODULE_META[m].label} <span className="text-muted">· 20&apos;</span>
                  </p>
                  <p className="text-[0.72rem] text-muted">{MODULE_META[m].rule}</p>
                </div>
                {finished ? (
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">✓ Fait</span>
                ) : (
                  <Link
                    href={`/seance/${day.id}?module=${m}`}
                    className="grad-accent rounded-full px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-black"
                  >
                    Démarrer
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-line/70 border-t border-line/70">
            {day.blocs.slice(0, 3).map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-3 text-sm uppercase">
                <span className="grad-accent h-4 w-1 rounded-full" />
                {b.nom}
              </li>
            ))}
            {day.blocs.length > 3 && (
              <li className="py-3 text-sm text-muted">+ {day.blocs.length - 3} {day.blocs.length - 3 > 1 ? "autres blocs" : "autre bloc"}</li>
            )}
          </ul>
          <div className="mt-4">
            {isDone(day.id, null) ? (
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">✓ Séance réalisée</span>
            ) : (
              <Link href={`/seance/${day.id}`} className={startBtn}>
                Démarrer
              </Link>
            )}
          </div>
        </>
      )}
    </section>
  );
}
