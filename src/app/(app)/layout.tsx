import { BottomNav } from "@/components/bottom-nav";
import { PROFILE_META } from "@/lib/profiles";
import { requireUser } from "@/lib/session";
import { VariantProvider } from "@/components/variant";
import { VideoProvider } from "@/components/video-button";
import { getVideoMap } from "@/lib/video-library";
import { redirect } from "next/navigation";
import { appAccess } from "@/lib/billing";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, videos] = await Promise.all([requireUser(), getVideoMap()]);
  // Après l'accès libre (FREE_ACCESS_UNTIL), la programmation demande un abonnement.
  if (appAccess(user) === "locked") redirect("/abonnement");
  return (
    <div data-profile={PROFILE_META[user.activeProfile].key} className="min-h-dvh bg-bg">
      <VideoProvider map={videos}>
        <VariantProvider>
          <main className="mx-auto max-w-xl px-5 pb-28 pt-8">{children}</main>
        </VariantProvider>
      </VideoProvider>
      <BottomNav />
    </div>
  );
}
