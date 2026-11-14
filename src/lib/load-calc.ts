/**
 * Charges personnalisées : « 70% TM » → « 70% TM ≈ 84 kg » d'après les PR de
 * l'athlète. TM (training max) = le PR saisi dans le profil ; %PDC = poids de
 * corps. Sans PR pour le mouvement concerné, la charge reste telle quelle
 * (jamais de chiffre inventé).
 */

export type PrValues = {
  arracheKg: number | null;
  epauleJeteKg: number | null;
  backSquatKg: number | null;
  frontSquatKg: number | null;
  souleveDeTerreKg: number | null;
  developpeCoucheKg: number | null;
  developpeMilitaireKg: number | null;
  poidsDeCorpsKg: number | null;
};

type Lift = Exclude<keyof PrValues, "poidsDeCorpsKg">;

const LIFT_PATTERNS: [RegExp, Lift][] = [
  [/snatch|arrach/i, "arracheKg"],
  [/c&j|clean|jerk|épaulé|epaule|jeté|jete/i, "epauleJeteKg"],
  [/front squat/i, "frontSquatKg"],
  [/back squat|box squat|\bsquat\b/i, "backSquatKg"],
  [/sdt|deadlift|soulevé|souleve/i, "souleveDeTerreKg"],
  [/bench|développé couché|developpe couche/i, "developpeCoucheKg"],
  [/shoulder press|strict press|push press|z-press|développé militaire|developpe militaire|\bpress\b/i, "developpeMilitaireKg"],
];

// Variantes haltère / KB / landmine / unilatéral : pas le lift de barre du PR.
const NOT_BARBELL =
  /goblet|bulgarian|split|pallof|landmine|\bkb\b|kettlebell|\bdb\b|dumbbell|haltère|haltere|cossack|sissy|pistol|wall ball|thruster|machine|cable|bande|band\b|élastique|bottom-up|push-?up|pompe|leg press|prying/i;

/** `strict` : texte = nom de mouvement (on écarte les variantes non barre) ; sinon précision du coach (« TM C&J »). */
function liftFor(text: string, strict = false): Lift | null {
  if (strict && NOT_BARBELL.test(text)) return null;
  for (const [re, lift] of LIFT_PATTERNS) if (re.test(text)) return lift;
  return null;
}

const PERCENT = /(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*%\s*(TM|PDC)\b([^/()]*)/i;

const num = (s: string) => parseFloat(s.replace(",", "."));
const roundKg = (v: number) => Math.round(v * 2) / 2;
const fmtKg = (v: number) => String(roundKg(v)).replace(".", ",");

export type PersonalCharge = {
  /** Charge à afficher (texte du coach + ≈ kg quand calculable). */
  text: string;
  /** Un % TM / % PDC n'a pas pu être converti faute de PR. */
  unresolved: boolean;
};

/**
 * Traite chaque variante (« … (RX) / … (scaled) ») séparément : « 50% TM C&J (RX) /
 * 35-40% TM C&J (scaled) » → « 50% TM C&J ≈ 60 kg (RX) / 35-40% TM C&J ≈ 42–48 kg (scaled) ».
 */
export function personalizeCharge(nom: string, charge: string | null, prs: PrValues | null): PersonalCharge {
  if (!charge) return { text: "", unresolved: false };
  let unresolved = false;
  const parts = charge.split(/\s\/\s/).map((part) => {
    const m = part.match(PERCENT);
    if (!m) return part;
    const lo = num(m[1]);
    const hi = m[2] ? num(m[2]) : lo;
    let base: number | null = null;
    if (m[3].toUpperCase() === "PDC") {
      base = prs?.poidsDeCorpsKg ?? null;
    } else {
      const lift = liftFor(m[4]) ?? liftFor(nom, true);
      base = lift ? (prs?.[lift] ?? null) : null;
    }
    if (!base) {
      unresolved = true;
      return part;
    }
    const a = roundKg((base * lo) / 100);
    const b = roundKg((base * hi) / 100);
    const kg = a === b ? `${fmtKg(a)} kg` : `${fmtKg(a)}–${fmtKg(b)} kg`;
    // Le « ≈ kg » s'insère juste après le pourcentage (avant « (RX) » / « (scaled) »).
    const end = (m.index ?? 0) + m[0].length;
    const head = part.slice(0, end).trimEnd();
    const tail = part.slice(end);
    return `${head} ≈ ${kg}${tail ? (/^\s/.test(tail) ? tail : ` ${tail}`) : ""}`;
  });
  return { text: parts.join(" / "), unresolved };
}

/** Une charge chiffrée en % (donc convertible en kg avec les PR). */
export function isPercentCharge(charge: string | null): boolean {
  return !!charge && PERCENT.test(charge);
}

/** Le mouvement correspond à l'un des PR de l'athlète (squat, soulevé, arraché, épaulé-jeté, développés). */
export function hasPrLift(nom: string): boolean {
  return liftFor(nom, true) !== null;
}
