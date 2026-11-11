import { describe, expect, it } from "vitest";
import { blocMeta, movementGroups, prescription, splitBlocName, splitMovement } from "@/lib/bloc-view";

describe("splitBlocName", () => {
  it("BLOC A / WOD -> étiquette + titre", () => {
    expect(splitBlocName("BLOC A — SQUAT, MOUVEMENT PRINCIPAL")).toEqual({ eyebrow: "BLOC A", title: "SQUAT, MOUVEMENT PRINCIPAL", subtitle: null });
    expect(splitBlocName("WOD — CORPUS GAMES-B ADAPTÉ")).toEqual({ eyebrow: "WOD", title: "CORPUS GAMES-B ADAPTÉ", subtitle: null });
  });
  it("les autres blocs gardent leur nom en titre, la précision en sous-titre", () => {
    expect(splitBlocName("MOBILITÉ CIBLÉE — hanche/cheville")).toEqual({ eyebrow: null, title: "MOBILITÉ CIBLÉE", subtitle: "hanche/cheville" });
    expect(splitBlocName("BLOC ÉQUILIBRE — PECTORAUX")).toEqual({ eyebrow: null, title: "BLOC ÉQUILIBRE", subtitle: "PECTORAUX" });
  });
  it("sans tiret", () => {
    expect(splitBlocName("COMPLÉMENTAIRE")).toEqual({ eyebrow: null, title: "COMPLÉMENTAIRE", subtitle: null });
  });
});

describe("blocMeta", () => {
  const ex = (notation: string | null, repos: string | null = null) => ({ notation, repos });
  it("rounds en intervalles", () => {
    expect(blocMeta({ dureeMin: "12", formatEntete: "4 rounds, Every 3:00 (12')", isWod: false, exercices: [ex("12")] })).toEqual(["12 min", "4 rounds · toutes les 03:00"]);
  });
  it("N séries d'un mouvement", () => {
    expect(blocMeta({ dureeMin: "18", formatEntete: null, isWod: false, exercices: [ex("5×5", "R 2'")] })).toEqual(["18 min", "5 séries"]);
  });
  it("mouvements indépendants : durée seule ; durée bruitée ignorée", () => {
    expect(blocMeta({ dureeMin: "6", formatEntete: null, isWod: false, exercices: [ex("1×8"), ex("1×5")] })).toEqual(["6 min"]);
    expect(blocMeta({ dureeMin: "8-10 (HORS BUDGET)", formatEntete: null, isWod: false, exercices: [ex("12")] })).toEqual(["8-10 min"]);
    expect(blocMeta({ dureeMin: null, formatEntete: null, isWod: false, exercices: [ex("12")] })).toEqual([]);
  });
  it("WOD : format lisible", () => {
    const w = (f: string) => blocMeta({ dureeMin: "13", formatEntete: f, isWod: true, exercices: [] });
    expect(w("AMRAP 13' — score = rounds + reps")).toEqual(["13 min", "AMRAP 13 min"]);
    expect(w("Ladder for time, cap 10'")).toEqual(["13 min", "For time · cap 10 min"]);
    expect(w("EMOM 14' (14 rounds)")).toEqual(["13 min", "EMOM 14 min"]);
    expect(w("Every 2:00 x 6 rounds (12')")).toEqual(["13 min", "6 rounds · toutes les 02:00"]);
  });
});

describe("splitMovement / prescription", () => {
  it("nom en titre, précisions en détail", () => {
    expect(splitMovement("Box squat — tempo 30X1, amplitude à la hauteur de box")).toEqual({ title: "Box squat", detail: "tempo 30X1, amplitude à la hauteur de box" });
    expect(splitMovement("Toes-to-bar (RX) / Tempo hanging knee raise (scaled)").title).toBe("Toes-to-bar");
    expect(splitMovement("Wall sit")).toEqual({ title: "Wall sit", detail: null });
  });
  it("sans le multiplicateur de séries", () => {
    expect(prescription({ notation: "5×5", charge: "70% TM", repos: "R 2'" })).toBe("5 · 70% TM · R 2'");
    expect(prescription({ notation: "8/jambe", charge: null, repos: null })).toBe("8/jambe");
    expect(prescription({ notation: "5×30''", charge: null, repos: "en superset avec le squat" })).toBe("30''");
    expect(prescription({ notation: "2×10", charge: null, repos: null }, { keepSets: true })).toBe("2×10");
  });
});

describe("movementGroups", () => {
  const ex = (nom: string, notation: string | null, repos: string | null = null) => ({ nom, notation, repos });
  it("rounds : un circuit avec tous les mouvements", () => {
    const g = movementGroups("4 rounds, Every 3:00 (12')", [ex("A", "12"), ex("B", "8"), ex("C", "15")]);
    expect(g).toHaveLength(1);
    expect(g[0].label).toBe("Circuit · 4 rounds");
    expect(g[0].items).toHaveLength(3);
  });
  it("squat + hollow hold en superset", () => {
    const g = movementGroups(null, [ex("Squat", "5×5", "R 2'"), ex("Hollow", "5×30''", "en superset avec le squat")]);
    expect(g.map((x) => x.label)).toEqual(["Superset · 5 séries"]);
  });
  it("mouvements indépendants : un groupe chacun, sans libellé ; WOD jamais regroupé", () => {
    expect(movementGroups(null, [ex("A", "1×8"), ex("B", "1×5")]).map((x) => x.label)).toEqual([null, null]);
    expect(movementGroups("AMRAP 13'", [ex("A", "10"), ex("B", "10")], true)).toHaveLength(1);
  });
});
