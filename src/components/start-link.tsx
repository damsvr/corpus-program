"use client";

import Link, { useLinkStatus } from "next/link";

function Label({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return <>{pending ? "Ouverture…" : children}</>;
}

/** Lien de démarrage de séance : retour visuel immédiat pendant le chargement du serveur (sinon le bouton paraît mort). */
export function StartLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={`${className} active:scale-[0.98] transition`}>
      <Label>{children}</Label>
    </Link>
  );
}
