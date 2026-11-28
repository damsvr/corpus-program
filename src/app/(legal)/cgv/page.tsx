import { PRICE_LABEL, FOUNDER_PRICE_LABEL, formatDayFr, freeAccessUntil } from "@/lib/billing";
import { legalInfo, TODO } from "@/lib/legal";

export const metadata = { title: "Conditions générales — Corpus Program" };

// Modèle à faire relire (Code de droit économique, livre VI) avant la mise en vente.
export default function Cgv() {
  const l = legalInfo();
  return (
    <>
      <h1>Conditions générales de vente et d&apos;utilisation</h1>
      <p>Version du 28 novembre 2026.</p>

      <h2>1. Qui vend</h2>
      <p>
        {l.name ?? TODO} (DS Coaching), {l.address ?? TODO}, BCE {l.bce ?? TODO}, {l.email ?? TODO}.
      </p>

      <h2>2. Le service</h2>
      <p>
        Corpus Program est une application web de programmation sportive (profils CrossFit, Hybrid et Functional) : séances
        hebdomadaires, outils de suivi et possibilité d&apos;envoyer un retour au coach. Ce n&apos;est ni un suivi médical ni un
        coaching en présentiel.
      </p>

      <h2>3. Accès libre et prix</h2>
      <ul>
        <li>Accès libre et gratuit jusqu&apos;au {formatDayFr(freeAccessUntil())} inclus, sans moyen de paiement.</li>
        <li>
          Ensuite : abonnement mensuel de {PRICE_LABEL} TTC ({FOUNDER_PRICE_LABEL} TTC pour les membres fondateurs, tarif
          maintenu tant que l&apos;abonnement n&apos;est pas résilié).
        </li>
        {l.vatFranchise && <li>Régime particulier de franchise des petites entreprises : TVA non applicable.</li>}
        <li>Paiement par carte via Stripe, prélevé chaque mois à la date anniversaire.</li>
      </ul>

      <h2>4. Durée et résiliation</h2>
      <p>
        Sans engagement. Tu résilies à tout moment depuis « Mon abonnement » : l&apos;accès reste ouvert jusqu&apos;à la fin du mois
        déjà payé, sans nouveau prélèvement. Ton historique et tes records restent conservés.
      </p>

      <h2>5. Droit de rétractation</h2>
      <p>
        Le programme est un contenu numérique fourni immédiatement. En t&apos;abonnant, tu demandes expressément l&apos;accès immédiat
        et reconnais perdre ton droit de rétractation de 14 jours (article VI.53, 13° du Code de droit économique). Tu
        restes libre de résilier à tout moment (point 4).
      </p>

      <h2>6. Santé et sécurité</h2>
      <ul>
        <li>Consulte un médecin avant de commencer, surtout après une longue pause, une blessure ou un problème de santé.</li>
        <li>
          Tu adaptes les charges et l&apos;intensité à tes sensations et arrêtes en cas de douleur. Renseigne tes limitations
          dans ton profil pour que la programmation en tienne compte.
        </li>
        <li>
          DS Coaching n&apos;est pas responsable d&apos;un dommage dû à une exécution non conforme, à un matériel inadapté ou au
          non-respect de ces consignes, sauf faute prouvée.
        </li>
      </ul>

      <h2>7. Compte et contenu</h2>
      <p>
        Ton compte est personnel. Les programmes ne peuvent être ni partagés ni revendus. Les feedbacks que tu envoies sont
        lus uniquement par le coach.
      </p>

      <h2>8. Données personnelles</h2>
      <p>Voir la politique de confidentialité.</p>

      <h2>9. Litiges</h2>
      <p>
        Droit belge. En cas de désaccord, écris d&apos;abord à {l.email ?? TODO}. À défaut d&apos;accord, tu peux saisir le Service
        de Médiation pour le Consommateur (mediationconsommateur.be). Les consommateurs gardent la protection du droit de leur
        pays de résidence.
      </p>
    </>
  );
}
