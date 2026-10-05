import type { ModuleType, Prisma, ProfileType, User } from "@prisma/client";
import { db } from "@/lib/db";
import { parseNotation } from "@/lib/format";
import { compareWeeks, weekLabel } from "@/lib/week-label";

const weekInclude = {
  days: {
    orderBy: { jour: "asc" },
    include: {
      blocs: { orderBy: { ordre: "asc" }, include: { exercices: { orderBy: { ordre: "asc" } } } },
    },
  },
} satisfies Prisma.WeekInclude;

export type WeekFull = Prisma.WeekGetPayload<{ include: typeof weekInclude }>;
export type DayFull = WeekFull["days"][number];
export type BlocFull = DayFull["blocs"][number];

/**
 * Le COACH possède sa programmation ; un ATHLETE suit celle du coach (lecture
 * seule) tout en gardant son propre suivi (séances, historique, PR).
 *
 * Un athlète est servi par le coach qui a réellement publié des semaines pour
 * son profil actif (le plus récemment, s'il y en a plusieurs) — pas par le
 * premier compte COACH venu, qui pouvait n'avoir rien publié. Sans aucune
 * publication, repli sur un coach, puis sur l'athlète lui-même.
 */
export async function programOwnerId(user: User): Promise<string> {
  if (user.role === "COACH") return user.id;
  const published = await db.program.findMany({
    where: { profile: user.activeProfile, active: true, user: { role: "COACH" }, weeks: { some: {} } },
    select: { userId: true, weeks: { select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  const latest = (p: (typeof published)[number]) => p.weeks[0]?.createdAt.getTime() ?? 0;
  const best = published.sort((a, b) => latest(b) - latest(a))[0];
  if (best) return best.userId;
  const coach = await db.user.findFirst({ where: { role: "COACH" }, orderBy: { createdAt: "asc" }, select: { id: true } });
  return coach?.id ?? user.id;
}

export type PublicationStatus = {
  coaches: number;
  athletes: number;
  profiles: { profile: ProfileType; weeks: string[]; athletes: number }[];
};

/** Ce que les athlètes voient : semaines publiées par profil et nombre d'athlètes qui suivent chaque profil. */
export async function getPublicationStatus(coachId: string): Promise<PublicationStatus> {
  const [programs, users] = await Promise.all([
    db.program.findMany({
      where: { userId: coachId, active: true },
      select: { profile: true, weeks: { select: { blocNumero: true, semaineDansBloc: true } } },
    }),
    db.user.findMany({ select: { role: true, activeProfile: true } }),
  ]);
  const athletes = users.filter((u) => u.role === "ATHLETE");
  const profiles: ProfileType[] = ["CROSSFIT", "HYBRID", "FUNCTIONAL"];
  return {
    coaches: users.filter((u) => u.role === "COACH").length,
    athletes: athletes.length,
    profiles: profiles.map((profile) => ({
      profile,
      weeks: (programs.find((p) => p.profile === profile)?.weeks ?? []).sort(compareWeeks).map(weekLabel),
      athletes: athletes.filter((u) => u.activeProfile === profile).length,
    })),
  };
}

export async function getActiveProgram(userId: string, profile: ProfileType) {
  const program = await db.program.findFirst({
    where: { userId, profile, active: true },
    include: { weeks: { select: { id: true, numero: true, blocNumero: true, semaineDansBloc: true } } },
  });
  if (program) program.weeks.sort(compareWeeks);
  return program;
}

/** Semaine demandée (par numéro), sinon la plus avancée du programme (bloc puis semaine, quel que soit l'ordre d'import). */
export async function getWeek(programId: string, numero?: number): Promise<WeekFull | null> {
  if (numero !== undefined) {
    return db.week.findUnique({ where: { programId_numero: { programId, numero } }, include: weekInclude });
  }
  return db.week.findFirst({
    where: { programId },
    orderBy: [{ blocNumero: "desc" }, { semaineDansBloc: "desc" }],
    include: weekInclude,
  });
}

export function countSets(bloc: BlocFull): number {
  return bloc.exercices.reduce((a, e) => a + parseNotation(e.notation).sets, 0);
}

export function filterModule(day: DayFull, module: ModuleType): BlocFull[] {
  return day.blocs.filter((b) => b.module === module);
}

export const MODULES: ModuleType[] = ["CHARGE", "VOLUME", "MOTEUR"];
