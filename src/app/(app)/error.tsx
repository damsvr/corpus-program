"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4 py-10 text-center">
      <p className="text-lg font-extrabold uppercase">Le chargement a échoué</p>
      <p className="text-sm text-muted">Connexion interrompue ou serveur en cours de réveil. Réessaie.</p>
      <button
        type="button"
        onClick={reset}
        className="grad-accent rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black"
      >
        Réessayer
      </button>
    </div>
  );
}
