"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { firstChargeDuringFreePeriod, founderOfferOpen, isExempt, isSubscribed, trialDays } from "@/lib/billing";
import { appUrl, founderSeatsTaken, getStripe } from "@/lib/stripe";

export type CheckoutState = { error?: string } | undefined;

/** Ouvre Stripe Checkout pour l'abonnement mensuel (prix fondateur s'il reste des places). */
export async function startCheckout(_prev: CheckoutState, fd: FormData): Promise<CheckoutState> {
  const user = await requireUser();
  if (isExempt(user)) return { error: "Ton accès est déjà offert : rien à payer." };
  if (isSubscribed(user)) redirect("/abonnement");
  // Code de droit économique (art. VI.53, 13°) : contenu numérique fourni tout
  // de suite = accord exprès et reconnaissance de la perte du droit de rétractation.
  if (fd.get("renonciation") !== "on") {
    return { error: "Coche la case pour accéder tout de suite au programme (perte du droit de rétractation)." };
  }

  const stripe = getStripe();
  const standard = process.env.STRIPE_PRICE_ID;
  if (!stripe || !standard) return { error: "Le paiement en ligne n'est pas encore activé. Écris-moi sur Instagram." };

  const founderPrice = process.env.STRIPE_FOUNDER_PRICE_ID;
  const founder = founderOfferOpen({ taken: await founderSeatsTaken(), priceId: founderPrice });
  const price = founder && founderPrice ? founderPrice : standard;

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  // Abonné pendant l'accès libre : premier prélèvement à la fin de l'accès libre, pas avant.
  const trialEnd = firstChargeDuringFreePeriod();
  const days = trialEnd ? 0 : trialDays({ createdAt: user.createdAt, hadSubscription: Boolean(user.stripeSubscriptionId) });
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    locale: "fr",
    subscription_data: {
      metadata: { userId: user.id, renonciationRetractation: new Date().toISOString() },
      ...(trialEnd && { trial_end: trialEnd }),
      ...(days > 0 && { trial_period_days: days }),
    },
    success_url: `${appUrl()}/abonnement?ok=1`,
    cancel_url: `${appUrl()}/abonnement`,
  });
  if (!session.url) return { error: "Stripe n'a pas renvoyé de page de paiement. Réessaie." };
  redirect(session.url);
}

/** Portail client Stripe : carte bancaire, factures, résiliation. */
export async function openBillingPortal() {
  const user = await requireUser();
  const stripe = getStripe();
  if (!stripe || !user.stripeCustomerId) redirect("/abonnement");
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl()}/abonnement`,
    locale: "fr",
  });
  redirect(portal.url);
}
