"use server";

import { revalidatePath } from "next/cache";
import { validateImport } from "@/lib/import-schema";
import { ImportConflictError, importWeek } from "@/lib/import-week";
import { requireCoach, requireUser } from "@/lib/session";

export type ImportPreview =
  | {
      ok: true;
      warnings: string[];
      summary: { profil: string; bloc: number; semaine: number; type: string; total: number | null; seances: { titre: string; jour: number; jourType: string; blocs: number; min: number | null }[] };
    }
  | { ok: false; errors: string[]; warnings: string[] };

function parse(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: `JSON illisible : ${(e as Error).message}` };
  }
}

export async function previewImport(text: string): Promise<ImportPreview> {
  await requireUser();
  const p = parse(text);
  if (!p.ok) return { ok: false, errors: [p.error], warnings: [] };
  const r = validateImport(p.value);
  if (!r.ok) return r;
  const d = r.data;
  return {
    ok: true,
    warnings: r.warnings,
    summary: {
      profil: d.profil,
      bloc: d.bloc.numero,
      semaine: d.semaine.numero_dans_le_bloc,
      type: d.semaine.type,
      total: d.semaine.duree_totale_min ?? null,
      seances: d.seances.map((s) => ({
        titre: s.titre,
        jour: s.jour,
        jourType: s.jour_type,
        blocs: s.blocs.length,
        min: s.duree_estimee_min ?? null,
      })),
    },
  };
}

export async function confirmImport(
  text: string,
  replace: boolean,
): Promise<{ ok: true; numero: number } | { ok: false; errors: string[] }> {
  const user = await requireCoach();
  const p = parse(text);
  if (!p.ok) return { ok: false, errors: [p.error] };
  const r = validateImport(p.value);
  if (!r.ok) return { ok: false, errors: r.errors };
  try {
    const res = await importWeek(user.id, r.data, { replace });
    revalidatePath("/", "layout");
    return { ok: true, numero: res.numero };
  } catch (e) {
    if (e instanceof ImportConflictError) return { ok: false, errors: [e.message] };
    throw e;
  }
}
