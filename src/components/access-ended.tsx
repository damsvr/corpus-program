import Link from "next/link";
import type { AccessLink } from "@prisma/client";
import { InstagramContact } from "@/components/instagram-contact";

/** Fin du cycle couvert par un lien d'accès gratuit : la programmation n'est plus servie, le suivi reste. */
export function AccessEnded({ link }: { link: AccessLink | null }) {
  return (
    <div className="space-y-6">
      <p className="eyebrow">{link?.label ?? "Accès gratuit"}</p>
      <h1 className="text-3xl font-extrabold">Cycle terminé</h1>
      <p className="text-muted">
        Ton accès gratuit couvrait ce cycle de préparation, qui est maintenant terminé. Tes séances, ton historique et tes
        PR restent disponibles.
      </p>
      <Link href="/historique" className="grad-accent inline-flex rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black">
        Voir mon historique
      </Link>
      <InstagramContact title="Envie de continuer ?" />
    </div>
  );
}
