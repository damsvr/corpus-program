import Link from "next/link";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/session";
import { MODULE_META } from "@/lib/profiles";
import { formatDateFr } from "@/lib/format";

export const metadata = { title: "Feedback des athlètes — Corpus Program" };

export default async function RetoursPage() {
  await requireCoach();
  const sessions = await db.sessionLog.findMany({
    where: { endedAt: { not: null }, OR: [{ comment: { not: null } }, { voiceNote: { isNot: null } }] },
    orderBy: { endedAt: "desc" },
    take: 60,
    select: {
      id: true,
      endedAt: true,
      durationMin: true,
      module: true,
      comment: true,
      user: { select: { name: true, email: true } },
      day: { select: { titre: true } },
      voiceNote: { select: { durationSec: true } },
    },
  });

  return (
    <div className="space-y-6">
      <Link href="/profil" className="eyebrow !text-brand">
        ← Profil
      </Link>
      <div>
        <p className="eyebrow !text-brand">Coach</p>
        <h1 className="mt-1 text-3xl font-extrabold uppercase leading-tight">Feedback des athlètes</h1>
        <p className="mt-2 text-sm text-muted">Les feedbacks écrits et vocaux envoyés au coach à la fin des séances (privés : toi seul les vois), du plus récent au plus ancien.</p>
      </div>

      {sessions.length === 0 && <p className="text-muted">Aucun retour pour l&apos;instant.</p>}

      <ul className="space-y-3">
        {sessions.map((s) => (
          <li key={s.id} className="rounded-3xl border border-line bg-card p-5">
            <p className="text-sm font-bold uppercase text-accent">{s.user.name || s.user.email}</p>
            <p className="mt-1 text-base font-bold uppercase leading-snug">
              {s.day.titre}
              {s.module && <span className="text-accent"> · {MODULE_META[s.module].label}</span>}
            </p>
            <p className="eyebrow mt-2">
              {formatDateFr(s.endedAt!)} · {s.durationMin} min
            </p>
            {s.comment && <p className="mt-3 whitespace-pre-line rounded-2xl bg-bg/60 px-4 py-3 text-sm text-white/90">{s.comment}</p>}
            {s.voiceNote && (
              <audio controls preload="none" src={`/api/voix/${s.id}`} className="mt-3 w-full" aria-label={`Message vocal de ${s.user.name || s.user.email}`} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
