import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { MODULE_META } from "@/lib/profiles";
import { formatDateFr, startOfWeek } from "@/lib/format";

export const metadata = { title: "Historique — Corpus Program" };

export default async function HistoriquePage() {
  const user = await requireUser();
  const sessions = await db.sessionLog.findMany({
    where: { userId: user.id, endedAt: { not: null } },
    orderBy: { endedAt: "desc" },
    take: 60,
    include: { day: { select: { titre: true } } },
  });

  const weekStart = startOfWeek(new Date());
  const thisWeek = sessions.filter((s) => s.endedAt! >= weekStart);
  const minutes = thisWeek.reduce((a, s) => a + (s.durationMin ?? 0), 0);
  const volume = thisWeek.reduce((a, s) => a + s.volumeKg, 0);

  const stat = (value: string | number, label: string) => (
    <div className="rounded-3xl border border-line bg-card p-4 text-center">
      <p className="grad-text text-3xl font-extrabold">{value}</p>
      <p className="eyebrow mt-1">{label}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow !text-brand">Progression</p>
        <h1 className="mt-1 text-4xl font-extrabold uppercase">Historique</h1>
      </div>

      <section className="space-y-3">
        <p className="eyebrow">
          Récap hebdo · {formatDateFr(weekStart)} → {formatDateFr(new Date())}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {stat(thisWeek.length, "Séances")}
          {stat(`${minutes} min`, "Temps")}
          {stat(`${Math.round(volume)} kg`, "Volume")}
        </div>
        <p className="text-center text-xs text-muted">{sessions.length} séance(s) au total</p>
      </section>

      <section className="space-y-3">
        <p className="eyebrow">Activités</p>
        {sessions.length === 0 && <p className="text-muted">Aucune séance réalisée pour l&apos;instant.</p>}
        <ul className="space-y-3">
          {sessions.map((s) => (
            <li key={s.id} className="rounded-3xl border border-line bg-card p-5">
              <p className="text-base font-bold uppercase">
                {s.day.titre}
                {s.module && <span className="text-accent"> · {MODULE_META[s.module].label}</span>}
              </p>
              <p className="eyebrow mt-2">
                {formatDateFr(s.endedAt!)} · {s.durationMin} min · volume {Math.round(s.volumeKg)} kg
              </p>
              {s.wodScore && <p className="mt-1 text-sm text-accent">Score WOD : {s.wodScore}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
