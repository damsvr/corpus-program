import type { ModuleType, Prisma, ProfileType, User } from "@prisma/client";
import { db } from "@/lib/db";
import { parseNotation } from "@/lib/format";

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
 * S'il n'y a pas encore de coach en base, l'athlète retombe sur lui-même.
 */
export async function programOwnerId(user: User): Promise<string> {
  if (user.role === "COACH") return user.id;
  const coach = await db.user.findFirst({ where: { role: "COACH" }, select: { id: true } });
  return coach?.id ?? user.id;
}

export async function getActiveProgram(userId: string, profile: ProfileType) {
  return db.program.findFirst({
    where: { userId, profile, active: true },
    include: { weeks: { select: { id: true, numero: true }, orderBy: { numero: "asc" } } },
  });
}

/** Semaine demandée (par numéro), sinon la plus récente du programme. */
export async function getWeek(programId: string, numero?: number): Promise<WeekFull | null> {
  if (numero !== undefined) {
    return db.week.findUnique({ where: { programId_numero: { programId, numero } }, include: weekInclude });
  }
  return db.week.findFirst({ where: { programId }, orderBy: { numero: "desc" }, include: weekInclude });
}

export function countSets(bloc: BlocFull): number {
  return bloc.exercices.reduce((a, e) => a + parseNotation(e.notation).sets, 0);
}

export function filterModule(day: DayFull, module: ModuleType): BlocFull[] {
  return day.blocs.filter((b) => b.module === module);
}

export const MODULES: ModuleType[] = ["CHARGE", "VOLUME", "MOTEUR"];
