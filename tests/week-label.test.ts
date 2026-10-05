import { describe, expect, it } from "vitest";
import { compareWeeks, weekLabel } from "@/lib/week-label";

describe("weekLabel / compareWeeks", () => {
  it("libellé issu du contenu, pas du rang d'import", () => {
    expect(weekLabel({ blocNumero: 1, semaineDansBloc: 2 })).toBe("Bloc 1 · S2");
  });

  it("une semaine 2 importée avant la semaine 1 reste classée après", () => {
    const imported = [
      { numero: 1, blocNumero: 1, semaineDansBloc: 2 },
      { numero: 2, blocNumero: 1, semaineDansBloc: 1 },
    ];
    expect([...imported].sort(compareWeeks).map((w) => w.semaineDansBloc)).toEqual([1, 2]);
  });

  it("le bloc prime sur la semaine", () => {
    expect(compareWeeks({ blocNumero: 2, semaineDansBloc: 1 }, { blocNumero: 1, semaineDansBloc: 5 })).toBeGreaterThan(0);
  });
});
