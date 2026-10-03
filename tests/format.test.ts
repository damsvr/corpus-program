import { describe, expect, it } from "vitest";
import {
  classifyBloc,
  isInformationalBloc,
  isMobiliteBloc,
  isPerSide,
  parseHoldSeconds,
  parseNotation,
  parseRestSeconds,
} from "@/lib/format";

describe("parseRestSeconds", () => {
  it("secondes (deux apostrophes)", () => {
    expect(parseRestSeconds("R 60''")).toBe(60);
    expect(parseRestSeconds("R 45''")).toBe(45);
    expect(parseRestSeconds("R 90''")).toBe(90);
  });

  it("minutes (une apostrophe)", () => {
    expect(parseRestSeconds("R 2'")).toBe(120);
    expect(parseRestSeconds("R 3'")).toBe(180);
  });

  it("plage — moyenne", () => {
    expect(parseRestSeconds("R 2-3'")).toBe(150);
    expect(parseRestSeconds("R 3-4'")).toBe(210);
  });

  it("null si absent ou non parseable", () => {
    expect(parseRestSeconds(undefined)).toBeNull();
    expect(parseRestSeconds(null)).toBeNull();
    expect(parseRestSeconds("")).toBeNull();
    expect(parseRestSeconds("même barre")).toBeNull();
  });
});

describe("isInformationalBloc", () => {
  it("détecte échauffement et mobilité, accents et casse indifférents", () => {
    expect(isInformationalBloc("ÉCHAUFFEMENT DYNAMIQUE")).toBe(true);
    expect(isInformationalBloc("Échauffement progressif")).toBe(true);
    expect(isInformationalBloc("MOBILITÉ CIBLÉE")).toBe(true);
    expect(isInformationalBloc("mobilite ciblee")).toBe(true);
  });

  it("détecte la préparation ciblée (modules Functional)", () => {
    expect(isInformationalBloc("PRÉPARATION CIBLÉE — CHARGE")).toBe(true);
  });

  it("ne détecte pas les blocs de travail", () => {
    expect(isInformationalBloc("MONTÉE EN CHARGE")).toBe(false);
    expect(isInformationalBloc("BLOC A — BACK SQUAT, MOUVEMENT PRINCIPAL")).toBe(false);
    expect(isInformationalBloc("WOD — CORPUS 130319")).toBe(false);
    expect(isInformationalBloc("COMPLÉMENTAIRE")).toBe(false);
    expect(isInformationalBloc("ACTIVATION")).toBe(false);
  });
});

describe("isMobiliteBloc / classifyBloc", () => {
  it("mobilité pure -> mobilite", () => {
    expect(isMobiliteBloc("MOBILITÉ CIBLÉE")).toBe(true);
    expect(classifyBloc("MOBILITÉ CIBLÉE", false)).toBe("mobilite");
  });

  it("échauffement + mobilité combinés -> échauffement (chrono global)", () => {
    expect(isMobiliteBloc("ÉCHAUFFEMENT GÉNÉRAL & MOBILITÉ")).toBe(false);
    expect(classifyBloc("ÉCHAUFFEMENT GÉNÉRAL & MOBILITÉ", false)).toBe("echauffement");
  });

  it("préparation ciblée -> échauffement (chrono global)", () => {
    expect(classifyBloc("PRÉPARATION CIBLÉE — CHARGE", false)).toBe("echauffement");
  });

  it("bloc WOD -> wod, même si le nom contiendrait échauffement/mobilité", () => {
    expect(classifyBloc("WOD — CORPUS FF J1", true)).toBe("wod");
    expect(classifyBloc("MOBILITÉ CIBLÉE", true)).toBe("wod");
  });

  it("bloc de travail -> travail", () => {
    expect(classifyBloc("BLOC A — BACK SQUAT, MOUVEMENT PRINCIPAL", false)).toBe("travail");
    expect(classifyBloc("MONTÉE EN CHARGE", false)).toBe("travail");
  });
});

describe("parseHoldSeconds", () => {
  it("secondes et minutes", () => {
    expect(parseHoldSeconds("30''")).toBe(30);
    expect(parseHoldSeconds("20''/côté")).toBe(20);
    expect(parseHoldSeconds("45 s")).toBe(45);
    expect(parseHoldSeconds("2'")).toBe(120);
    expect(parseHoldSeconds("3 min")).toBe(180);
    expect(parseHoldSeconds("20-30''")).toBe(25);
  });

  it("jamais une distance ni des répétitions", () => {
    for (const v of ["20m", "15 m/côté", "25 m — min paires (7 rounds)", "1000 m", "500m/round", "8m aller-retour", "10", "8/côté", "3 sets", "3-6-9-12 (paliers)", "AMRAP temps restant", ""]) {
      expect(parseHoldSeconds(v)).toBeNull();
    }
    expect(parseHoldSeconds(null)).toBeNull();
  });
});

describe("isPerSide", () => {
  it("détecte /côté, /jambe, /bras", () => {
    expect(isPerSide("30''/côté")).toBe(true);
    expect(isPerSide("8/jambe")).toBe(true);
    expect(isPerSide("20''")).toBe(false);
    expect(isPerSide("")).toBe(false);
  });
});

describe("parseNotation", () => {
  it("N×M, bare number, N sets", () => {
    expect(parseNotation("5×5")).toEqual({ sets: 5, reps: "5" });
    expect(parseNotation("2×20''")).toEqual({ sets: 2, reps: "20''" });
    expect(parseNotation("12")).toEqual({ sets: 1, reps: "12" });
    expect(parseNotation("3 sets")).toEqual({ sets: 3, reps: "" });
    expect(parseNotation("4 séries")).toEqual({ sets: 4, reps: "" });
    expect(parseNotation(null)).toEqual({ sets: 1, reps: "" });
  });
});
