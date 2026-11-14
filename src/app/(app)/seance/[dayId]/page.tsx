import Link from "next/link";
import { notFound } from "next/navigation";
import type { ModuleType } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { JOURS, MODULE_META } from "@/lib/profiles";
import { programOwnerId } from "@/lib/program";
import { getAccess } from "@/lib/access";
import { parseNotation, repsAsNumber } from "@/lib/format";
import { personalizeCharge } from "@/lib/load-calc";
import { isOptionalBloc, shortVersionSavings } from "@/lib/session-plan";
import { anyVariants } from "@/lib/variants";
import { VariantToggle } from "@/components/variant";
import { SessionRunner, type RunnerBloc } from "./runner";

export const metadata = { title: "Séance — Corpus Program" };

const MODULES: ModuleType[] = ["CHARGE", "VOLUME", "MOTEUR"];

export default async function SeancePage({
  params,
  searchParams,
}: {
  params: Promise<{ dayId: string }>;
  searchParams: Promise<{ module?: string; court?: string }>;
}) {
  const { dayId } = await params;
  const sp = await searchParams;
  const user = await requireUser();
  const [ownerId, access] = await Promise.all([programOwnerId(user), getAccess(user)]);

  const day = await db.day.findFirst({
    where: { id: dayId, week: { AND: [access.weekWhere, { program: { userId: ownerId } }] } },
    include: {
      week: { select: { blocNumero: true, semaineDansBloc: true } },
      blocs: { orderBy: { ordre: "asc" }, include: { exercices: { orderBy: { ordre: "asc" } } } },
    },
  });
  if (!day) notFound();

  const mod = MODULES.find((m) => m === sp.module) ?? null;
  // Un bloc sans module (échauffement général hors budget des 20 min) est
  // rattaché au lancement du module Charge, seul module garanti en premier
  // dans la journée — sinon il ne serait jamais accessible via un module précis.
  const inModule = day.blocs.filter((b) =>
    mod ? b.module === mod || (mod === "CHARGE" && b.module === null) : true,
  );
  // Version courte : retire les sections optionnelles (complémentaire, finisher…) quand le temps manque.
  const savings = shortVersionSavings(inModule);
  const hasOptional = inModule.some(isOptionalBloc);
  const short = sp.court === "1" && hasOptional;
  const blocs = short ? inModule.filter((b) => !isOptionalBloc(b)) : inModule;
  const prs = await db.prs.findUnique({ where: { userId: user.id } });
  let needsPr = false;

  // Règle de placement Functional : le module Moteur vient ≥ 20 min après Charge.
  let warning: string | null = null;
  if (mod === "MOTEUR") {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const charge = await db.sessionLog.findFirst({
      where: { userId: user.id, dayId, module: "CHARGE", endedAt: { gte: startOfDay } },
      orderBy: { endedAt: "desc" },
    });
    if (!charge?.endedAt) {
      warning = "Le module Charge passe en premier dans la journée (corps frais). Fais-le avant le Moteur.";
    } else {
      const mins = (Date.now() - charge.endedAt.getTime()) / 60000;
      if (mins < 20) warning = `Encore ${Math.ceil(20 - mins)} min avant le Moteur : il vient au moins 20 min après le module Charge.`;
    }
  }
  if (mod === "CHARGE") {
    warning = "Module Charge : corps frais obligatoire, à faire en premier dans la journée.";
  }

  const weekday = JOURS.find((j) => j.key === day.weekday)?.label ?? null;

  const runnerBlocs: RunnerBloc[] = blocs.map((b) => ({
    id: b.id,
    nom: b.nom,
    dureeMin: b.dureeMin,
    formatEntete: b.formatEntete,
    note: b.note,
    isWod: b.isWod,
    optionnel: b.optionnel,
    exercices: b.exercices.map((e) => {
      const n = parseNotation(e.notation);
      // % TM / % PDC → kg d'après les PR de l'athlète.
      const charge = personalizeCharge(e.nom, e.charge, prs);
      if (charge.unresolved) needsPr = true;
      return {
        id: e.id,
        nom: e.nom,
        notation: e.notation,
        charge: charge.text || e.charge,
        repos: e.repos,
        note: e.note,
        sets: n.sets,
        defaultReps: repsAsNumber(n.reps),
      };
    }),
  }));

  return (
    <div className="space-y-6">
      <Link href="/aujourdhui" className="eyebrow !text-brand">
        ← Retour
      </Link>
      <div>
        <p className="eyebrow">
          Bloc {day.week.blocNumero} · Semaine {day.week.semaineDansBloc} · Jour {day.jour}
          {mod ? ` · Module ${MODULE_META[mod].label}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold uppercase leading-tight">{day.titre}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-[0.8rem] text-white/80">
          {weekday && <span className="rounded-full border border-line px-3 py-1 uppercase tracking-[0.1em]">{weekday}</span>}
          {day.dureeEstimeeMin ? <span>≈ {day.dureeEstimeeMin} min</span> : null}
          <span>
            {blocs.length} section{blocs.length > 1 ? "s" : ""}
          </span>
        </p>
      </div>
      {warning && <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">{warning}</p>}
      {hasOptional && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-3">
          <p className="text-[0.78rem] text-muted">
            {short
              ? `Version courte${savings ? ` : environ ${savings} min en moins` : ""} — sections optionnelles retirées.`
              : `Pas le temps ? La version courte retire les sections optionnelles${savings ? ` (≈ ${savings} min)` : ""}.`}
          </p>
          <Link
            href={`/seance/${day.id}?${[mod ? `module=${mod}` : "", short ? "" : "court=1"].filter(Boolean).join("&")}`}
            className="shrink-0 rounded-full border border-accent/50 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-accent"
          >
            {short ? "Séance complète" : "Version courte"}
          </Link>
        </div>
      )}
      {anyVariants(blocs) && <VariantToggle />}
      {needsPr && (
        <p className="rounded-2xl border border-line bg-card px-4 py-3 text-[0.78rem] text-muted">
          Renseigne tes records dans{" "}
          <Link href="/profil" className="text-accent underline underline-offset-2">
            ton profil
          </Link>{" "}
          pour voir tes charges en kg (% TM, % du poids de corps).
        </p>
      )}
      <SessionRunner key={short ? "court" : "complet"} dayId={day.id} module={mod} blocs={runnerBlocs} />
    </div>
  );
}
