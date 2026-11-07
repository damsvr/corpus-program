/** Message vocal de fin de séance : limites et formats acceptés (voix seule, volontairement léger). */
export const VOICE_MAX_SECONDS = 120;
export const VOICE_MAX_BYTES = 1_500_000;
export const VOICE_BITRATE = 32_000;
export const COMMENT_MAX_CHARS = 2000;

const ALLOWED = new Set(["audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg", "audio/aac", "audio/x-m4a", "audio/wav"]);

/** "audio/webm;codecs=opus" -> "audio/webm" ; null si le format n'est pas accepté. */
export function normalizeAudioMime(raw: string | null | undefined): string | null {
  const base = (raw ?? "").split(";")[0].trim().toLowerCase();
  return ALLOWED.has(base) ? base : null;
}

/** En-tête Range d'un seul intervalle ("bytes=0-", "bytes=100-199", "bytes=-50") ; null = réponse complète. */
export function parseRange(header: string | null, size: number): { start: number; end: number } | "invalid" | null {
  if (!header) return null;
  const m = header.match(/^bytes=(\d*)-(\d*)$/);
  if (!m || (m[1] === "" && m[2] === "")) return "invalid";
  let start: number;
  let end: number;
  if (m[1] === "") {
    const suffix = parseInt(m[2], 10);
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = parseInt(m[1], 10);
    end = m[2] === "" ? size - 1 : Math.min(parseInt(m[2], 10), size - 1);
  }
  if (start >= size || start > end) return "invalid";
  return { start, end };
}
