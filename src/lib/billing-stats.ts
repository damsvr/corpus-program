import { db } from "@/lib/db";
import { PAYING_STATUSES } from "@/lib/billing";

/** Tableau de bord du coach dans /profil : abonnés payants, fondateurs, provenance des inscrits. */
export async function getBillingStats() {
  const founderPrice = process.env.STRIPE_FOUNDER_PRICE_ID;
  const paying = { subscriptionStatus: { in: PAYING_STATUSES }, stripeSubscriptionId: { not: null } };
  const [payingCount, founders, last7Days, sources] = await Promise.all([
    db.user.count({ where: paying }),
    founderPrice ? db.user.count({ where: { ...paying, stripePriceId: founderPrice } }) : 0,
    db.user.count({ where: { role: "ATHLETE", createdAt: { gte: new Date(Date.now() - 7 * 864e5) } } }),
    db.user.groupBy({ by: ["signupSource"], where: { role: "ATHLETE" }, _count: { _all: true } }),
  ]);
  return {
    paying: payingCount,
    founders,
    last7Days,
    sources: sources
      .map((s) => ({ source: s.signupSource, count: s._count._all }))
      .sort((a, b) => b.count - a.count),
  };
}
