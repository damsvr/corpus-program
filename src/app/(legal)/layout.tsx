import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-profile="ds" className="min-h-dvh bg-bg">
      <main className="mx-auto max-w-2xl space-y-6 px-5 pb-16 pt-8 text-sm leading-relaxed [&_h1]:text-3xl [&_h1]:font-extrabold [&_h2]:pt-4 [&_h2]:text-lg [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_p]:text-muted [&_li]:text-muted">
        <Link href="/" className="grad-text text-lg font-extrabold">
          CORPUS <span className="text-white">PROGRAM</span>
        </Link>
        {children}
        <p className="pt-6 text-xs">
          <Link href="/cgv" className="underline">CGV</Link> · <Link href="/confidentialite" className="underline">Confidentialité</Link> ·{" "}
          <Link href="/mentions-legales" className="underline">Mentions légales</Link>
        </p>
      </main>
    </div>
  );
}
