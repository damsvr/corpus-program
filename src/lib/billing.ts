import type { SubscriptionStatus, User } from "@prisma/client";

/**
 * Abonnement Corpus Program (Stripe). Règles d'accès à la programmation :
 * - le COACH et les inscrits d'un lien d'accès gratuit (AccessLink, régi par
 *   src/lib/access.ts) ne sont jamais facturés ;
 * - jusqu'à la fin de la période d'accès libre (FREE_ACCESS_UNTIL, par défaut
 *   le dimanche 3 janvier 2027 inclus), tout le monde teste librement ;
 * - ensuite, il faut un abonnement Stripe en cours (actif, en essai, ou un
 *   paiement en échec que Stripe retente encore).
 * Les fonctions ci-dessous sont pures (testées) ; le client Stripe vit dans
 * src/lib/stripe.ts.
 */

/** Dernier jour (inclus, heure de Bruxelles ≈ UTC+1 en hiver) de l'accès libre. */
export const DEFAULT_FREE_ACCESS_UNTIL = "2027-01-03";
/** Fin de l'offre « membre fondateur » (inclus). */
export const DEFAULT_FOUNDER_UNTIL = "2027-01-31";
export const DEFAULT_FOUNDER_SEATS = 30;

/** Libellés affichés (TTC). Les montants réels sont ceux des prix Stripe. */
export const PRICE_LABEL = "49 €";
export const FOUNDER_PRICE_LABEL = "39 €";
export const PREMIUM_PRICE_LABEL = "149 €";

/** Fin de journée à Bruxelles (23:59:59, heure d'hiver UTC+1) de la date « AAAA-MM-JJ ». */
export function endOfBrusselsDay(date: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const d = new Date(`${date}T22:59:59.999Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function freeAccessUntil(env: string | undefined = process.env.FREE_ACCESS_UNTIL): Date {
  return endOfBrusselsDay(env ?? "") ?? endOfBrusselsDay(DEFAULT_FREE_ACCESS_UNTIL)!;
}

export function founderUntil(env: string | undefined = process.env.FOUNDER_UNTIL): Date {
  return endOfBrusselsDay(env ?? "") ?? endOfBrusselsDay(DEFAULT_FOUNDER_UNTIL)!;
}

export function founderSeats(env: string | undefined = process.env.FOUNDER_SEATS): number {
  const n = Number(env);
  return Number.isInteger(n) && n >= 0 ? n : DEFAULT_FOUNDER_SEATS;
}

export function isFreePeriod(now = new Date(), until = freeAccessUntil()): boolean {
  return now <= until;
}

/** Statut Stripe → statut stocké. */
export function mapStripeStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "CANCELED";
    default:
      // incomplete, paused : pas (encore) d'accès.
      return "NONE";
  }
}

/** Statuts qui donnent accès (le paiement en échec garde l'accès pendant les relances Stripe). */
export const PAYING_STATUSES: SubscriptionStatus[] = ["ACTIVE", "TRIALING", "PAST_DUE"];

export type BillingUser = Pick<User, "role" | "accessLinkId" | "subscriptionStatus" | "stripeSubscriptionId">;

/** Le compte est couvert sans payer (coach, lien d'accès gratuit). */
export function isExempt(user: Pick<User, "role" | "accessLinkId">): boolean {
  return user.role === "COACH" || Boolean(user.accessLinkId);
}

/** Abonnement Stripe en cours. */
export function isSubscribed(user: Pick<User, "subscriptionStatus" | "stripeSubscriptionId">): boolean {
  return Boolean(user.stripeSubscriptionId) && PAYING_STATUSES.includes(user.subscriptionStatus);
}

export type AppAccess = "exempt" | "subscribed" | "free-period" | "locked";

export function appAccess(user: BillingUser, now = new Date(), until = freeAccessUntil()): AppAccess {
  if (isExempt(user)) return "exempt";
  if (isSubscribed(user)) return "subscribed";
  if (isFreePeriod(now, until)) return "free-period";
  return "locked";
}

/** Le prix fondateur est-il encore proposé ? */
export function founderOfferOpen(opts: {
  now?: Date;
  until?: Date;
  seats?: number;
  taken: number;
  priceId?: string;
}): boolean {
  const { now = new Date(), until = founderUntil(), seats = founderSeats(), taken, priceId } = opts;
  return Boolean(priceId) && now <= until && taken < seats;
}

/**
 * Jours d'essai Stripe à l'abonnement : pas d'essai pour qui a déjà testé
 * pendant l'accès libre (inscrit avant sa fin), ni pour qui a déjà été abonné.
 */
export function trialDays(opts: {
  createdAt: Date;
  hadSubscription: boolean;
  until?: Date;
  days?: number;
}): number {
  const { createdAt, hadSubscription, until = freeAccessUntil(), days = Number(process.env.STRIPE_TRIAL_DAYS ?? 7) } = opts;
  if (hadSubscription || createdAt <= until) return 0;
  return Number.isInteger(days) && days > 0 ? days : 0;
}

/**
 * Abonnement pris pendant l'accès libre : horodatage Unix (s) du premier
 * prélèvement = fin de l'accès libre. Stripe exige un trial_end à plus de
 * 48 h ; plus près de l'échéance, on prélève tout de suite (null).
 */
export function firstChargeDuringFreePeriod(now = new Date(), until = freeAccessUntil()): number | null {
  if (!isFreePeriod(now, until)) return null;
  if (until.getTime() - now.getTime() < 49 * 3600 * 1000) return null;
  return Math.ceil(until.getTime() / 1000);
}

/** « 3 janvier 2027 » (Bruxelles). */
export function formatDayFr(d: Date): string {
  return new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Brussels" }).format(d);
}

/** Source d'acquisition (?src=ig, utm_source=tiktok…) normalisée, pour mesurer d'où viennent les inscrits. */
export function normalizeSource(raw: string | null | undefined): string | null {
  const s = (raw ?? "").toLowerCase().trim();
  if (!s) return null;
  if (/^(ig|insta|instagram)/.test(s)) return "instagram";
  if (/^(tt|tiktok)/.test(s)) return "tiktok";
  if (/^(yt|youtube)/.test(s)) return "youtube";
  if (/^(fb|facebook)/.test(s)) return "facebook";
  const clean = s.replace(/[^a-z0-9_-]/g, "").slice(0, 32);
  return clean || null;
}
