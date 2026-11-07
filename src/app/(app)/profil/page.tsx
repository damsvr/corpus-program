import Link from "next/link";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { JOURS, PROFILE_KEYS, PROFILE_META } from "@/lib/profiles";
import { getPublicationStatus } from "@/lib/program";
import { SaveForm } from "@/components/save-form";
import { TimeInput } from "@/components/time-input";
import { CopyLink } from "@/components/copy-link";
import { InstagramContact } from "@/components/instagram-contact";
import { getAccess, isCycleOver, isLinkOpen } from "@/lib/access";
import { logout, saveAccessLink, saveAthlete, saveMarketing, savePrs, saveReminder, setProfile } from "./actions";

export const metadata = { title: "Profil — Corpus Program" };

const dateFr = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const field =
  "w-24 rounded-xl border border-line bg-bg/70 px-3 py-2 text-right text-base outline-none focus:border-brand";
const area =
  "mt-2 w-full rounded-2xl border border-line bg-bg/70 px-4 py-3 text-sm outline-none focus:border-brand";

const PR_FIELDS: { name: string; label: string; unit: string; hint?: string }[] = [
  { name: "arracheKg", label: "Arraché (snatch)", unit: "kg" },
  { name: "epauleJeteKg", label: "Épaulé-jeté (clean & jerk)", unit: "kg" },
  { name: "backSquatKg", label: "Back squat", unit: "kg" },
  { name: "frontSquatKg", label: "Front squat", unit: "kg" },
  { name: "souleveDeTerreKg", label: "Soulevé de terre", unit: "kg" },
  { name: "developpeCoucheKg", label: "Développé couché", unit: "kg" },
  { name: "developpeMilitaireKg", label: "Développé militaire", unit: "kg" },
  { name: "poidsDeCorpsKg", label: "Poids de corps", unit: "kg", hint: "utilisé pour les % PDC" },
  { name: "row2000m", label: "2000 m rameur", unit: "mm:ss", hint: "temps de référence" },
  { name: "course5km", label: "5 km course", unit: "mm:ss", hint: "temps de référence" },
];

export default async function ProfilPage() {
  const user = await requireUser();
  const [prs, athlete] = await Promise.all([
    db.prs.findUnique({ where: { userId: user.id } }),
    db.athleteProfile.findUnique({ where: { userId: user.id } }),
  ]);
  const prsRecord = (prs ?? {}) as Record<string, number | string | null | undefined>;
  const isCoach = user.role === "COACH";
  const [publication, access, freeLink] = await Promise.all([
    isCoach ? getPublicationStatus(user.id) : null,
    getAccess(user),
    isCoach
      ? db.accessLink.findFirst({
          where: { profile: "HYBRID" },
          orderBy: { createdAt: "desc" },
          include: {
            users: { orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, marketingOptIn: true } },
          },
        })
      : null,
  ]);
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const shownProfiles = access.link ? [access.link.profile] : PROFILE_KEYS;
  const optIns = freeLink?.users.filter((u) => u.marketingOptIn).length ?? 0;

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow !text-brand">{user.role === "COACH" ? "Coach" : "Athlète"}</p>
        <h1 className="mt-1 text-4xl font-extrabold uppercase">{user.name || "Athlète"}</h1>
        <p className="mt-1 text-muted">{user.email}</p>
      </div>

      <section className="space-y-4">
        <p className="eyebrow">Mon profil d&apos;entraînement</p>
        {access.link ? (
          <p className="text-sm text-muted">
            Accès gratuit « {access.link.label} » : programme {PROFILE_META[access.link.profile].label} de ce cycle,
            jusqu&apos;au {dateFr(access.link.endsAt)}.
          </p>
        ) : (
          <p className="text-sm text-muted">
            Change quand tu veux, sans frais et sans repartir de zéro : tes PR, tes gates et ton historique sont conservés.{" "}
            <Link href="/onboarding" className="text-brand underline">
              Trois questions pour choisir
            </Link>
          </p>
        )}
        <div className="space-y-3">
          {shownProfiles.map((p) => {
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
        {access.link && (
          <>
            <InstagramContact />
            <div className="rounded-3xl border border-line bg-card p-5">
              <SaveForm action={saveMarketing}>
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="marketingOptIn"
                    defaultChecked={user.marketingOptIn}
                    className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]"
                  />
                  <span>
                    Me recontacter par e-mail pour les prochaines sessions gratuites et les offres d&apos;abonnement.
                  </span>
                </label>
              </SaveForm>
            </div>
          </>
        )}
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
                    {f.unit === "mm:ss" ? (
                      <TimeInput id={f.name} name={f.name} defaultValue={prsRecord[f.name] as string | null | undefined} />
                    ) : (
                      <span className="flex items-center gap-2">
                        <input
                          id={f.name}
                          name={f.name}
                          inputMode="decimal"
                          autoComplete="off"
                          enterKeyHint="next"
                          placeholder="0"
                          defaultValue={prsRecord[f.name] ?? ""}
                          className={field}
                        />
                        <span className="w-6 text-xs text-muted">{f.unit}</span>
                      </span>
                    )}
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

      {publication && (
        <section className="space-y-4">
          <p className="eyebrow">Publication aux athlètes</p>
          <div className="rounded-3xl border border-line bg-card p-5">
            <p className="text-sm text-muted">
              Les athlètes voient automatiquement les semaines que tu importes, pour chaque profil.
            </p>
            <ul className="mt-3 divide-y divide-line/70">
              {publication.profiles.map((p) => (
                <li key={p.profile} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="font-medium">{PROFILE_META[p.profile].label}</span>
                  <span className="text-right text-xs text-muted">
                    {p.weeks.length > 0 ? (
                      <span className="text-brand">
                        {p.weeks.length} semaine{p.weeks.length > 1 ? "s" : ""} ({p.weeks.join(", ")})
                      </span>
                    ) : (
                      "rien de publié"
                    )}
                    {" · "}
                    {p.athletes} athlète{p.athletes > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
            {publication.coaches > 1 && (
              <p className="mt-3 rounded-xl bg-accent/10 px-3 py-2 text-xs text-accent">
                {publication.coaches} comptes ont le rôle coach : les athlètes suivent celui qui a publié le plus récemment.
              </p>
            )}
          </div>
        </section>
      )}

      {isCoach && (
        <section className="space-y-4">
          <p className="eyebrow">Accès gratuit Hybrid</p>
          <div data-profile="hybrid" className="space-y-4 rounded-3xl border border-line bg-card p-5">
            <p className="text-sm text-muted">
              Un lien unique à partager : qui s&apos;inscrit avec suit gratuitement le programme Hybrid, limité aux blocs du
              cycle et jusqu&apos;à la date de fin. Ensuite, plus d&apos;inscription ni de programme ; l&apos;historique reste.
            </p>
            {freeLink && (
              <>
                <CopyLink url={`${origin}/acces/${freeLink.code}`} />
                <p className="text-xs text-muted">
                  {isLinkOpen(freeLink) ? (
                    <span className="text-brand">Ouvert</span>
                  ) : isCycleOver(freeLink) ? (
                    "Cycle terminé"
                  ) : (
                    "Fermé aux inscriptions"
                  )}
                  {" · "}
                  {freeLink.users.length} inscrit{freeLink.users.length > 1 ? "s" : ""}
                  {" · "}
                  {optIns} d&apos;accord pour être recontacté{optIns > 1 ? "s" : ""}
                </p>
                {freeLink.users.length > 0 && (
                  <details className="rounded-2xl border border-line">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Inscrits</summary>
                    <ul className="divide-y divide-line/70 border-t border-line/70">
                      {freeLink.users.map((u) => (
                        <li key={u.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{u.name || "—"}</span>
                            <span className="block truncate text-xs text-muted">{u.email}</span>
                          </span>
                          <span className={`shrink-0 text-xs ${u.marketingOptIn ? "text-brand" : "text-muted"}`}>
                            {u.marketingOptIn ? "✓ recontact" : "pas d'accord"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {optIns > 0 && (
                  <a
                    href="/api/acces/contacts"
                    download
                    className="block rounded-full border border-line px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-brand"
                  >
                    Exporter les contacts (CSV)
                  </a>
                )}
              </>
            )}
            <SaveForm action={saveAccessLink} label={freeLink ? "Enregistrer" : "Créer le lien"}>
              <label className="block">
                <span className="text-sm font-medium">Nom du cycle</span>
                <input name="label" defaultValue={freeLink?.label ?? "Préparation TyRun"} className={area} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium">Du bloc</span>
                  <input name="blocDebut" inputMode="numeric" defaultValue={freeLink?.blocDebut ?? 1} className={area} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Au bloc</span>
                  <input name="blocFin" inputMode="numeric" defaultValue={freeLink?.blocFin ?? 1} className={area} />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium">Fin du cycle (jour de la course)</span>
                <input
                  type="date"
                  name="endsAt"
                  required
                  defaultValue={freeLink?.endsAt.toISOString().slice(0, 10)}
                  className={area}
                />
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" name="active" defaultChecked={freeLink?.active ?? true} className="size-5 accent-[var(--accent)]" />
                Inscriptions ouvertes
              </label>
            </SaveForm>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <p className="eyebrow">Compte</p>
        {isCoach && (
          <Link href="/import" className="block rounded-3xl border border-line bg-card px-6 py-4 text-sm font-bold uppercase tracking-[0.14em]">
            Importer une semaine →
          </Link>
        )}
        {user.role === "COACH" && (
          <Link href="/videos" className="block rounded-3xl border border-line bg-card px-6 py-4 text-sm font-bold uppercase tracking-[0.14em]">
            Vidéos des mouvements →
          </Link>
        )}
        {user.role === "COACH" && (
          <Link href="/retours" className="block rounded-3xl border border-line bg-card px-6 py-4 text-sm font-bold uppercase tracking-[0.14em]">
            Feedback des athlètes →
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
