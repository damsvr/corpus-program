import { describe, expect, it } from "vitest";
import { restGroups } from "@/lib/rest-plan";

const ex = (nom: string, repos: string | null) => ({ nom, repos });

describe("restGroups", () => {
  it("chaque exercice est son propre groupe par défaut", () => {
    const g = restGroups([ex("A", "R 60''"), ex("B", "R 90''"), ex("C", null)]);
    expect(g.map((x) => x.map((e) => e.nom))).toEqual([["A"], ["B"], ["C"]]);
  });

  it("un exercice « en superset avec … » rejoint le précédent (Hybrid, bloc A squat)", () => {
    const g = restGroups([ex("Box squat", "R 2'"), ex("Hollow hold", "en superset avec le squat")]);
    expect(g.map((x) => x.map((e) => e.nom))).toEqual([["Box squat", "Hollow hold"]]);
  });

  it("un superset en premier exercice reste un groupe seul", () => {
    expect(restGroups([ex("A", "superset")]).length).toBe(1);
    expect(restGroups([])).toEqual([]);
  });
});
