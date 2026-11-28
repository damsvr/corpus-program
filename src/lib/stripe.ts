import Stripe from "stripe";
import { db } from "@/lib/db";
import { mapStripeStatus, PAYING_STATUSES } from "@/lib/billing";

/**
 * Client Stripe côté serveur. Variables d'environnement :
 * - STRIPE_SECRET_KEY : clé secrète (sk_test_… pour tester, sk_live_… en prod) ;
 * - STRIPE_WEBHOOK_SECRET : secret de signature du webhook (whsec_…) ;
 * - STRIPE_PRICE_ID : prix mensuel standard (49 € TTC) ;
 * - STRIPE_FOUNDER_PRICE_ID (optionnel) : prix « membre fondateur » (39 € TTC) ;
 * - APP_URL : URL publique de l'app (retours de Stripe Checkout).
 * Sans STRIPE_SECRET_KEY, l'app tourne normalement et le bouton d'abonnement
 * explique que le paiement n'est pas encore branché.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  return client;
}

export function appUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Places fondateur déjà prises (abonnements en cours sur le prix fondateur). */
export async function founderSeatsTaken(): Promise<number> {
  const priceId = process.env.STRIPE_FOUNDER_PRICE_ID;
  if (!priceId) return 0;
  return db.user.count({ where: { stripePriceId: priceId, subscriptionStatus: { in: PAYING_STATUSES } } });
}

/** Recopie l'état d'un abonnement Stripe sur le compte correspondant. */
export async function syncSubscription(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const userId = sub.metadata?.userId;
  const user =
    (userId && (await db.user.findUnique({ where: { id: userId } }))) ||
    (await db.user.findUnique({ where: { stripeCustomerId: customerId } }));
  if (!user) {
    console.warn(`[stripe] abonnement ${sub.id} : aucun compte pour le client ${customerId}`);
    return;
  }
  // Un ancien abonnement terminé ne doit pas écraser un abonnement plus récent.
  if (user.stripeSubscriptionId && user.stripeSubscriptionId !== sub.id && mapStripeStatus(sub.status) === "CANCELED") return;

  await db.user.update({
    where: { id: user.id },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      stripePriceId: sub.items.data[0]?.price.id ?? null,
      subscriptionStatus: mapStripeStatus(sub.status),
      currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
      trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}
