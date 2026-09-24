"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { WEEKDAYS } from "@/lib/import-schema";
import { requireUser } from "@/lib/session";

const schema = z.object({
  dayId: z.string().min(1),
  weekday: z.enum(WEEKDAYS).nullable(),
});

export async function setDayWeekday(dayId: string, weekday: string | null) {
  const user = await requireUser();
  const parsed = schema.safeParse({ dayId, weekday });
  if (!parsed.success) return;

  const day = await db.day.findFirst({ where: { id: parsed.data.dayId, week: { program: { userId: user.id } } } });
  if (!day) return;

  await db.day.update({ where: { id: day.id }, data: { weekday: parsed.data.weekday } });
  revalidatePath("/", "layout");
}
