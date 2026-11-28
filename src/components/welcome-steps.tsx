import Link from "next/link";
import { COACH_INSTAGRAM_URL } from "@/lib/contact";

export type WelcomeState = { hasPrs: boolean; hasSession: boolean; daysPicked: boolean };

/**
 * Accueil des nouveaux inscrits (souvent arrivés d'Instagram ou de TikTok) :
 * trois gestes pour que la première semaine démarre vraiment. Disparaît dès
 * que la première séance est terminée.
 */
export function WelcomeSteps({ state, firstDayId }: { state: WelcomeState; firstDayId?: string }) {
  if (state.hasSession) return null;
  const steps = [
    {
      done: state.daysPicked,
      title: "Cale ta semaine",
      text: "Choisis tes jours dispos et 3, 4 ou 5 séances. On fait ce qu'on peut, pas ce qu'on veut.",
      href: "/profil#rythme",
    },
    {
      done: state.hasPrs,
      title: "Renseigne tes records",
      text: "Back squat, soulevé de terre, poids de corps… Les charges en % deviennent des kg pour toi.",
      href: "/profil#records",
    },
    {
      done: false,
      title: "Fais ta première séance",
      text: "Pas le temps ? Prends la version courte. L'important, c'est de commencer.",
      href: firstDayId ? `/seance/${firstDayId}` : "/programme",
    },
  ];
  return (
    <section className="space-y-3 rounded-3xl border border-accent bg-card p-5">
      <p className="eyebrow !text-accent">Bienvenue · 3 étapes</p>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={s.title}>
            <Link href={s.href} className="flex gap-4 rounded-2xl bg-bg/50 p-4">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.done ? "grad-accent text-black" : "border border-line"}`}
              >
                {s.done ? "✓" : i + 1}
              </span>
              <span>
                <span className={`block font-bold ${s.done ? "text-muted line-through" : ""}`}>{s.title}</span>
                <span className="block text-sm text-muted">{s.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <a href={COACH_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="block text-center text-xs uppercase tracking-[0.16em] text-brand">
        Écris-moi « BIENVENUE » sur Instagram →
      </a>
    </section>
  );
}
