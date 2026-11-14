import type { WeekType } from "@prisma/client";

/** Libellé et consigne de la semaine d'après son type (chargée / réalisation / allégée). */
export const WEEK_TYPE_INFO: Record<WeekType, { label: string; hint: string | null; tone: "accent" | "brand" | null }> = {
  CHARGEE: { label: "Semaine chargée", hint: null, tone: null },
  REALISATION: {
    label: "Semaine de réalisation",
    hint: "Semaine de tests et de records : vise tes meilleures performances du bloc.",
    tone: "accent",
  },
  DELOAD: {
    label: "Semaine allégée",
    hint: "Volume et intensité réduits pour récupérer : ne cherche pas à en faire plus que prévu.",
    tone: "brand",
  },
};
