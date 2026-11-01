import { COACH_INSTAGRAM_HANDLE, COACH_INSTAGRAM_URL } from "@/lib/contact";

/** Contact du coach sur Instagram : s'abonner pour continuer ou poser une question. */
export function InstagramContact({ title = "Une question ? Envie de continuer ?" }: { title?: string }) {
  return (
    <div className="space-y-3 rounded-3xl border border-line bg-card p-5">
      <p className="font-bold">{title}</p>
      <p className="text-sm text-muted">
        Écris-moi sur Instagram pour t&apos;abonner et suivre le programme en continu, ou pour toute question.
      </p>
      <a
        href={COACH_INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-full border border-accent px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-accent"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
        </svg>
        {COACH_INSTAGRAM_HANDLE}
      </a>
    </div>
  );
}
