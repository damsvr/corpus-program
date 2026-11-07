import { describe, expect, it } from "vitest";
import { normalizeAudioMime, parseRange } from "@/lib/voice";

describe("normalizeAudioMime", () => {
  it("retire les paramètres et refuse le reste", () => {
    expect(normalizeAudioMime("audio/webm;codecs=opus")).toBe("audio/webm");
    expect(normalizeAudioMime("audio/mp4")).toBe("audio/mp4");
    expect(normalizeAudioMime("AUDIO/MP4; codecs=mp4a.40.2")).toBe("audio/mp4");
    for (const bad of ["text/html", "video/mp4", "application/octet-stream", "", null, undefined]) {
      expect(normalizeAudioMime(bad)).toBeNull();
    }
  });
});

describe("parseRange (Safari exige les requêtes par intervalles pour lire un audio)", () => {
  it("pas d'en-tête -> réponse complète", () => {
    expect(parseRange(null, 1000)).toBeNull();
  });
  it("intervalles valides", () => {
    expect(parseRange("bytes=0-", 1000)).toEqual({ start: 0, end: 999 });
    expect(parseRange("bytes=100-199", 1000)).toEqual({ start: 100, end: 199 });
    expect(parseRange("bytes=900-5000", 1000)).toEqual({ start: 900, end: 999 });
    expect(parseRange("bytes=-100", 1000)).toEqual({ start: 900, end: 999 });
    expect(parseRange("bytes=0-1", 2)).toEqual({ start: 0, end: 1 });
  });
  it("intervalles invalides", () => {
    for (const h of ["bytes=1000-", "bytes=500-100", "bytes=-", "pages=0-5", "bytes=0-1,5-9"]) {
      expect(parseRange(h, 1000)).toBe("invalid");
    }
  });
});
