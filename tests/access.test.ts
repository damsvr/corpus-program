import { describe, expect, it } from "vitest";
import { endOfDay, isCycleOver, isLinkOpen, newAccessCode } from "@/lib/access";
import { csvRow } from "@/lib/contact";

describe("lien d'accès gratuit", () => {
  const endsAt = endOfDay("2026-12-13")!;

  it("inclut le jour de fin entier", () => {
    expect(endsAt.toISOString()).toBe("2026-12-13T23:59:59.999Z");
    expect(isCycleOver({ endsAt }, new Date("2026-12-13T20:00:00Z"))).toBe(false);
    expect(isCycleOver({ endsAt }, new Date("2026-12-14T00:00:00Z"))).toBe(true);
  });

  it("refuse une date mal formée", () => {
    expect(endOfDay("13/12/2026")).toBeNull();
    expect(endOfDay("2026-13-40")).toBeNull();
  });

  it("n'accepte des inscriptions que s'il est actif et avant la fin", () => {
    const before = new Date("2026-11-01T10:00:00Z");
    expect(isLinkOpen({ active: true, endsAt }, before)).toBe(true);
    expect(isLinkOpen({ active: false, endsAt }, before)).toBe(false);
    expect(isLinkOpen({ active: true, endsAt }, new Date("2026-12-15T00:00:00Z"))).toBe(false);
  });

  it("génère un code préfixé et difficile à deviner", () => {
    const a = newAccessCode("tyrun");
    expect(a).toMatch(/^tyrun-[0-9a-f]{8}$/);
    expect(newAccessCode("tyrun")).not.toBe(a);
  });
});

describe("export des contacts", () => {
  it("échappe les guillemets et sépare par « ; »", () => {
    expect(csvRow(['Léa "La Fusée"', "lea@x.fr", null])).toBe('"Léa ""La Fusée""";"lea@x.fr";""');
  });
});
