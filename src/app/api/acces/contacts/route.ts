import { auth } from "@/auth";
import { db } from "@/lib/db";
import { csvRow } from "@/lib/contact";

/** Export CSV des inscrits via les liens d'accès gratuits ayant accepté d'être recontactés (coach uniquement). */
export async function GET() {
  const session = await auth();
  const me = session?.user?.id ? await db.user.findUnique({ where: { id: session.user.id } }) : null;
  if (me?.role !== "COACH") return new Response("Non autorisé", { status: 403 });

  const users = await db.user.findMany({
    where: { accessLinkId: { not: null }, marketingOptIn: true },
    orderBy: { createdAt: "asc" },
    select: { name: true, email: true, createdAt: true, marketingOptInAt: true, accessLink: { select: { label: true } } },
  });
  const day = (d: Date | null) => d?.toISOString().slice(0, 10) ?? "";
  const lines = [
    csvRow(["Nom", "E-mail", "Cycle", "Inscrit le", "Accord le"]),
    ...users.map((u) => csvRow([u.name, u.email, u.accessLink?.label, day(u.createdAt), day(u.marketingOptInAt)])),
  ];
  // BOM : accents corrects à l'ouverture dans Excel.
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contacts-acces-gratuit-${day(new Date())}.csv"`,
    },
  });
}
