import { z } from "zod";
import { isInformationalBloc } from "@/lib/format";

/**
 * Validation stricte du JSON produit par les agents (docs/agents/01-schema-sortie-commun.md).
 * Erreurs = bloquent l'import. Avertissements = affichés, n'empêchent pas l'import.
 */

export const PROFILS = ["crossfit", "hybrid", "functional"] as const;
export type ProfilKey = (typeof PROFILS)[number];

export const WEEKDAYS = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"] as const;
type Weekday = (typeof WEEKDAYS)[number];

const FULL_WEEKDAYS: Record<string, Weekday> = {
  lundi: "lun",
  mardi: "mar",
  mercredi: "mer",
  jeudi: "jeu",
  vendredi: "ven",
  samedi: "sam",
  dimanche: "dim",
};

/**
 * "Lundi", "LUN", "libre (au choix de l'athlète)" -> jour reconnu, ou null
 * (jour libre — cas légitime : un athlète sans jours fixes, cf. « l'ordre des
 * jours s'adapte à l'emploi du temps »). N'importe quelle chaîne est acceptée
 * en entrée ; c'est cette fonction qui décide si elle vaut un jour précis.
 */
export function normalizeWeekday(raw: string): Weekday | null {
  const n = raw.trim().toLowerCase();
  if ((WEEKDAYS as readonly string[]).includes(n)) return n as Weekday;
  return FULL_WEEKDAYS[n] ?? null;
}

// Valeur libre dans le JSON : la normalisation (et le rejet éventuel) se fait
// à l'usage (import-week.ts), pas ici — un jour "libre" est une valeur valide.
const weekdaySchema = z.string().min(1);

const dureeSchema = z.union([z.number(), z.string()]);

const exerciceSchema = z.object({
  nom: z.string().min(1, "nom d'exercice vide"),
  notation: z.string().optional(),
  charge: z.string().optional(),
  repos: z.string().optional(),
  note: z.string().optional(),
  couche: z.enum(["noyau", "equivalents", "ouverture"]).optional(),
});

const blocSchema = z.object({
  nom: z.string().min(1, "nom de bloc vide"),
  duree_min: dureeSchema.optional(),
  type: z.literal("wod").optional(),
  module: z.enum(["charge", "volume", "moteur"]).optional(),
  format_entete: z.string().optional(),
  note: z.string().optional(),
  exercices: z.array(exerciceSchema).min(1, "un bloc doit contenir au moins un exercice"),
  checks_internes: z.array(z.string()).optional(),
});

const seanceSchema = z.object({
  // Plafonné à 4 uniquement pour les séances d'entraînement (vérifié plus
  // bas) — le jour tampon peut porter un numéro hors de cette plage.
  slot: z.number().int().min(1).optional(),
  jour: z.number().int().min(1).max(7),
  jour_type: z.enum(["entrainement", "tampon"]).default("entrainement"),
  duree_estimee_min: z.number().positive().optional(),
  titre: z.string().min(1, "titre de séance vide"),
  blocs: z.array(blocSchema).min(1, "une séance doit contenir au moins un bloc"),
});

export const importSchema = z.object({
  profil: z.enum(PROFILS),
  bloc: z.object({
    numero: z.number().int().min(1),
    duree_semaines: z.number().int().min(1).max(8),
    structure: z.string().optional(),
    focus_progression: z.string().optional(),
    repere_fin_de_bloc: z.string().optional(),
  }),
  semaine: z.object({
    numero_dans_le_bloc: z.number().int().min(1).max(8),
    type: z.enum(["chargee", "realisation", "deload"]),
    duree_totale_min: z.number().positive().optional(),
    note_progression_semaine: z.string().optional(),
    ordre_seances: z.array(z.string()).optional(),
    // { "slot1": "lun", "slot2": "mar", ... } — pré-remplit Day.weekday à l'import.
    jours: z.record(z.string(), weekdaySchema).optional(),
  }),
  seances: z.array(seanceSchema).min(1, "aucune séance"),
  controles_anti_monotonie: z.record(z.string(), z.unknown()),
  notes_coach: z.string().optional(),
});

export type ImportedWeek = z.infer<typeof importSchema>;
export type ImportedSeance = z.infer<typeof seanceSchema>;

export type ImportResult =
  | { ok: true; data: ImportedWeek; warnings: string[] }
  | { ok: false; errors: string[]; warnings: string[] };

/** "6-7" -> 6.5 ; 10 -> 10 ; "abc" -> null */
export function parseDuree(v: number | string | undefined): number | null {
  if (v === undefined) return null;
  if (typeof v === "number") return v;
  const m = v.match(/(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?/);
  if (!m) return null;
  const a = parseFloat(m[1].replace(",", "."));
  const b = m[2] ? parseFloat(m[2].replace(",", ".")) : a;
  return (a + b) / 2;
}

const OLYMPIQUE = /\b(snatch|arraché|arrache|clean|épaulé|epaule|jerk|jeté|jete)\b/i;
const ACCESSIBLE = /\b(dumbbell|db|kb|kettlebell|landmine|haltère|haltere|med ?ball)\b/i;
const ELAN = /\b(kipping|kip|muscle-?up|butterfly)\b/i;

function formatPath(path: PropertyKey[]): string {
  return path
    .map((p) => (typeof p === "number" ? `[${p + 1}]` : String(p)))
    .join(" › ");
}

export function validateImport(input: unknown): ImportResult {
  const warnings: string[] = [];
  const parsed = importSchema.safeParse(input);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => {
      const where = formatPath(i.path);
      return where ? `${where} : ${i.message}` : i.message;
    });
    return { ok: false, errors, warnings };
  }

  const data = parsed.data;
  const errors: string[] = [];
  const { profil, seances } = data;

  if (Object.keys(data.controles_anti_monotonie).length === 0) {
    errors.push("controles_anti_monotonie : objet vide (la preuve de conformité est obligatoire)");
  }

  const jours = seances.map((s) => s.jour);
  if (new Set(jours).size !== jours.length) {
    errors.push("seances : deux séances portent le même numéro de jour");
  }

  seances.forEach((s, si) => {
    const label = `séance ${si + 1} (« ${s.titre} »)`;
    if (s.duree_estimee_min && s.duree_estimee_min > 90) {
      errors.push(`${label} : ${s.duree_estimee_min} min — plafond absolu de 90 min dépassé`);
    }
    if (s.jour_type === "entrainement" && s.slot !== undefined && s.slot > 4) {
      errors.push(`${label} : slot ${s.slot} invalide — attendu entre 1 et 4 pour une séance d'entraînement`);
    }
    s.blocs.forEach((b, bi) => {
      const bl = `${label} › bloc ${bi + 1} (« ${b.nom} »)`;
      if (b.type === "wod" && !b.format_entete) {
        errors.push(`${bl} : un bloc WOD doit avoir un format_entete (format + scoring)`);
      }
      if (profil !== "functional" && b.module) {
        errors.push(`${bl} : le champ module est réservé au profil Functional`);
      }
      b.exercices.forEach((e) => {
        if (profil !== "crossfit" && OLYMPIQUE.test(e.nom) && !ACCESSIBLE.test(e.nom)) {
          warnings.push(
            `${bl} : « ${e.nom} » ressemble à de l'haltérophilie à la barre — interdit en ${
              profil === "hybrid" ? "Hybrid" : "Functional"
            } (variantes haltère/KB/landmine seulement)`,
          );
        }
        if (profil === "functional" && ELAN.test(e.nom)) {
          warnings.push(`${bl} : « ${e.nom} » est une gymnastique avec élan — exclue en Functional (versions strictes)`);
        }
      });
    });
  });

  const entrainement = seances.filter((s) => s.jour_type === "entrainement");
  const tampon = seances.filter((s) => s.jour_type === "tampon");

  if (profil === "functional") {
    if (entrainement.length !== 4) {
      errors.push(`Functional : 4 jours d'entraînement attendus, ${entrainement.length} reçus`);
    }
    if (tampon.length !== 1) {
      errors.push(`Functional : 1 jour tampon attendu, ${tampon.length} reçu(s)`);
    }
    entrainement.forEach((s) => {
      const label = `« ${s.titre} »`;
      // Un bloc échauffement/mobilité général (hors des 3 modules de 20 min,
      // cf. isInformationalBloc) n'a pas besoin d'être rattaché à un module.
      const untagged = s.blocs.filter((b) => !b.module && !isInformationalBloc(b.nom));
      if (untagged.length) {
        errors.push(`Functional ${label} : ${untagged.length} bloc(s) sans champ module (charge/volume/moteur)`);
        return;
      }
      const present = new Set(s.blocs.filter((b) => b.module).map((b) => b.module));
      for (const m of ["charge", "volume", "moteur"] as const) {
        if (!present.has(m)) errors.push(`Functional ${label} : module « ${m} » manquant (3 modules attendus)`);
      }
      for (const m of ["charge", "volume", "moteur"] as const) {
        const durees = s.blocs.filter((b) => b.module === m).map((b) => parseDuree(b.duree_min));
        if (durees.length && durees.every((d) => d !== null)) {
          const total = durees.reduce((a, d) => a + (d as number), 0);
          if (Math.abs(total - 20) > 2) {
            warnings.push(`Functional ${label} : le module ${m} totalise ${total} min (20 min attendues, préparation incluse)`);
          }
        }
      }
    });
  } else {
    if (tampon.length > 0) errors.push("jour tampon : réservé au profil Functional");
    if (entrainement.length !== 4) {
      errors.push(`${profil === "crossfit" ? "CrossFit" : "Hybrid"} : 4 séances attendues, ${entrainement.length} reçues`);
    }
  }

  if (profil === "crossfit") {
    entrainement.forEach((s) => {
      const d = s.duree_estimee_min;
      if (d !== undefined && (d < 65 || d > 90)) {
        warnings.push(`CrossFit « ${s.titre} » : ${d} min hors de la fourchette 70–86 min du profil`);
      }
    });
  }

  const total =
    data.semaine.duree_totale_min ??
    (seances.every((s) => s.duree_estimee_min !== undefined)
      ? seances.reduce((a, s) => a + (s.duree_estimee_min as number), 0)
      : undefined);
  if (total === undefined) {
    warnings.push("durée totale de la semaine non renseignée (≈ 300 min attendues pour les 3 profils)");
  } else if (total < 270 || total > 330) {
    warnings.push(`durée totale de la semaine : ${total} min (≈ 300 min attendues pour les 3 profils)`);
  }

  if (data.bloc.duree_semaines !== 6) {
    warnings.push(`bloc de ${data.bloc.duree_semaines} semaines (les 3 profils sont calés sur 6 semaines)`);
  }

  for (const [slotKey, value] of Object.entries(data.semaine.jours ?? {})) {
    if (!normalizeWeekday(value)) {
      warnings.push(
        `semaine.jours.${slotKey} : « ${value} » n'est pas un jour de la semaine reconnu — le jour restera "libre" (modifiable ensuite dans l'app)`,
      );
    }
  }

  return errors.length ? { ok: false, errors, warnings } : { ok: true, data, warnings };
}

/** Somme des durées de séance si toutes renseignées. */
export function totalWeekMinutes(w: ImportedWeek): number | null {
  if (w.semaine.duree_totale_min) return Math.round(w.semaine.duree_totale_min);
  if (w.seances.every((s) => s.duree_estimee_min !== undefined)) {
    return Math.round(w.seances.reduce((a, s) => a + (s.duree_estimee_min as number), 0));
  }
  return null;
}
