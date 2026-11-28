import Link from "next/link";
import { requireUser } from "@/lib/session";
import { PROFILE_META } from "@/lib/profiles";
import {
  appAccess,
  FOUNDER_PRICE_LABEL,
  founderOfferOpen,
  founderSeats,
  founderUntil,
  formatDayFr,
  freeAccessUntil,
  PRICE_LABEL,
  trialDays,
} from "@/lib/billing";
import { founderSeatsTaken, getStripe } from "@/lib/stripe";
import { Brand } from "@/components/brand";
import { InstagramContact } from "@/components/instagram-contact";
import { openBillingPortal } from "./actions";
import { SubscribeForm } from "./subscribe-form";

export const metadata = { title: "Abonnement — Corpus Program" };

const ghostBtn =
  "flex w-full items-center justify-center rounded-full border border-line px-6 py-4 text-xs font-bold uppercase tracking-[0.14em]";

export default async function AbonnementPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser();
  const { ok } = await searchParams;
  const access = appAccess(user);
  const until = freeAccessUntil();
  const taken = await founderSeatsTaken();
  const founder = founderOfferOpen({ taken, priceId: process.env.STRIPE_FOUNDER_PRICE_ID });
  const price = founder ? FOUNDER_PRICE_LABEL : PRICE_LABEL;
  const days = trialDays({ createdAt: user.createdAt, hadSubscription: Boolean(user.stripeSubscriptionId) });
  const stripeReady = Boolean(getStripe() && process.env.STRIPE_PRICE_ID);

  return (
    <div data-profile={PROFILE_META[user.activeProfile].key} className="min-h-dvh bg-bg">
      <main className="mx-auto max-w-xl space-y-8 px-5 pb-16 pt-8">
        <Brand size="sm" />

        {ok && (
          <p className="rounded-2xl border border-brand/40 bg-brand/10 px-5 py-4 text-sm">
            Merci ! Ton abonnement est enregistré. S&apos;il n&apos;apparaît pas encore ci-dessous, recharge la page dans
            quelques secondes.
          </p>
        )}

        {access === "exempt" && (
          <section className="space-y-4">
            <h1 className="text-3xl font-extrabold">Ton accès est offert</h1>
            <p className="text-muted">
              {user.role === "COACH" ? "Compte coach : rien à payer." : "Tu es inscrit via un accès gratuit : rien à payer."}
            </p>
            <Link href="/aujourdhui" className={ghostBtn}>Retour à l&apos;app</Link>
          </section>
        )}

        {access === "subscribed" && (
          <section className="space-y-4">
            <p className="eyebrow !text-brand">Abonnement</p>
            <h1 className="text-3xl font-extrabold">Tu es abonné</h1>
            <ul className="space-y-1 text-sm text-muted">
              <li>
                Statut :{" "}
                {user.subscriptionStatus === "TRIALING"
                  ? "période d'essai"
                  : user.subscriptionStatus === "PAST_DUE"
                    ? "paiement en échec, mets à jour ta carte"
                    : "actif"}
              </li>
              {user.currentPeriodEnd && (
                <li>
                  {user.cancelAtPeriodEnd ? "Se termine le " : "Prochain renouvellement le "}
                  {formatDayFr(user.currentPeriodEnd)}
                </li>
              )}
              {user.stripePriceId && user.stripePriceId === process.env.STRIPE_FOUNDER_PRICE_ID && (
                <li>Tarif membre fondateur, garanti tant que tu restes abonné.</li>
              )}
            </ul>
            <form action={openBillingPortal}>
              <button type="submit" className={ghostBtn}>Gérer ma carte, mes factures, résilier</button>
            </form>
            <Link href="/aujourdhui" className="block text-center text-xs uppercase tracking-[0.16em] text-brand">
              Retour à l&apos;app →
            </Link>
          </section>
        )}

        {(access === "free-period" || access === "locked") && (
          <section className="space-y-5">
            <p className="eyebrow !text-brand">Abonnement</p>
            {access === "free-period" ? (
              <h1 className="text-3xl font-extrabold leading-tight">
                Accès libre jusqu&apos;au <span className="grad-text">{formatDayFr(until)}</span>
              </h1>
            ) : (
              <h1 className="text-3xl font-extrabold leading-tight">
                La période de test est <span className="grad-text">terminée</span>
              </h1>
            )}
            <p className="text-muted">
              {access === "free-period"
                ? "Teste tout gratuitement. Tu peux t'abonner dès maintenant pour bloquer ton tarif : rien n'est prélevé avant la fin de l'accès libre."
                : "Ton historique, tes PR et tes séances sont conservés. Abonne-toi pour retrouver ta programmation."}
            </p>

            <div className="space-y-4 rounded-3xl border border-accent bg-card p-6">
              {founder && (
                <p className="eyebrow !text-accent">
                  Membre fondateur · jusqu&apos;au {formatDayFr(founderUntil())} · {Math.max(0, founderSeats() - taken)} places
                </p>
              )}
              <p>
                <span className="grad-text text-5xl font-extrabold">{price}</span>
                <span className="text-muted"> /mois TTC</span>
              </p>
              {founder && <p className="text-sm text-muted">Au lieu de {PRICE_LABEL}, garanti tant que tu restes abonné.</p>}
              <ul className="space-y-2 text-sm">
                <li>✓ Ta programmation CrossFit, Hybrid ou Functional, chaque semaine</li>
                <li>✓ Changement de profil libre, sans repartir de zéro</li>
                <li>✓ Version courte, 3 séances par semaine possible : on fait ce qu&apos;on peut</li>
                <li>✓ Charges en kg calculées sur tes records</li>
                <li>✓ Feedback écrit ou vocal au coach après chaque séance</li>
                <li>✓ Sans engagement, résiliable en deux clics</li>
              </ul>
              {days > 0 && <p className="text-sm text-brand">{days} jours d&apos;essai gratuits avant le premier prélèvement.</p>}
              {stripeReady ? (
                <SubscribeForm label={`M'abonner · ${price}/mois`} />
              ) : (
                <p className="rounded-xl bg-bg/60 px-4 py-3 text-sm text-muted">
                  Le paiement en ligne arrive très bientôt. En attendant, écris-moi sur Instagram.
                </p>
              )}
            </div>

            {access === "free-period" && (
              <Link href="/aujourdhui" className={ghostBtn}>Continuer à tester</Link>
            )}
          </section>
        )}

        <InstagramContact title="Suivi Premium ou une question ?" />
        <p className="text-center text-xs text-muted">
          <Link href="/cgv" className="underline">Conditions générales</Link> ·{" "}
          <Link href="/mentions-legales" className="underline">Mentions légales</Link>
        </p>
      </main>
    </div>
  );
}
