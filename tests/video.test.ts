import { describe, expect, it } from "vitest";
import { embedUrl, movementKey, parseYoutube, searchTerm, watchUrl, youtubeSearchUrl } from "@/lib/video";

describe("movementKey", () => {
  it("ignore accents, casse et précisions du coach", () => {
    expect(movementKey("Back squat — barre à vide")).toBe("back squat");
    expect(movementKey("Box squat — tempo 30X1, amplitude à la hauteur de box choisie")).toBe("box squat");
    expect(movementKey("Wall walk (RX) ou plank walk-up")).toBe("wall walk");
    expect(movementKey("Développé  Couché")).toBe("developpe couche");
  });
});

describe("parseYoutube", () => {
  const id = "dQw4w9WgXcQ";
  it("reconnaît les formes courantes", () => {
    for (const u of [
      `https://www.youtube.com/watch?v=${id}`,
      `https://youtube.com/watch?v=${id}&feature=share`,
      `https://m.youtube.com/watch?v=${id}`,
      `https://youtu.be/${id}?si=abc`,
      `https://www.youtube.com/shorts/${id}`,
      `https://www.youtube.com/embed/${id}`,
      `https://www.youtube.com/live/${id}`,
    ]) {
      expect(parseYoutube(u)?.id).toBe(id);
    }
  });

  it("lit le moment de départ", () => {
    expect(parseYoutube(`https://youtu.be/${id}?t=90`)?.start).toBe(90);
    expect(parseYoutube(`https://www.youtube.com/watch?v=${id}&t=1m30s`)?.start).toBe(90);
    expect(parseYoutube(`https://www.youtube.com/watch?v=${id}`)?.start).toBeNull();
  });

  it("refuse tout ce qui n'est pas YouTube", () => {
    for (const u of ["", "pas un lien", "https://vimeo.com/123456789", `https://evil.example/watch?v=${id}`, "https://www.youtube.com/watch?v=court", "javascript:alert(1)", `https://youtube.com.evil.example/watch?v=${id}`]) {
      expect(parseYoutube(u)).toBeNull();
    }
  });
});

describe("urls", () => {
  it("watch / embed (nocookie) / recherche", () => {
    const v = { id: "dQw4w9WgXcQ", start: 30 };
    expect(watchUrl(v)).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s");
    expect(embedUrl(v)).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&playsinline=1&start=30");
    expect(youtubeSearchUrl("Back squat — tempo 30X1")).toBe("https://www.youtube.com/results?search_query=Back%20squat%20exercise%20tutorial");
  });
});

describe("searchTerm", () => {
  it("garde une seule variante, sans précisions ni signes", () => {
    expect(searchTerm("Toes-to-bar (RX) / Tempo hanging knee raise (scaled)")).toBe("Toes to bar");
    expect(searchTerm("Dead hang / activation préhension (légère)")).toBe("Dead hang");
    expect(searchTerm("Wall walk (RX) ou plank walk-up / incline wall walk")).toBe("Wall walk");
    expect(searchTerm("Arm circles + PVC pass-through")).toBe("Arm circles PVC pass through");
    expect(searchTerm("Cable/band chop")).toBe("Cable band chop");
    expect(searchTerm("Complexe : 2 hang power clean + 2 push press")).toBe("2 hang power clean 2 push press");
    expect(searchTerm("Back squat — tempo 30X1")).toBe("Back squat");
  });
});
