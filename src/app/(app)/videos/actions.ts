"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/session";
import { movementKey, parseYoutube } from "@/lib/video";
import type { SaveState } from "@/components/save-form";

export async function saveVideo(_p: SaveState, fd: FormData): Promise<SaveState> {
  await requireCoach();
  const nom = String(fd.get("nom") ?? "").trim();
  const key = movementKey(nom);
  if (!key) return { error: "Mouvement inconnu" };
  const raw = String(fd.get("url") ?? "").trim();

  if (raw === "") {
    await db.movementVideo.deleteMany({ where: { key } });
    revalidatePath("/", "layout");
    return { ok: true };
  }

  const video = parseYoutube(raw);
  if (!video) return { error: "Lien YouTube non reconnu (youtube.com/watch?v=…, youtu.be/…, shorts)" };
  await db.movementVideo.upsert({
    where: { key },
    create: { key, nom, youtubeId: video.id, startSec: video.start },
    update: { nom, youtubeId: video.id, startSec: video.start },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
