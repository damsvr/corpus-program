import type { WeekType } from "@prisma/client";
import { WEEK_TYPE_INFO } from "@/lib/week-type";
import type { SessionsPerWeek } from "@/lib/session-plan";

/** Semaine allégée / de réalisation : bandeau visible, la chargée reste discrète. */
export function WeekTypeBanner({ type, note }: { type: WeekType; note?: string | null }) {
  const info = WEEK_TYPE_INFO[type];
  if (!info.hint) return null;
  return (
    <div className={`rounded-2xl border px-4 py-3 ${info.tone === "brand" ? "border-brand/40 bg-brand/10" : "border-accent/40 bg-accent/10"}`}>
      <p className={`text-xs font-bold uppercase tracking-[0.14em] ${info.tone === "brand" ? "text-brand" : "text-accent"}`}>{info.label}</p>
      <p className="mt-1 text-[0.82rem] text-white/85">{info.hint}</p>
      {note && <p className="mt-1.5 text-[0.76rem] text-muted">{note}</p>}
    </div>
  );
}

/** Consigne de fréquence : 3× → la séance sautable est signalée ; 5× → séance légère conseillée. */
export function FrequencyNote({ sessionsPerWeek }: { sessionsPerWeek: SessionsPerWeek }) {
  if (sessionsPerWeek === 4) return null;
  return (
    <div className="rounded-2xl border border-line bg-card px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">{sessionsPerWeek} séances par semaine</p>
      <p className="mt-1 text-[0.82rem] text-white/85">
        {sessionsPerWeek === 3
          ? "Tu fais 3 des 4 séances : celle marquée « À sauter » est la plus facile à retirer. Garde les autres telles quelles."
          : "Les 4 séances restent le cœur de la semaine. Ajoute une 5ᵉ séance légère de 30 à 40 min (zone 2, mobilité), sans charge lourde, sur ton jour le plus calme."}
      </p>
    </div>
  );
}

export const SkippableBadge = () => (
  <span className="rounded-full border border-line px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-muted">
    À sauter à 3×/sem
  </span>
);
