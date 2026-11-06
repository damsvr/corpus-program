// Options de la carte de partage (`/api/share/[id]`) et réseaux proposés dans `/partager/[id]`.
// Module pur (pas de Prisma) : partagé entre la route d'image, le panneau client et les tests.

export type CardLayout = "fond" | "photo" | "sticker";
export type CardFormat = "story" | "post";

export type CardOptions = {
  /** fond = fond anthracite DS Coaching (logo + pictogrammes) ; photo = calque transparent posé en bas, à superposer à la photo de l'athlète ; sticker = calque transparent centré. */
  layout: CardLayout;
  format: CardFormat;
  comment: string;
  showDuration: boolean;
  showCalories: boolean;
  showPerformance: boolean;
  /** Ressenti noté par l'athlète, 1 à 5 ; 0 = non renseigné (jauge masquée). */
  intensity: number;
  satisfaction: number;
};

export type Rating = "intensity" | "satisfaction";

/** Libellés des jauges, du point 1 au point 5. */
export const RATING_SCALE: Record<Rating, { title: string; levels: [string, string, string, string, string] }> = {
  intensity: { title: "Intensité", levels: ["Facile", "Modérée", "Soutenue", "Dure", "Très intense"] },
  satisfaction: { title: "Satisfaction", levels: ["Fatigué·e", "Mitigé·e", "Satisfait·e", "Content·e", "Fier·ère · PR"] },
};

/** "3" -> 3 ; tout ce qui n'est pas un entier de 1 à 5 -> 0 (non renseigné). */
export function parseRating(raw: string | null | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : 0;
}

export const COMMENT_MAX = 140;

/** Story 9:16 (Instagram/Snapchat/TikTok/WhatsApp statut) ou post 4:5 (fil Instagram/Facebook). */
export const CARD_SIZE: Record<CardFormat, { width: number; height: number }> = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1350 },
};

/** Commentaire sur une ligne logique, espaces normalisés, coupé à COMMENT_MAX caractères (pas au milieu d'un emoji). */
export function cleanComment(raw: string | null | undefined): string {
  const flat = (raw ?? "").replace(/\s+/g, " ").trim();
  const chars = Array.from(flat);
  return chars.length <= COMMENT_MAX ? flat : chars.slice(0, COMMENT_MAX).join("").trimEnd();
}

export function parseCardOptions(params: URLSearchParams): CardOptions {
  const layout = params.get("style");
  const hide = new Set((params.get("hide") ?? "").split(",").filter(Boolean));
  return {
    layout: layout === "photo" || layout === "sticker" ? layout : "fond",
    format: params.get("format") === "post" ? "post" : "story",
    comment: cleanComment(params.get("c")),
    showDuration: !hide.has("duree"),
    showCalories: !hide.has("kcal"),
    showPerformance: !hide.has("perf"),
    intensity: parseRating(params.get("int")),
    satisfaction: parseRating(params.get("sat")),
  };
}

export function cardQuery(o: CardOptions): string {
  const p = new URLSearchParams({ style: o.layout, format: o.format });
  const hide = [!o.showDuration && "duree", !o.showCalories && "kcal", !o.showPerformance && "perf"].filter(Boolean);
  if (hide.length) p.set("hide", hide.join(","));
  const c = cleanComment(o.comment);
  if (c) p.set("c", c);
  if (parseRating(String(o.intensity))) p.set("int", String(o.intensity));
  if (parseRating(String(o.satisfaction))) p.set("sat", String(o.satisfaction));
  return p.toString();
}

export type ShareTargetId = "instagram" | "facebook" | "whatsapp" | "snapchat" | "tiktok" | "x";

export type ShareTarget = {
  id: ShareTargetId;
  label: string;
  /** Page web ouverte sur ordinateur (pas de partage de fichier natif) après l'enregistrement de l'image. */
  webUrl: (text: string) => string;
};

export const SHARE_TARGETS: ShareTarget[] = [
  { id: "instagram", label: "Instagram", webUrl: () => "https://www.instagram.com/" },
  { id: "facebook", label: "Facebook", webUrl: () => "https://www.facebook.com/" },
  {
    id: "whatsapp",
    label: "WhatsApp",
    webUrl: (t) => `https://web.whatsapp.com/${t ? `send?text=${encodeURIComponent(t)}` : ""}`,
  },
  { id: "snapchat", label: "Snapchat", webUrl: () => "https://web.snapchat.com/" },
  { id: "tiktok", label: "TikTok", webUrl: () => "https://www.tiktok.com/upload" },
  {
    id: "x",
    label: "X",
    webUrl: (t) => `https://x.com/compose/post${t ? `?text=${encodeURIComponent(t)}` : ""}`,
  },
];
