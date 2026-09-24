import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { JOURS, PROFILE_KEYS, PROFILE_META } from "@/lib/profiles";
import { SaveForm } from "@/components/save-form";
import { logout, saveAthlete, savePrs, saveReminder, setProfile } from "./actions";

export const metadata = { title: "Profil — Corpus Program" };

const field =
  "w-24 rounded-xl border border-line bg-bg/70 px-3 py-2 text-right text-base outline-none focus:border-brand";
const area =
  "mt-2 w-full rounded-2xl border border-line bg-bg/70 px-4 py-3 text-sm outline-none focus:border-brand";

const PR_FIELDS: { name: string; label: string; unit: string; hint?: string; ph?: string }[] = [
  { name: "arracheKg", label: "Arraché (snatch)", unit: "kg" },
  { name: "epauleJeteKg", label: "Épaulé-jeté (clean & jerk)", unit: "kg" },
  { name: "backSquatKg", label: "Back squat", unit: "kg" },
  { name: "frontSquatKg", label: "Front squat", unit: "kg" },
  { name: "souleveDeTerreKg", label: "Soulevé de terre", unit: "kg" },
  { name: "developpeCoucheKg", label: "Développé couché", unit: "kg" },
  { name: "developpeMilitaireKg", label: "Développé militaire", unit: "kg" },
  { name: "poidsDeCorpsKg", label: "Poids de corps", unit: "kg", hint: "utilisé pour les % PDC" },
  { name: "row2000m", label: "2000 m rameur", unit: "mm:ss", hint: "temps de référence", ph: "7:45" },
  { name: "course5km", label: "5 km course", unit: "mm:ss", hint: "temps de référence", ph: "24:30" },
];

export default async function ProfilPage() {
  const user = await requireUser();
  const [prs, athlete] = await Promise.all([
    db.prs.findUnique({ where: { userId: user.id } }),
    db.athleteProfile.findUnique({ where: { userId: user.id } }),
  ]);
  const prsRecord = (prs ?? {}) as Record<string, number | string | null | undefined>;

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow !text-brand">{user.role === "COACH" ? "Coach" : "Athlète"}</p>
        <h1 className="mt-1 text-4xl font-extrabold uppercase">{user.name || "Athlète"}</h1>
        <p className="mt-1 text-muted">{user.email}</p>
      </div>

      <section className="space-y-4">
        <p className="eyebrow">Mon profil d&apos;entraînement</p>
        <p className="text-sm text-muted">
          Change quand tu veux, sans frais et sans repartir de zéro : tes PR, tes gates et ton historique sont conservés.{" "}
          <Link href="/onboarding" className="text-brand underline">
            Trois questions pour choisir
          </Link>
        </p>
        <div className="space-y-3">
          {PROFILE_KEYS.map((p) => {
            const m = PROFILE_META[p];
            const active = user.activeProfile === p;
            return (
              <form key={p} action={setProfile}>
                <input type="hidden" name="profile" value={p} />
                <button
                  type="submit"
                  data-profile={m.key}
                  className={`w-full rounded-3xl border p-5 text-left transition ${
                    active ? "border-accent bg-card" : "border-line bg-card2 hover:border-line/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="grad-text text-2xl font-extrabold">{m.label}</span>
                    {active && <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Actif</span>}
                  </div>
                  <p className="eyebrow mt-1">Tu cherches {m.seeks.toLowerCase()}</p>
                  <p className="mt-2 text-sm">{m.promise}</p>
                  <p className="mt-1 text-xs text-muted">{m.format}</p>
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <p className="eyebrow">Performance</p>
        <div className="rounded-3xl border border-line bg-card p-5">
          <h2 className="text-lg font-extrabold uppercase">PR personnels</h2>
          <p className="mt-1 text-sm text-muted">
            Les charges (kg) et allures des séances sont calculées à partir de ces valeurs.
          </p>
          <div className="mt-4">
            <SaveForm action={savePrs} label="Enregistrer mes PR">
              <ul className="divide-y divide-line/70">
                {PR_FIELDS.map((f) => (
                  <li key={f.name} className="flex items-center justify-between gap-3 py-3">
                    <label htmlFor={f.name} className="text-sm">
                      {f.label}
                      {f.hint && <span className="block text-[0.7rem] text-muted">{f.hint}</span>}
                    </label>
                    <span className="flex items-center gap-2">
                      <input
                        id={f.name}
                        name={f.name}
                        inputMode={f.unit === "kg" ? "decimal" : "numeric"}
                        placeholder={f.ph ?? ""}
                        defaultValue={prsRecord[f.name] ?? ""}
                        className={field}
                      />
                      <span className="w-9 text-xs text-muted">{f.unit}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </SaveForm>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <p className="eyebrow">Suivi personnel</p>
        <div className="rounded-3xl border border-line bg-card p-5">
          <p className="mb-4 text-sm text-muted">
            Tes limitations, tes points faibles et tes mouvements bloquants ajustent le programme (ils sont transmis à
            l&apos;agent quand tu prépares une semaine).
          </p>
          <SaveForm action={saveAthlete}>
            <label className="block">
              <span className="text-sm font-medium">Limitations</span>
              <textarea name="limitations" rows={2} defaultValue={athlete?.limitations ?? ""} placeholder="ex. épaule droite : pas d'arraché overhead lourd" className={area} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Points faibles</span>
              <textarea name="pointsFaibles" rows={2} defaultValue={athlete?.pointsFaibles ?? ""} placeholder="ex. poussée verticale, mobilité de cheville" className={area} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Mouvements bloquants</span>
              <textarea name="mouvementsBloquants" rows={2} defaultValue={athlete?.mouvementsBloquants ?? ""} placeholder="ex. traction stricte, HSPU strict" className={area} />
            </label>
            <fieldset>
              <legend className="text-sm font-medium">Jours disponibles</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {JOURS.map((j) => (
                  <label key={j.key} className="cursor-pointer">
                    <input
                      type="checkbox"
                      name="joursDisponibles"
                      value={j.key}
                      defaultChecked={athlete?.joursDisponibles.includes(j.key)}
                      className="peer sr-only"
                    />
                    <span className="block rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.12em] peer-checked:border-accent peer-checked:text-accent">
                      {j.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="text-sm font-medium">Matériel</span>
              <select name="palierMateriel" defaultValue={athlete?.palierMateriel ?? "SALLE_COMPLETE"} className={area}>
                <option value="SALLE_COMPLETE">Salle complète</option>
                <option value="MINIMALISTE">Matériel minimaliste</option>
                <option value="DEPLACEMENT">Mode déplacement</option>
              </select>
            </label>
          </SaveForm>
        </div>
      </section>

      <section className="space-y-4">
        <p className="eyebrow">Notifications</p>
        <div className="rounded-3xl border border-line bg-card p-5">
          <SaveForm action={saveReminder}>
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm">
                Rappel quotidien
                <span className="block text-[0.7rem] text-muted">Préférence enregistrée — l&apos;envoi des rappels arrive prochainement.</span>
              </span>
              <input type="time" name="reminderTime" defaultValue={user.reminderTime ?? ""} className={`${field} w-32 text-center`} />
            </label>
          </SaveForm>
        </div>
      </section>

      <section className="space-y-3">
        <p className="eyebrow">Compte</p>
        {user.role === "COACH" && (
          <Link href="/import" className="block rounded-3xl border border-line bg-card px-6 py-4 text-sm font-bold uppercase tracking-[0.14em]">
            Importer une semaine →
          </Link>
        )}
        <form action={logout}>
          <button type="submit" className="w-full rounded-full border border-line px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-muted">
            Déconnexion
          </button>
        </form>
        <p className="pt-2 text-center text-[0.65rem] uppercase tracking-[0.2em] text-muted">Corpus Program · V1.0</p>
      </section>
    </div>
  );
}
