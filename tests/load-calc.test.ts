import { describe, expect, it } from "vitest";
import { hasPrLift, isPercentCharge, personalizeCharge, type PrValues } from "@/lib/load-calc";

const prs: PrValues = {
  arracheKg: 80,
  epauleJeteKg: 100,
  backSquatKg: 140,
  frontSquatKg: 110,
  souleveDeTerreKg: 180,
  developpeCoucheKg: 100,
  developpeMilitaireKg: 60,
  poidsDeCorpsKg: 80,
};

describe("personalizeCharge", () => {
  it("convertit un % TM d'après le mouvement", () => {
    expect(personalizeCharge("Snatch", "75% TM", prs).text).toBe("75% TM ≈ 60 kg");
    expect(personalizeCharge("Back squat — tempo 30X1", "70% TM", prs).text).toBe("70% TM ≈ 98 kg");
    expect(personalizeCharge("Deadlift", "55-60% TM SDT", prs).text).toBe("55-60% TM SDT ≈ 99–108 kg");
  });

  it("préfère la précision du coach (TM C&J, TM développé militaire) au nom du mouvement", () => {
    expect(personalizeCharge("Clean pull", "80-90% TM C&J", prs).text).toBe("80-90% TM C&J ≈ 80–90 kg");
    expect(personalizeCharge("Shoulder press", "55% TM développé militaire", prs).text).toBe("55% TM développé militaire ≈ 33 kg");
  });

  it("convertit les % PDC avec le poids de corps", () => {
    expect(personalizeCharge("Bench press", "~65-70% PDC", prs).text).toBe("~65-70% PDC ≈ 52–56 kg");
  });

  it("traite chaque variante RX / scaled", () => {
    expect(personalizeCharge("Shoulder to overhead", "50% TM C&J (RX) / 35-40% TM C&J (scaled)", prs).text).toBe(
      "50% TM C&J ≈ 50 kg (RX) / 35-40% TM C&J ≈ 35–40 kg (scaled)",
    );
  });

  it("n'invente rien sans PR ou sans mouvement reconnu", () => {
    const none = { ...prs, arracheKg: null };
    expect(personalizeCharge("Snatch", "75% TM", none)).toEqual({ text: "75% TM", unresolved: true });
    expect(personalizeCharge("Snatch", "75% TM", null).unresolved).toBe(true);
    expect(personalizeCharge("Rameur", "70% TM", prs).unresolved).toBe(true);
    expect(personalizeCharge("Pallof press", "70% TM", prs).unresolved).toBe(true);
  });

  it("laisse les charges qualitatives ou en kg telles quelles", () => {
    expect(personalizeCharge("KB swing", "24 kg (RX) / 16 kg (scaled)", prs)).toEqual({
      text: "24 kg (RX) / 16 kg (scaled)",
      unresolved: false,
    });
    expect(personalizeCharge("Back squat", "modérée (RPE 6-7)", prs).text).toBe("modérée (RPE 6-7)");
    expect(personalizeCharge("Back squat", null, prs).text).toBe("");
  });
});

describe("hasPrLift / isPercentCharge", () => {
  it("reconnaît les mouvements barre avec PR", () => {
    expect(hasPrLift("Back squat — tempo 30X1")).toBe(true);
    expect(hasPrLift("Snatch pull")).toBe(true);
    expect(hasPrLift("Bulgarian split squat")).toBe(false);
    expect(hasPrLift("Pallof press")).toBe(false);
    expect(hasPrLift("KB swing")).toBe(false);
  });
  it("détecte les charges en %", () => {
    expect(isPercentCharge("70% TM")).toBe(true);
    expect(isPercentCharge("légère")).toBe(false);
  });
});
