import { describe, expect, it } from "vitest";
import { classifyBloc, isInformationalBloc, isMobiliteBloc, parseRestSeconds } from "@/lib/format";

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
