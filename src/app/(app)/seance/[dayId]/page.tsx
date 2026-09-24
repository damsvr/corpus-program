import Link from "next/link";
import { notFound } from "next/navigation";
import type { ModuleType } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { MODULE_META } from "@/lib/profiles";
import { programOwnerId } from "@/lib/program";
import { parseNotation, repsAsNumber } from "@/lib/format";
import { SessionRunner, type RunnerBloc } from "./runner";

export const metadata = { title: "Séance — Corpus Program" };

const MODULES: ModuleType[] = ["CHARGE", "VOLUME", "MOTEUR"];

export default async function SeancePage({
  params,
  searchParams,
}: {
  params: Promise<{ dayId: string }>;
  searchParams: Promise<{ module?: string }>;
}) {
  const { dayId } = await params;
  const sp = await searchParams;
  const user = await requireUser();
  const ownerId = await programOwnerId(user);

  const day = await db.day.findFirst({
    where: { id: dayId, week: { program: { userId: ownerId } } },
    include: { blocs: { orderBy: { ordre: "asc" }, include: { exercices: { orderBy: { ordre: "asc" } } } } },
  });
  if (!day) notFound();

  const mod = MODULES.find((m) => m === sp.module) ?? null;
  // Un bloc sans module (échauffement général hors budget des 20 min) est
  // rattaché au lancement du module Charge, seul module garanti en premier
  // dans la journée — sinon il ne serait jamais accessible via un module précis.
  const blocs = day.blocs.filter((b) =>
    mod ? b.module === mod || (mod === "CHARGE" && b.module === null) : true,
  );

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

  const runnerBlocs: RunnerBloc[] = blocs.map((b) => ({
    id: b.id,
    nom: b.nom,
    dureeMin: b.dureeMin,
    formatEntete: b.formatEntete,
    note: b.note,
    isWod: b.isWod,
    exercices: b.exercices.map((e) => {
      const n = parseNotation(e.notation);
      return {
        id: e.id,
        nom: e.nom,
        notation: e.notation,
        charge: e.charge,
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
          Jour {day.jour}
          {mod ? ` · Module ${MODULE_META[mod].label}` : ""}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold uppercase leading-tight">{day.titre}</h1>
      </div>
      {warning && <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">{warning}</p>}
      <SessionRunner dayId={day.id} module={mod} blocs={runnerBlocs} />
    </div>
  );
}
