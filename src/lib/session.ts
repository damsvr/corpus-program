import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");
  return user;
}
