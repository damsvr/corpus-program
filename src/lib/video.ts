import { shortExerciceName } from "@/lib/share";

export type YoutubeRef = { id: string; start: number | null };

/** Clé stable d'un mouvement, indépendante des accents, de la casse et des précisions ("— tempo 30X1", "(RX)"). */
export function movementKey(nom: string): string {
  return shortExerciceName(nom)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const ID = /^[\w-]{11}$/;

function seconds(raw: string | null): number | null {
  if (!raw) return null;
  const m = raw.trim().match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i);
  if (!m || (!m[1] && !m[2] && !m[3])) return null;
  const total = (parseInt(m[1] ?? "0", 10) * 60 + parseInt(m[2] ?? "0", 10)) * 60 + parseInt(m[3] ?? "0", 10);
  return total > 0 ? total : null;
}

/** Accepte les formes courantes d'un lien YouTube (watch, youtu.be, shorts, embed, live) ; null sinon. */
export function parseYoutube(input: string): YoutubeRef | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^(www|m|music)\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const m = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/]+)/);
      id = m ? m[1] : null;
    }
  }
  if (!id || !ID.test(id)) return null;
  return { id, start: seconds(url.searchParams.get("t") ?? url.searchParams.get("start")) };
}

export function watchUrl(v: YoutubeRef): string {
  return `https://www.youtube.com/watch?v=${v.id}${v.start ? `&t=${v.start}s` : ""}`;
}

export function embedUrl(v: YoutubeRef): string {
  return `https://www.youtube-nocookie.com/embed/${v.id}?rel=0&playsinline=1${v.start ? `&start=${v.start}` : ""}`;
}

/** Repli quand aucune vidéo n'est enregistrée : la recherche YouTube du mouvement existe toujours. */
export function youtubeSearchUrl(nom: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${shortExerciceName(nom)} technique`)}`;
}
