import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  FOUNDER_PRICE_LABEL,
  founderSeats,
  founderUntil,
  formatDayFr,
  freeAccessUntil,
  isFreePeriod,
  PAYING_STATUSES,
  PREMIUM_PRICE_LABEL,
  PRICE_LABEL,
} from "@/lib/billing";
import { COACH_INSTAGRAM_HANDLE, COACH_INSTAGRAM_URL } from "@/lib/contact";
import { LandingQuiz } from "@/components/landing-quiz";
import logo from "@/assets/brand/ds-coaching.jpg";

export const metadata: Metadata = {
  title: "Corpus Program — CrossFit, Hyrox et Functional pour parents de 35 ans et plus",
  description:
    "La programmation de DS Coaching pour les parents qui s'entraînent avec le temps qu'ils ont. CrossFit, Hybrid (Hyrox, TyRun) ou Functional. On ne fait pas ce qu'on veut, on fait ce qu'on peut.",
  openGraph: {
    title: "Corpus Program — on fait ce qu'on peut, et on progresse quand même",
    description: "CrossFit, Hyrox et Functional pour parents de 35 ans et plus. Accès libre pour tester.",
    type: "website",
    locale: "fr_BE",
  },
};

const primary =
  "grad-accent inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black sm:w-auto";
const ghost =
  "inline-flex w-full items-center justify-center rounded-full border border-line px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] sm:w-auto";

const PROFILES = [
  {
    key: "crossfit",
    label: "CrossFit",
    title: "Débloque enfin tes mouvements.",
    text: "Arraché, épaulé-jeté, tractions strictes, équilibre : la technique est travaillée chaque semaine, sans raccourci.",
    format: "4 séances de 70 à 86 min",
    forWho: "Pour toi si tu peux bloquer tes créneaux.",
  },
  {
    key: "hybrid",
    label: "Hybrid",
    title: "Hyrox, TyRun, ou juste tes chiffres.",
    text: "Force lourde et cardio continu sur des mouvements simples, avec des tests réguliers pour voir tes progrès.",
    format: "4 séances, efforts continus",
    forWho: "Pour toi si tu veux un objectif, dossard ou pas.",
  },
  {
    key: "functional",
    label: "Functional",
    title: "Un corps qui tient, même quand la semaine déraille.",
    text: "3 modules de 20 min à placer dans ta journée, quand tu peux. Un jour tampon rattrape ce que tu as sauté.",
    format: "4 jours × 3 modules + 1 jour tampon",
    forWho: "Pour toi si ton agenda ne t'appartient pas.",
  },
];

const PARENT_FEATURES = [
  ["Version courte", "Pas le temps ? Un bouton retire le superflu, l'essentiel reste."],
  ["3, 4 ou 5 séances", "Tu choisis ton rythme. À 3, on te dit quelle séance sauter."],
  ["Le jour tampon", "En Functional, ce que tu rates se rattrape. Pas de culpabilité."],
  ["Tes charges en kg", "Les % sont calculés sur tes records. Tu arrives, tu charges, tu bosses."],
  ["Chronos intégrés", "EMOM, AMRAP, séries, repos : tu lances, l'app suit pour toi."],
  ["Un coach qui écoute", "Après chaque séance, un retour écrit ou vocal. Je lis tout, j'ajuste."],
];

export default async function Home({ searchParams }: { searchParams: Promise<{ src?: string; utm_source?: string }> }) {
  const session = await auth();
  if (session?.user) redirect("/aujourdhui");

  const params = await searchParams;
  const source = (params.src ?? params.utm_source)?.slice(0, 40);
  const withSrc = (href: string) => (source ? `${href}${href.includes("?") ? "&" : "?"}src=${encodeURIComponent(source)}` : href);

  const free = isFreePeriod();
  const until = freeAccessUntil();
  const fUntil = founderUntil();
  const founderPrice = process.env.STRIPE_FOUNDER_PRICE_ID;
  const taken = founderPrice
    ? await db.user.count({ where: { stripePriceId: founderPrice, subscriptionStatus: { in: PAYING_STATUSES } } })
    : 0;
  const seatsLeft = Math.max(0, founderSeats() - taken);
  const founder = new Date() <= fUntil && seatsLeft > 0;

  return (
    <div data-profile="ds" className="min-h-dvh bg-bg">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="DS Coaching" width={40} height={40} className="rounded-full" priority />
          <span className="grad-text text-lg font-extrabold tracking-tight">
            CORPUS <span className="text-white">PROGRAM</span>
          </span>
        </div>
        <Link href="/login" className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
          Connexion
        </Link>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-5 pb-16 pt-8 sm:pt-16">
          <p className="eyebrow !text-brand">DS Coaching · Parents de 35 ans et plus</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold uppercase leading-[1.05] sm:text-6xl">
            On ne fait pas ce qu&apos;on veut. <span className="grad-text">On fait ce qu&apos;on peut.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            Et on progresse quand même. La programmation CrossFit, Hyrox et Functional pensée pour une vie de parent : le
            boulot, les enfants, la garde, et ton entraînement au milieu.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#quiz" className={primary}>
              Trouver mon profil
            </a>
            <Link href={withSrc("/signup")} className={ghost}>
              Créer mon compte
            </Link>
          </div>
          {free && (
            <p className="mt-5 text-sm text-brand">
              Accès libre jusqu&apos;au {formatDayFr(until)} · sans carte bancaire
            </p>
          )}
        </section>

        {/* La réalité du coach */}
        <section className="border-y border-line bg-card2">
          <div className="mx-auto grid max-w-5xl gap-8 px-5 py-14 sm:grid-cols-[auto,1fr] sm:items-center">
            <Image src={logo} alt="" width={120} height={120} className="rounded-3xl" />
            <div className="space-y-4">
              <p className="eyebrow">Le coach</p>
              <h2 className="text-2xl font-extrabold sm:text-3xl">Je suis papa, coach, et je m&apos;entraîne comme toi.</h2>
              <p className="text-muted">
                Les semaines où j&apos;ai mon fils, mes séances se calent entre l&apos;école, les repas et le coucher. Les
                autres semaines, j&apos;en profite. Je n&apos;ai pas construit Corpus Program pour des athlètes qui ont toute
                la journée. Je l&apos;ai construit pour nous.
              </p>
              <p className="font-bold">Damien · DS Coaching</p>
            </div>
          </div>
        </section>

        {/* Ce qui change pour un parent */}
        <section className="mx-auto max-w-5xl px-5 py-16">
          <p className="eyebrow">Pensé pour ta vraie semaine</p>
          <h2 className="mt-2 text-3xl font-extrabold uppercase">Le programme s&apos;adapte. Pas l&apos;inverse.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PARENT_FEATURES.map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-line bg-card p-5">
                <div className="grad-accent h-[3px] w-8 rounded-full" />
                <p className="mt-3 font-bold">{title}</p>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Les 3 profils */}
        <section className="mx-auto max-w-5xl px-5 pb-16">
          <p className="eyebrow">Trois profils, une même exigence</p>
          <h2 className="mt-2 text-3xl font-extrabold uppercase">Qu&apos;est-ce que tu viens chercher ?</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {PROFILES.map((p) => (
              <div key={p.key} data-profile={p.key} className="flex flex-col rounded-3xl border border-line bg-card p-6">
                <p className="grad-text text-3xl font-extrabold">{p.label}</p>
                <p className="mt-3 text-lg font-bold">{p.title}</p>
                <p className="mt-2 flex-1 text-sm text-muted">{p.text}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.14em] text-accent">{p.format}</p>
                <p className="mt-1 text-sm">{p.forWho}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            ≈ 300 min par semaine pour les trois profils. Changement de profil libre, sans repartir de zéro.
          </p>
        </section>

        {/* Quiz */}
        <section id="quiz" className="scroll-mt-6 border-y border-line bg-card2">
          <div className="mx-auto max-w-xl px-5 py-16">
            <p className="eyebrow !text-brand">Choisir</p>
            <h2 className="mt-1 text-3xl font-extrabold uppercase">
              Trois questions. <span className="grad-text">Pas dix.</span>
            </h2>
            <div className="mt-6">
              <LandingQuiz source={source} />
            </div>
          </div>
        </section>

        {/* Prix */}
        <section className="mx-auto max-w-5xl px-5 py-16">
          <p className="eyebrow">Tarifs</p>
          <h2 className="mt-2 text-3xl font-extrabold uppercase">Simple. Sans engagement.</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-accent bg-card p-6">
              <p className="font-bold">Corpus Program</p>
              {founder ? (
                <>
                  <p className="mt-3">
                    <span className="grad-text text-5xl font-extrabold">{FOUNDER_PRICE_LABEL}</span>
                    <span className="text-muted"> /mois TTC</span>
                  </p>
                  <p className="mt-1 text-sm text-accent">
                    Membre fondateur · {seatsLeft} places · jusqu&apos;au {formatDayFr(fUntil)}, puis {PRICE_LABEL}
                  </p>
                  <p className="text-sm text-muted">Ton tarif reste bloqué tant que tu restes abonné.</p>
                </>
              ) : (
                <p className="mt-3">
                  <span className="grad-text text-5xl font-extrabold">{PRICE_LABEL}</span>
                  <span className="text-muted"> /mois TTC</span>
                </p>
              )}
              <ul className="mt-5 space-y-2 text-sm">
                <li>✓ Ta programmation chaque semaine, dans l&apos;app</li>
                <li>✓ CrossFit, Hybrid ou Functional, changement libre</li>
                <li>✓ Vidéos des mouvements, chronos, charges en kg</li>
                <li>✓ Feedback écrit ou vocal au coach</li>
                <li>✓ Résiliable à tout moment</li>
              </ul>
              <Link href={withSrc("/signup")} className={`${primary} mt-6 !w-full`}>
                {free ? "Tester gratuitement" : "Commencer"}
              </Link>
            </div>
            <div className="rounded-3xl border border-line bg-card p-6">
              <p className="font-bold">Suivi Premium</p>
              <p className="mt-3">
                <span className="text-5xl font-extrabold">{PREMIUM_PRICE_LABEL}</span>
                <span className="text-muted"> /mois TTC</span>
              </p>
              <p className="mt-1 text-sm text-muted">15 places · sur demande</p>
              <ul className="mt-5 space-y-2 text-sm">
                <li>✓ Tout Corpus Program</li>
                <li>✓ Bilan hebdomadaire personnalisé avec le coach</li>
                <li>✓ Ajustements selon tes limitations, ta semaine, ta récup</li>
                <li>✓ Préparation ciblée pour ta course (Hyrox, TyRun…)</li>
              </ul>
              <a
                href={COACH_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${ghost} mt-6 !w-full`}
              >
                Écris « PREMIUM » sur Instagram
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-5 pb-16">
          <p className="eyebrow">Questions fréquentes</p>
          <div className="mt-6 space-y-3">
            {[
              [
                "Je n'ai que 3 créneaux par semaine. Ça vaut le coup ?",
                "Oui. Tu règles l'app sur 3 séances : elle t'indique laquelle sauter sans casser la progression. Et la version courte retire les parties facultatives les jours serrés.",
              ],
              [
                "Je reprends après des années sans sport.",
                "Le profil Functional est fait pour ça : des modules courts, un jour tampon, et des adaptations selon tes limitations que tu renseignes dans ton profil.",
              ],
              [
                "Il me faut quel matériel ?",
                "Une box CrossFit ou une salle bien équipée. Chaque mouvement a sa vidéo pour savoir quoi faire.",
              ],
              [
                `Que se passe-t-il après le ${formatDayFr(until)} ?`,
                `L'abonnement passe à ${PRICE_LABEL} par mois (${FOUNDER_PRICE_LABEL} pour les membres fondateurs). Si tu ne t'abonnes pas, ton historique et tes records restent sauvegardés.`,
              ],
              ["Je suis en France, ça marche ?", "Oui, partout. L'app est en français et fonctionne sur ton téléphone, sans rien installer."],
              ["Je peux arrêter quand je veux ?", "Oui. Sans engagement, tu résilies en deux clics depuis ton compte."],
            ].map(([q, a]) => (
              <details key={q} className="group rounded-3xl border border-line bg-card px-5 py-4">
                <summary className="cursor-pointer list-none font-bold marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {q} <span className="text-accent transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Dernier appel */}
        <section className="mx-auto max-w-5xl px-5 pb-20 text-center">
          <h2 className="text-3xl font-extrabold uppercase sm:text-4xl">
            Ta semaine ne sera jamais parfaite. <span className="grad-text">Commence quand même.</span>
          </h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#quiz" className={primary}>
              Trouver mon profil
            </a>
            <Link href={withSrc("/signup")} className={ghost}>
              Créer mon compte
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <a href={COACH_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-white">
            {COACH_INSTAGRAM_HANDLE}
          </a>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/cgv">Conditions générales</Link>
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/login">Connexion</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
