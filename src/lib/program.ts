import type { ModuleType, Prisma, ProfileType } from "@prisma/client";
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
