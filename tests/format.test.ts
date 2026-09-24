import { describe, expect, it } from "vitest";
import { isInformationalBloc, parseRestSeconds } from "@/lib/format";

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
