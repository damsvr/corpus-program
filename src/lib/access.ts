import { randomBytes } from "node:crypto";
import type { AccessLink, Prisma, User } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Lien d'accès gratuit (ex. « Préparation TyRun », Hybrid) : un seul lien
 * partagé, valable pour un cycle. Les inscrits via ce lien sont verrouillés
 * sur son profil, ne voient que les semaines des blocs [blocDebut, blocFin],
 * et n'ont plus accès à la programmation après endsAt (leur historique et
 * leurs PR restent). Les autres comptes ne sont pas concernés.
 */

type LinkWindow = Pick<AccessLink, "active" | "endsAt">;

/** Le lien accepte encore des inscriptions. */
export function isLinkOpen(link: LinkWindow, now = new Date()): boolean {
  return link.active && now < link.endsAt;
}

/** Le cycle est terminé : plus de programmation pour les inscrits du lien. */
export function isCycleOver(link: Pick<AccessLink, "endsAt">, now = new Date()): boolean {
  return now >= link.endsAt;
}

/** Fin de journée (UTC) de la date « AAAA-MM-JJ » saisie par le coach : la date du jour J est incluse. */
export function endOfDay(date: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const d = new Date(`${date}T23:59:59.999Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function newAccessCode(prefix: string): string {
  return `${prefix}-${randomBytes(4).toString("hex")}`;
}

export type Access = {
  link: AccessLink | null;
  /** Filtre à appliquer à toute lecture de semaine (ou de jour via sa semaine). */
  weekWhere: Prisma.WeekWhereInput;
  ended: boolean;
};

/** Ce que l'utilisateur peut voir de la programmation. */
export async function getAccess(user: Pick<User, "accessLinkId">): Promise<Access> {
  if (!user.accessLinkId) return { link: null, weekWhere: {}, ended: false };
  const link = await db.accessLink.findUnique({ where: { id: user.accessLinkId } });
  if (!link) return { link: null, weekWhere: { id: "" }, ended: true };
  const ended = isCycleOver(link);
  return {
    link,
    ended,
    weekWhere: ended
      ? { id: "" }
      : { program: { profile: link.profile }, blocNumero: { gte: link.blocDebut, lte: link.blocFin } },
  };
}
