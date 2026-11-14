import { describe, expect, it } from "vitest";
import { isOptionalBloc, normalizeSessionsPerWeek, shortVersionSavings, skippableDayId } from "@/lib/session-plan";

describe("session-plan", () => {
  it("reconnaît les sections optionnelles (marque ou nom)", () => {
    expect(isOptionalBloc({ nom: "BLOC C", optionnel: true })).toBe(true);
    expect(isOptionalBloc({ nom: "COMPLÉMENTAIRE (8')", optionnel: false })).toBe(true);
    expect(isOptionalBloc({ nom: "Bloc A — Force", optionnel: false })).toBe(false);
  });
  it("somme le temps gagné en version courte", () => {
    expect(
      shortVersionSavings([
        { nom: "Bloc A", optionnel: false, dureeMin: "20" },
        { nom: "COMPLÉMENTAIRE", optionnel: false, dureeMin: "8" },
        { nom: "Finisher", optionnel: true, dureeMin: "6-7" },
      ]),
    ).toBe(15);
  });
  it("normalise le nombre de séances", () => {
    expect(normalizeSessionsPerWeek(3)).toBe(3);
    expect(normalizeSessionsPerWeek(7)).toBe(4);
    expect(normalizeSessionsPerWeek(null)).toBe(4);
  });
  it("désigne la séance sautable : marquée, sinon la dernière", () => {
    const d = (id: string, jour: number, optionnel = false, jourType = "ENTRAINEMENT") => ({ id, jour, jourType, optionnel });
    const four = [d("a", 1), d("b", 2), d("c", 3), d("d", 4)];
    expect(skippableDayId(four)).toBe("d");
    expect(skippableDayId([d("a", 1), d("b", 2, true), d("c", 3), d("d", 4), d("t", 5, false, "TAMPON")])).toBe("b");
    expect(skippableDayId([d("a", 1), d("b", 2), d("c", 3)])).toBeNull();
  });
});
