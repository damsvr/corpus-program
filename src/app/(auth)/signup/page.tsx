import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Brand } from "@/components/brand";
import { AuthForm } from "../auth-form";
import { signup } from "../actions";
import { PROFILE_META, profileFromKey } from "@/lib/profiles";
import { formatDayFr, freeAccessUntil } from "@/lib/billing";

export const metadata = { title: "Créer un compte — Corpus Program" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ profil?: string; src?: string }> }) {
  if ((await auth())?.user) redirect("/aujourdhui");
  const { profil, src } = await searchParams;
  const chosen = profil ? profileFromKey(profil) : null;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-10 px-6 py-12">
      <Brand />
      {chosen && (
        <p data-profile={PROFILE_META[chosen].key} className="rounded-2xl border border-accent bg-card px-5 py-4 text-sm">
          Ton profil : <span className="grad-text font-extrabold">{PROFILE_META[chosen].label}</span>. Crée ton compte, ta
          première semaine t&apos;attend. Accès libre jusqu&apos;au {formatDayFr(freeAccessUntil())}.
        </p>
      )}
      <AuthForm mode="signup" action={signup} profile={chosen ? PROFILE_META[chosen].key : undefined} source={src?.slice(0, 40)} />
    </main>
  );
}
