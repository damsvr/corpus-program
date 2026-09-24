import { describe, expect, it } from "vitest";
import {
  detectPattern,
  estimateCalories,
  formatDuration,
  movementFromTitle,
  performanceLines,
  shortExerciceName,
  summarizeSets,
} from "@/lib/share";

describe("detectPattern — titres réels des JSON importés", () => {
  it("force", () => {
    expect(detectPattern("FORCE ET MUSCULATION — BACK SQUAT")).toBe("force");
    expect(detectPattern("FORCE — SQUAT (BOX SQUAT, AMPLITUDE PROGRESSIVE)")).toBe("force");
    expect(detectPattern("FORCE & STRUCTURE — BACK SQUAT + LOCOMOTION")).toBe("force");
    expect(detectPattern("FORCE-ENDURANCE & IMPLEMENTS — SLED + SANDBAG + KB")).toBe("force");
  });
  it("gym", () => {
    expect(detectPattern("GYMNASTIQUE — CHEST-TO-BAR")).toBe("gym");
    expect(detectPattern("GYMNASTIQUE & HAUT DU CORPS — TIRAGE / POUSSÉE")).toBe("gym");
  });
  it("haltérophilie", () => {
    expect(detectPattern("HALTÉROPHILIE — CLEAN AND JERK")).toBe("halterophilie");
  });
  it("autre", () => {
    expect(detectPattern("ENDURANCE — BIKE ERG")).toBe("autre");
    expect(detectPattern("CARDIO / RACE — CHIPPER VARIÉ")).toBe("autre");
    expect(detectPattern("JOUR TAMPON — MOBILITÉ CHEVILLE")).toBe("autre");
  });
  it("ne se laisse pas tromper par le mouvement après le tiret", () => {
    expect(detectPattern("ENDURANCE — GYMNASTIQUE LÉGÈRE")).toBe("autre");
  });
});

describe("movementFromTitle", () => {
  it("garde le mouvement, sans détail entre parenthèses", () => {
    expect(movementFromTitle("FORCE ET MUSCULATION — BACK SQUAT")).toBe("BACK SQUAT");
    expect(movementFromTitle("FORCE — SQUAT (BOX SQUAT, AMPLITUDE PROGRESSIVE)")).toBe("SQUAT");
  });
});

describe("estimateCalories / formatDuration", () => {
  it("MET × poids × heures, arrondi à 5", () => {
    expect(estimateCalories("force", 60, 80)).toBe(400);
    expect(estimateCalories("autre", 45, 70)).toBe(420);
  });
  it("poids par défaut sans PR de poids de corps", () => {
    expect(estimateCalories("force", 60, null)).toBe(375);
  });
  it("durée lisible", () => {
    expect(formatDuration(48)).toBe("48 min");
    expect(formatDuration(72)).toBe("1h12");
    expect(formatDuration(60)).toBe("1h00");
  });
});

describe("summarizeSets / performanceLines", () => {
  const logs = [
    { nom: "Back squat — barre à vide", sets: [{ kg: 20, reps: 8, done: true }] },
    {
      nom: "Back squat",
      sets: [
        { kg: 100, reps: 5, done: true },
        { kg: 100, reps: 5, done: true },
        { kg: 110, reps: 3, done: false },
      ],
    },
    { nom: "Pull-up", sets: [{ kg: null, reps: 8, done: true }] },
  ];

  it("ne compte que les séries validées", () => {
    const s = summarizeSets(logs);
    expect(s.doneSets).toBe(4);
    expect(s.totalReps).toBe(26);
    expect(s.volumeKg).toBe(1160);
    expect(s.best).toEqual({ nom: "Back squat", kg: 100, reps: 5 });
  });

  it("force : meilleure série + volume, score WOD conservé", () => {
    const lines = performanceLines("force", summarizeSets(logs), "07:45");
    expect(lines.map((l) => l.label)).toEqual(["Meilleure série", "Volume", "Score WOD"]);
    expect(lines[0].value).toBe("Back squat · 100 kg × 5");
  });

  it("gym : répétitions d'abord", () => {
    expect(performanceLines("gym", summarizeSets(logs), null)[0]).toEqual({ label: "Répétitions", value: "26" });
  });

  it("aucune série validée : rien à afficher", () => {
    expect(performanceLines("force", summarizeSets([]), null)).toEqual([]);
  });

  it("raccourcit les noms d'exercice", () => {
    expect(shortExerciceName("Back squat — tempo 30X1")).toBe("Back squat");
    expect(shortExerciceName("Tirage (variante)")).toBe("Tirage");
  });
});
