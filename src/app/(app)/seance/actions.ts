"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { programOwnerId } from "@/lib/program";

const payload = z.object({
  dayId: z.string().min(1),
  module: z.enum(["CHARGE", "VOLUME", "MOTEUR"]).nullable(),
  startedAt: z.number(),
  logs: z.array(
    z.object({
      exerciceId: z.string().min(1),
      sets: z.array(z.object({ kg: z.number().nullable(), reps: z.number().nullable(), done: z.boolean() })),
    }),
  ),
});

export type FinishInput = z.infer<typeof payload>;

export async function finishSession(input: FinishInput): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  const parsed = payload.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Données de séance invalides" };
  const { dayId, module, startedAt, logs } = parsed.data;
  const ownerId = await programOwnerId(user);

  const day = await db.day.findFirst({
    where: { id: dayId, week: { program: { userId: ownerId } } },
    include: { blocs: { include: { exercices: { select: { id: true } } } } },
  });
  if (!day) return { ok: false, error: "Séance introuvable" };

  const validIds = new Set(
    day.blocs.filter((b) => (module ? b.module === module : true)).flatMap((b) => b.exercices.map((e) => e.id)),
  );
  const clean = logs.filter((l) => validIds.has(l.exerciceId));

  const volumeKg = clean.reduce(
    (a, l) => a + l.sets.reduce((s, x) => s + (x.done && x.kg && x.reps ? x.kg * x.reps : 0), 0),
    0,
  );
  const now = new Date();
  const durationMin = Math.max(1, Math.round((now.getTime() - startedAt) / 60000));

  await db.sessionLog.create({
    data: {
      userId: user.id,
      dayId,
      module,
      startedAt: new Date(startedAt),
      endedAt: now,
      durationMin,
      volumeKg: Math.round(volumeKg * 10) / 10,
      exerciceLogs: { create: clean.map((l) => ({ exerciceId: l.exerciceId, sets: l.sets })) },
    },
  });

  revalidatePath("/", "layout");
  return { ok: true };
}
