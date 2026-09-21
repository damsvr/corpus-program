"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { signOut } from "@/auth";
import { db } from "@/lib/db";
import { PROFILE_KEYS } from "@/lib/profiles";
import { requireUser } from "@/lib/session";
import type { SaveState } from "@/components/save-form";

const kg = z
  .string()
  .transform((s) => s.replace(",", ".").trim())
  .pipe(z.union([z.literal(""), z.string().regex(/^\d{1,3}(\.\d{1,2})?$/, "Valeur en kg invalide")]))
  .transform((s) => (s === "" ? null : parseFloat(s)));

const mmss = z
  .string()
  .trim()
  .pipe(z.union([z.literal(""), z.string().regex(/^\d{1,2}:[0-5]\d$/, "Format mm:ss attendu (ex. 7:45)")]))
  .transform((s) => (s === "" ? null : s));

const prsSchema = z.object({
  arracheKg: kg,
  epauleJeteKg: kg,
  backSquatKg: kg,
  frontSquatKg: kg,
  souleveDeTerreKg: kg,
  developpeCoucheKg: kg,
  developpeMilitaireKg: kg,
  poidsDeCorpsKg: kg,
  row2000m: mmss,
  course5km: mmss,
});

export async function savePrs(_p: SaveState, fd: FormData): Promise<SaveState> {
  const user = await requireUser();
  const raw = Object.fromEntries(Object.keys(prsSchema.shape).map((k) => [k, String(fd.get(k) ?? "")]));
  const parsed = prsSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.prs.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed.data },
    update: parsed.data,
  });
  revalidatePath("/profil");
  return { ok: true };
}

const athleteSchema = z.object({
  limitations: z.string().max(1000),
  pointsFaibles: z.string().max(1000),
  mouvementsBloquants: z.string().max(1000),
  palierMateriel: z.enum(["SALLE_COMPLETE", "MINIMALISTE", "DEPLACEMENT"]),
  joursDisponibles: z.array(z.enum(["lun", "mar", "mer", "jeu", "ven", "sam", "dim"])),
});

export async function saveAthlete(_p: SaveState, fd: FormData): Promise<SaveState> {
  const user = await requireUser();
  const parsed = athleteSchema.safeParse({
    limitations: String(fd.get("limitations") ?? ""),
    pointsFaibles: String(fd.get("pointsFaibles") ?? ""),
    mouvementsBloquants: String(fd.get("mouvementsBloquants") ?? ""),
    palierMateriel: String(fd.get("palierMateriel") ?? "SALLE_COMPLETE"),
    joursDisponibles: fd.getAll("joursDisponibles").map(String),
  });
  if (!parsed.success) return { error: "Données invalides" };
  await db.athleteProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed.data },
    update: parsed.data,
  });
  revalidatePath("/profil");
  return { ok: true };
}

export async function setProfile(fd: FormData) {
  const user = await requireUser();
  const p = String(fd.get("profile"));
  if (!(PROFILE_KEYS as readonly string[]).includes(p)) return;
  await db.user.update({ where: { id: user.id }, data: { activeProfile: p as (typeof PROFILE_KEYS)[number] } });
  revalidatePath("/", "layout");
}

export async function saveReminder(_p: SaveState, fd: FormData): Promise<SaveState> {
  const user = await requireUser();
  const t = String(fd.get("reminderTime") ?? "");
  if (t && !/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) return { error: "Heure invalide" };
  await db.user.update({ where: { id: user.id }, data: { reminderTime: t || null } });
  revalidatePath("/profil");
  return { ok: true };
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
