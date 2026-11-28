import Link from "next/link";
import { appAccess, formatDayFr, freeAccessUntil, type BillingUser } from "@/lib/billing";

/** Pendant l'accès libre : rappel discret de la date de fin et lien vers l'abonnement. */
export function FreePeriodBanner({ user }: { user: BillingUser }) {
  if (appAccess(user) !== "free-period") return null;
  return (
    <Link
      href="/abonnement"
      className="flex items-center justify-between gap-4 rounded-3xl border border-brand/40 bg-brand/10 px-5 py-4 text-sm"
    >
      <span>
        <span className="font-bold">Accès libre jusqu&apos;au {formatDayFr(freeAccessUntil())}.</span>{" "}
        <span className="text-muted">Bloque le tarif fondateur.</span>
      </span>
      <span className="text-brand">→</span>
    </Link>
  );
}
