import { describe, expect, it } from "vitest";
import { applyVariant, hasVariants } from "@/lib/variants";

const e = (nom: string, notation: string | null = null, charge: string | null = null, repos: string | null = null) => ({
  nom,
  notation,
  charge,
  repos,
});

describe("variantes RX / scaled", () => {
  it("sépare le nom", () => {
    const x = e("HSPU (RX) / Pike push-up pieds sur banc (scaled)", "30");
    expect(applyVariant(x, "rx").nom).toBe("HSPU");
    expect(applyVariant(x, "scaled").nom).toBe("Pike push-up pieds sur banc");
    expect(hasVariants(x)).toBe(true);
  });
  it("accepte « ou » et plusieurs mots", () => {
    const x = e("Wall walk (RX) ou plank walk-up / incline wall walk (Scaled)");
    expect(applyVariant(x, "scaled").nom).toBe("plank walk-up / incline wall walk");
  });
  it("sépare notation, charge et repos", () => {
    const x = e("Push-up", "15 (RX) / 10 (scaled)", "24 kg (RX) / 16 kg (scaled)");
    expect(applyVariant(x, "rx")).toMatchObject({ notation: "15", charge: "24 kg" });
    expect(applyVariant(x, "scaled")).toMatchObject({ notation: "10", charge: "16 kg" });
  });
  it("ne touche pas ce qui n'a pas de variante", () => {
    const x = e("Back squat", "5×5", "70% TM");
    expect(hasVariants(x)).toBe(false);
    expect(applyVariant(x, "scaled")).toEqual(x);
  });
});
