import { db } from "@/lib/db";
import { movementKey, type YoutubeRef } from "@/lib/video";

export type VideoMap = Record<string, YoutubeRef>;

export async function getVideoMap(): Promise<VideoMap> {
  const rows = await db.movementVideo.findMany({ select: { key: true, youtubeId: true, startSec: true } });
  return Object.fromEntries(rows.map((r) => [r.key, { id: r.youtubeId, start: r.startSec }]));
}

export type MovementRow = { key: string; nom: string; count: number; video: YoutubeRef | null };

/** Mouvements des programmes du coach, regroupés par clé, avec leur vidéo éventuelle. */
export async function listMovements(coachId: string): Promise<MovementRow[]> {
  const [exercices, videos] = await Promise.all([
    db.exercice.findMany({
      where: { bloc: { day: { week: { program: { userId: coachId } } } } },
      select: { nom: true },
    }),
    getVideoMap(),
  ]);
  const byKey = new Map<string, MovementRow>();
  for (const { nom } of exercices) {
    const key = movementKey(nom);
    if (!key) continue;
    const row = byKey.get(key);
    if (row) row.count += 1;
    else byKey.set(key, { key, nom: nom.split(/\s[—–-]\s|\s*\(/)[0].trim(), count: 1, video: videos[key] ?? null });
  }
  return [...byKey.values()].sort((a, b) => Number(!!a.video) - Number(!!b.video) || b.count - a.count || a.nom.localeCompare(b.nom));
}
