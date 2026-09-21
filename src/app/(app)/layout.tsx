import { BottomNav } from "@/components/bottom-nav";
import { PROFILE_META } from "@/lib/profiles";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div data-profile={PROFILE_META[user.activeProfile].key} className="min-h-dvh bg-bg">
      <main className="mx-auto max-w-xl px-5 pb-28 pt-8">{children}</main>
      <BottomNav />
    </div>
  );
}
