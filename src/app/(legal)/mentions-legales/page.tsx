import { legalInfo, TODO } from "@/lib/legal";

export const metadata = { title: "Mentions légales — Corpus Program" };

export default function MentionsLegales() {
  const l = legalInfo();
  return (
    <>
      <h1>Mentions légales</h1>
      <h2>Éditeur</h2>
      <ul>
        <li>{l.name ?? TODO} (DS Coaching), entreprise individuelle de droit belge</li>
        <li>Adresse : {l.address ?? TODO}</li>
        <li>E-mail : {l.email ?? TODO}</li>
        <li>Numéro d&apos;entreprise (BCE) : {l.bce ?? TODO}</li>
        <li>
          TVA :{" "}
          {l.vatFranchise ? `BE ${l.bce ?? TODO} — régime particulier de franchise des petites entreprises` : `BE ${l.bce ?? TODO}`}
        </li>
      </ul>
      <h2>Hébergement</h2>
      <p>{l.host}.</p>
      <h2>Propriété intellectuelle</h2>
      <p>
        Les programmes, textes, logos et visuels Corpus Program et DS Coaching sont protégés. Toute reproduction ou revente
        sans accord écrit est interdite.
      </p>
    </>
  );
}
