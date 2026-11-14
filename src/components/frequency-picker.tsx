import { SESSIONS_PER_WEEK } from "@/lib/session-plan";

const HINT: Record<number, string> = {
  3: "Semaine chargée : une séance en moins",
  4: "Le programme complet",
  5: "Une séance légère en plus",
};

/** Choix du nombre de séances par semaine (radios, à placer dans un formulaire). */
export function FrequencyPicker({ defaultValue }: { defaultValue: number }) {
  return (
    <fieldset>
      <legend className="text-sm">Séances par semaine</legend>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {SESSIONS_PER_WEEK.map((n) => (
          <label key={n} className="cursor-pointer">
            <input type="radio" name="sessionsPerWeek" value={n} defaultChecked={n === defaultValue} className="peer sr-only" />
            <span className="block rounded-2xl border border-line px-2 py-3 text-center peer-checked:border-accent peer-checked:text-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
              <span className="block text-2xl font-extrabold">{n}×</span>
              <span className="block text-[0.62rem] leading-tight text-muted">{HINT[n]}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
