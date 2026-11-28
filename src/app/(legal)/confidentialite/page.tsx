import { legalInfo, TODO } from "@/lib/legal";

export const metadata = { title: "Confidentialité — Corpus Program" };

// Modèle RGPD à faire relire. Autorité de contrôle belge : APD.
export default function Confidentialite() {
  const l = legalInfo();
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p>Version du 28 novembre 2026. Responsable du traitement : {l.name ?? TODO} (DS Coaching), {l.email ?? TODO}.</p>

      <h2>Ce que nous collectons</h2>
      <ul>
        <li>Compte : prénom, e-mail, mot de passe (chiffré), provenance de l&apos;inscription (Instagram, TikTok…).</li>
        <li>Entraînement : profil choisi, records, séances réalisées, charges, commentaires et messages vocaux au coach.</li>
        <li>
          Informations de santé que tu choisis de renseigner (limitations, blessures) : utilisées uniquement pour adapter ta
          programmation, avec ton consentement, retirable en effaçant ces champs.
        </li>
        <li>Paiement : géré par Stripe. Nous ne voyons jamais ton numéro de carte.</li>
      </ul>

      <h2>Pourquoi</h2>
      <ul>
        <li>Fournir le service (exécution du contrat).</li>
        <li>T&apos;envoyer conseils et offres par e-mail, seulement si tu as coché la case (consentement, révocable dans ton profil).</li>
        <li>Facturation et obligations comptables (obligation légale).</li>
      </ul>

      <h2>Qui y a accès</h2>
      <p>
        Le coach uniquement. Prestataires techniques : Render et Neon (hébergement, UE), Stripe (paiement). Aucune revente.
        La photo utilisée pour une carte de partage reste sur ton téléphone.
      </p>

      <h2>Durée</h2>
      <p>Tant que ton compte existe, puis suppression sur demande. Les données de facturation sont conservées 7 ans (obligation comptable belge).</p>

      <h2>Tes droits</h2>
      <p>
        Accès, rectification, effacement, opposition, portabilité : écris à {l.email ?? TODO}. Tu peux aussi porter plainte
        auprès de l&apos;Autorité de protection des données (autoriteprotectiondonnees.be).
      </p>
    </>
  );
}
