import type Stripe from "stripe";
import { getStripe, syncSubscription } from "@/lib/stripe";

/**
 * Webhook Stripe (à déclarer dans le dashboard Stripe : APP_URL/api/stripe/webhook).
 * Événements utiles : checkout.session.completed, customer.subscription.created,
 * customer.subscription.updated, customer.subscription.deleted.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Stripe non configuré", { status: 503 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Signature manquante", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return new Response("Signature invalide", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        await syncSubscription(await stripe.subscriptions.retrieve(id));
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      break;
  }
  return Response.json({ received: true });
}
