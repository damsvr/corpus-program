import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Brand } from "@/components/brand";
import { db } from "@/lib/db";
import { isLinkOpen } from "@/lib/access";
import { PROFILE_META } from "@/lib/profiles";
import { COACH_INSTAGRAM_HANDLE, COACH_INSTAGRAM_URL } from "@/lib/contact";
import { AuthForm } from "../../auth-form";
import { signup } from "../../actions";

export const metadata = { title: "Accès gratuit — Corpus Program" };

const dateFr = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function AccessPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if ((await auth())?.user) redirect("/aujourdhui");
  const link = await db.accessLink.findUnique({ where: { code } });
  const open = link && isLinkOpen(link);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-10 px-6 py-12">
      <Brand />
      {open ? (
        <div data-profile={PROFILE_META[link.profile].key} className="space-y-6">
          <div>
            <p className="eyebrow !text-brand">Accès offert</p>
            <h1 className="mt-1 text-3xl font-extrabold uppercase leading-tight">
              {link.label} · <span className="grad-text">{PROFILE_META[link.profile].label}</span>
            </h1>
            <p className="mt-2 text-sm text-muted">
              Le programme {PROFILE_META[link.profile].label} de ce cycle de préparation, gratuitement, jusqu&apos;au{" "}
              {dateFr(link.endsAt)}. Crée ton compte pour commencer.
            </p>
          </div>
          <AuthForm mode="signup" action={signup} code={link.code} />
          <p className="text-center text-sm text-muted">
            Une question ?{" "}
            <a href={COACH_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-brand">
              Écris-moi sur Instagram {COACH_INSTAGRAM_HANDLE}
            </a>
          </p>
        </div>
      ) : (
        <div className="space-y-4 rounded-3xl border border-line bg-card p-6">
          <h1 className="text-2xl font-extrabold uppercase">Lien expiré</h1>
          <p className="text-sm text-muted">Ce lien d&apos;accès n&apos;est plus valable : le cycle qu&apos;il couvrait est terminé ou fermé.</p>
          <Link href="/login" className="block text-xs uppercase tracking-[0.16em] text-brand">
            Se connecter →
          </Link>
        </div>
      )}
    </main>
  );
}
