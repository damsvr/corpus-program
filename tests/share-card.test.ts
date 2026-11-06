import { describe, expect, it } from "vitest";
import { cardQuery, cleanComment, COMMENT_MAX, parseCardOptions, parseRating, RATING_SCALE, SHARE_TARGETS } from "@/lib/share-card";

describe("options de la carte de partage", () => {
  it("valeurs par défaut : fond Corpus, story, tout affiché", () => {
    expect(parseCardOptions(new URLSearchParams())).toEqual({
      layout: "fond",
      format: "story",
      comment: "",
      showDuration: true,
      showCalories: true,
      showPerformance: true,
      intensity: 0,
      satisfaction: 0,
    });
  });

  it("aller-retour cardQuery -> parseCardOptions", () => {
    const o = {
      layout: "photo" as const,
      format: "post" as const,
      comment: "Nouveau PR au squat 💪",
      showDuration: true,
      showCalories: false,
      showPerformance: false,
      intensity: 4,
      satisfaction: 5,
    };
    expect(parseCardOptions(new URLSearchParams(cardQuery(o)))).toEqual(o);
  });

  it("valeurs inconnues ramenées aux défauts", () => {
    const o = parseCardOptions(new URLSearchParams("style=autre&format=carre&hide=xyz"));
    expect(o.layout).toBe("fond");
    expect(o.format).toBe("story");
    expect(o.showDuration && o.showCalories && o.showPerformance).toBe(true);
  });

  it("commentaire : espaces normalisés et coupé sans casser un emoji", () => {
    expect(cleanComment("  Grosse   séance\n\nmerci coach  ")).toBe("Grosse séance merci coach");
    const long = "💪".repeat(COMMENT_MAX + 10);
    const out = cleanComment(long);
    expect(Array.from(out)).toHaveLength(COMMENT_MAX);
    expect(out).toBe("💪".repeat(COMMENT_MAX));
  });
});

describe("jauges intensité / satisfaction", () => {
  it("seuls les entiers 1 à 5 sont gardés", () => {
    expect(["1", "5", "3"].map(parseRating)).toEqual([1, 5, 3]);
    expect(["0", "6", "2.5", "abc", "", null].map(parseRating)).toEqual([0, 0, 0, 0, 0, 0]);
  });
  it("non renseignée -> absente de l'URL", () => {
    const q = cardQuery({ ...parseCardOptions(new URLSearchParams()), intensity: 0, satisfaction: 2 });
    expect(q).not.toContain("int=");
    expect(q).toContain("sat=2");
  });
  it("5 libellés par jauge, extrêmes conformes", () => {
    expect(RATING_SCALE.intensity.levels[0]).toBe("Facile");
    expect(RATING_SCALE.intensity.levels[4]).toBe("Très intense");
    expect(RATING_SCALE.satisfaction.levels[4]).toContain("PR");
  });
});

describe("réseaux proposés", () => {
  it("chaque réseau a une page web de repli", () => {
    for (const t of SHARE_TARGETS) expect(t.webUrl("")).toMatch(/^https:\/\//);
  });
  it("le texte est encodé dans l'URL quand le réseau l'accepte", () => {
    const x = SHARE_TARGETS.find((t) => t.id === "x")!;
    expect(x.webUrl("Séance & PR")).toBe("https://x.com/compose/post?text=S%C3%A9ance%20%26%20PR");
  });
});
