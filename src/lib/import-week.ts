import type { ModuleType, WeekType } from "@prisma/client";
import { db } from "@/lib/db";
import { profileFromKey, PROFILE_META } from "@/lib/profiles";
import { totalWeekMinutes, type ImportedWeek } from "@/lib/import-schema";

const WEEK_TYPE: Record<ImportedWeek["semaine"]["type"], WeekType> = {
  chargee: "CHARGEE",
  realisation: "REALISATION",
  deload: "DELOAD",
};

export class ImportConflictError extends Error {}

export async function importWeek(userId: string, data: ImportedWeek, opts: { replace: boolean }) {
  const profile = profileFromKey(data.profil);
  if (!profile) throw new Error(`Profil inconnu : ${data.profil}`);

  const program =
    (await db.program.findFirst({ where: { userId, profile, active: true } })) ??
    (await db.program.create({
      data: { userId, profile, name: `${PROFILE_META[profile].label} — Corpus Program`, active: true },
    }));

  const existing = await db.week.findFirst({
    where: {
      programId: program.id,
      blocNumero: data.bloc.numero,
      semaineDansBloc: data.semaine.numero_dans_le_bloc,
    },
  });

  let numero: number;
  if (existing) {
    if (!opts.replace) {
      throw new ImportConflictError(
        `Le bloc ${data.bloc.numero} · semaine ${data.semaine.numero_dans_le_bloc} existe déjà (Week ${existing.numero}). Coche « Remplacer » pour l'écraser.`,
      );
    }
    numero = existing.numero;
    await db.week.delete({ where: { id: existing.id } });
  } else {
    const last = await db.week.findFirst({ where: { programId: program.id }, orderBy: { numero: "desc" } });
    numero = (last?.numero ?? 0) + 1;
  }

  const week = await db.week.create({
    data: {
      programId: program.id,
      numero,
      blocNumero: data.bloc.numero,
      semaineDansBloc: data.semaine.numero_dans_le_bloc,
      type: WEEK_TYPE[data.semaine.type],
      dureeTotaleMin: totalWeekMinutes(data),
      note: data.semaine.note_progression_semaine ?? null,
      rawImportJson: data as object,
      days: {
        create: data.seances.map((s) => ({
          jour: s.jour,
          slot: s.slot ?? null,
          jourType: s.jour_type === "tampon" ? "TAMPON" : "ENTRAINEMENT",
          dureeEstimeeMin: s.duree_estimee_min ? Math.round(s.duree_estimee_min) : null,
          titre: s.titre,
          blocs: {
            create: s.blocs.map((b, bi) => ({
              ordre: bi,
              nom: b.nom,
              module: b.module ? (b.module.toUpperCase() as ModuleType) : null,
              dureeMin: b.duree_min !== undefined ? String(b.duree_min) : null,
              isWod: b.type === "wod",
              formatEntete: b.format_entete ?? null,
              note: b.note ?? null,
              exercices: {
                create: b.exercices.map((e, ei) => ({
                  ordre: ei,
                  nom: e.nom,
                  notation: e.notation ?? null,
                  charge: e.charge ?? null,
                  repos: e.repos ?? null,
                  note: e.note ?? null,
                })),
              },
            })),
          },
        })),
      },
    },
  });

  await db.user.update({ where: { id: userId }, data: { activeProfile: profile } });
  return { weekId: week.id, numero, profile };
}
