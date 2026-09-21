import type { ProfileType } from "@prisma/client";

export const PROFILE_META: Record<
  ProfileType,
  { key: "crossfit" | "hybrid" | "functional"; label: string; seeks: string; promise: string; who: string; format: string }
> = {
  CROSSFIT: {
    key: "crossfit",
    label: "CrossFit",
    seeks: "La compétence",
    promise: "Apprends les mouvements qui te bloquent.",
    who: "Tu veux progresser en CrossFit, technique comprise.",
    format: "4 séances complètes, 70 à 86 min.",
  },
  HYBRID: {
    key: "hybrid",
    label: "Hybrid",
    seeks: "La performance",
    promise: "Plus lourd, plus vite, plus loin.",
    who: "Tu veux de la force et du cardio sur des mouvements simples, avec ou sans échéance.",
    format: "4 séances complètes, efforts continus.",
  },
  FUNCTIONAL: {
    key: "functional",
    label: "Functional",
    seeks: "La robustesse",
    promise: "Un corps qui tient.",
    who: "Tu veux un corps solide : semaine imprévisible, reprise, renforcement.",
    format: "4 jours + 1 jour tampon, 3 modules de 20 min.",
  },
};

export const PROFILE_KEYS = ["CROSSFIT", "HYBRID", "FUNCTIONAL"] as const satisfies readonly ProfileType[];

export function profileFromKey(k: string): ProfileType | null {
  const found = (Object.entries(PROFILE_META) as [ProfileType, { key: string }][]).find(([, m]) => m.key === k);
  return found ? found[0] : null;
}

export const MODULE_META = {
  CHARGE: { label: "Charge", rule: "Toujours en premier dans la journée, corps frais." },
  VOLUME: { label: "Volume", rule: "N'importe quand dans la journée." },
  MOTEUR: { label: "Moteur", rule: "N'importe quand, au moins 20 min après le module Charge." },
} as const;

export const JOURS = [
  { key: "lun", label: "Lun" },
  { key: "mar", label: "Mar" },
  { key: "mer", label: "Mer" },
  { key: "jeu", label: "Jeu" },
  { key: "ven", label: "Ven" },
  { key: "sam", label: "Sam" },
  { key: "dim", label: "Dim" },
] as const;
