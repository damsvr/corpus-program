import { describe, expect, it } from "vitest";
import { extractLevels } from "@/lib/levels";

const e = (notation: string | null, charge: string | null = null, repos: string | null = null) => ({ notation, charge, repos });

describe("extractLevels", () => {
  it("N3 / N2 / N1 séparés par des barres dans la notation", () => {
    const r = extractLevels(e("N3 : 5 strict / N2 : 5 élastique / N1 : 8 ring row"), null)!;
    expect(r.levels).toEqual([
      { n: 3, text: "5 strict" },
      { n: 2, text: "5 élastique" },
      { n: 1, text: "8 ring row" },
    ]);
    expect(r.ex.notation).toBeNull();
  });
  it("garde le préambule (séries communes) et la charge", () => {
    const r = extractLevels(e("4× — N3 : 5 pull-up strict ; N2 : 6 banded ; N1 : 8 ring row", "BW"), null)!;
    expect(r.ex.notation).toBe("4×");
    expect(r.ex.charge).toBe("BW");
    expect(r.levels.map((l) => l.n)).toEqual([3, 2, 1]);
  });
  it("niveaux dans la note, avec « Niveaux : » en tête", () => {
    const r = extractLevels(e("5×5", "70% TM"), "Niveaux : N3 = barre 70% TM, N2 = haltères 2×20 kg, N1 = goblet 24 kg")!;
    expect(r.note).toBeNull();
    expect(r.ex.notation).toBe("5×5");
    expect(r.levels).toEqual([
      { n: 3, text: "barre 70% TM" },
      { n: 2, text: "haltères 2×20 kg" },
      { n: 1, text: "goblet 24 kg" },
    ]);
  });
  it("niveaux répartis entre notation et note, entre parenthèses", () => {
    const r = extractLevels(e("N3 : 10"), "Si trop dur (N2 : 8 sur banc, N1 : 6 genoux)")!;
    expect(r.levels.map((l) => [l.n, l.text])).toEqual([
      [3, "10"],
      [2, "8 sur banc"],
      [1, "6 genoux"],
    ]);
    expect(r.note).toBe("Si trop dur");
  });
  it("ignore un N isolé ou une simple mention", () => {
    expect(extractLevels(e("5×5"), "Garder N1 comme repère")).toBeNull();
    expect(extractLevels(e("5×5"), "Rameur 2K N2")).toBeNull();
    expect(extractLevels(e("3×8"), null)).toBeNull();
  });
});
