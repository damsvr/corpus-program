import { describe, expect, it } from "vitest";
import { extractScoreHint, formatClock, parseWodFormat, resolveBlocRounds } from "@/lib/wod-format";

describe("parseWodFormat — EMOM", () => {
  it("EMOM avec rounds explicites entre parenthèses", () => {
    expect(
      parseWodFormat(
        "EMOM 14' (14 rounds, alternée) — min impaire : complexe 2 hang power clean + 2 push press, min paire : D-ball bearhug carry",
      ),
    ).toEqual({ kind: "emom", totalSeconds: 840, roundSeconds: 60, totalRounds: 14 });
  });
});

describe("parseWodFormat — intervalles (Every X:XX)", () => {
  it("ordre « Every X:XX x N rounds »", () => {
    expect(
      parseWodFormat(
        "Every 3:30 x 4 rounds (14') — dans chaque fenêtre : 5 shoulder press + 10 deadlift + 12 box jump — le reste du temps = récupération — score = temps pour compléter chaque ronde",
      ),
    ).toEqual({ kind: "interval", roundSeconds: 210, totalRounds: 4, totalSeconds: 840 });
  });

  it("ordre « N rounds, Every X:XX »", () => {
    expect(parseWodFormat("4 rounds, Every 3:00 (12') — score = qualité d'exécution, pas la vitesse")).toEqual({
      kind: "interval",
      roundSeconds: 180,
      totalRounds: 4,
      totalSeconds: 720,
    });
  });

  it("Every 2:00 x 6 rounds (Functional)", () => {
    expect(
      parseWodFormat(
        "Every 2:00 x 6 rounds (12') — le reste du 2:00 = récupération, jamais de sprint ; rounds impairs = suitcase deadlift, rounds pairs = chop to lift",
      ),
    ).toEqual({ kind: "interval", roundSeconds: 120, totalRounds: 6, totalSeconds: 720 });
  });

  it("Every 1:30 x 8 rounds", () => {
    expect(
      parseWodFormat(
        "Every 1:30 x 8 rounds (12') — contraste tension/vitesse : rounds impairs = explosif, rounds pairs = isométrique/contrôle",
      ),
    ).toEqual({ kind: "interval", roundSeconds: 90, totalRounds: 8, totalSeconds: 720 });
  });
});

describe("parseWodFormat — AMRAP", () => {
  it("AMRAP simple", () => {
    expect(parseWodFormat("AMRAP 13' — score = rounds + reps")).toEqual({ kind: "amrap", totalSeconds: 780 });
  });

  it("AMRAP précédé d'un texte de repos (Hybrid partie 2)", () => {
    expect(
      parseWodFormat("R 2' après la partie 1, puis AMRAP 12' — score = reps totales cumulées sur les deux AMRAP (≈27' au total)."),
    ).toEqual({ kind: "amrap", totalSeconds: 720 });
  });
});

describe("parseWodFormat — for time (avec ou sans cap)", () => {
  it("Chipper, for time, cap", () => {
    expect(
      parseWodFormat(
        "Chipper, for time, cap 40' — allure soutenable du début à la fin, jamais un sprint — score = temps total (ou distance/reps restantes si cap atteint)",
      ),
    ).toEqual({ kind: "fortime", capSeconds: 2400 });
  });

  it("Ladder for time, cap", () => {
    expect(
      parseWodFormat("Ladder for time, cap 14' — 4 paliers (3-6-9-12 reps), charge du sandbag croissante à chaque palier — score = temps total (DNF = 14')."),
    ).toEqual({ kind: "fortime", capSeconds: 840 });
  });

  it("Séquence ascendante (ladder), for time, cap", () => {
    expect(
      parseWodFormat("Séquence ascendante (ladder), for time, cap 10' — score = reps totales complétées avant la fin du temps"),
    ).toEqual({ kind: "fortime", capSeconds: 600 });
  });

  it("N rounds for time, cap", () => {
    expect(
      parseWodFormat("3 rounds for time, cap 40' — chipper répété, volume réduit par round — score = temps total (DNF = 40')."),
    ).toEqual({ kind: "fortime", capSeconds: 2400 });
  });

  it("For time, cap — préfixe simple", () => {
    expect(
      parseWodFormat("For time, cap 16' — 4 rounds : sled push lourd + KB swing explosif + sandbag squat — score = temps total ou rounds+reps si cap atteint."),
    ).toEqual({ kind: "fortime", capSeconds: 960 });
  });
});

describe("parseWodFormat — cas limites", () => {
  it("vide ou absent -> unknown", () => {
    expect(parseWodFormat(null)).toEqual({ kind: "unknown" });
    expect(parseWodFormat(undefined)).toEqual({ kind: "unknown" });
    expect(parseWodFormat("")).toEqual({ kind: "unknown" });
  });

  it("format non reconnu -> unknown (repli chronomètre)", () => {
    expect(parseWodFormat("Format libre, à l'appréciation du coach")).toEqual({ kind: "unknown" });
  });
});

describe("extractScoreHint", () => {
  it("extrait le texte après « score = »", () => {
    expect(extractScoreHint("AMRAP 13' — score = rounds + reps")).toBe("rounds + reps");
    expect(extractScoreHint("Chipper, for time, cap 40' - score = temps total")).toBe("temps total");
  });

  it("null si absent", () => {
    expect(extractScoreHint("EMOM 14' (14 rounds)")).toBeNull();
    expect(extractScoreHint(null)).toBeNull();
  });
});

describe("resolveBlocRounds", () => {
  it("bloc en rounds (« N rounds, Every X:XX ») -> totalRounds + repos = durée du round", () => {
    expect(resolveBlocRounds("4 rounds, Every 3:00 (12') — score = qualité d'exécution")).toEqual({
      totalRounds: 4,
      restSeconds: 180,
    });
  });

  it("bloc EMOM non-WOD -> totalRounds + repos = 60s", () => {
    expect(
      resolveBlocRounds(
        "EMOM 14' (14 rounds, alternée) — min impaire : complexe 2 hang power clean + 2 push press, min paire : D-ball bearhug carry",
      ),
    ).toEqual({ totalRounds: 14, restSeconds: 60 });
  });

  it("pas de structure en rounds (AMRAP, for time, absent, non reconnu) -> totalRounds 0", () => {
    expect(resolveBlocRounds("AMRAP 13' — score = rounds + reps")).toEqual({ totalRounds: 0, restSeconds: null });
    expect(resolveBlocRounds("For time, cap 16'")).toEqual({ totalRounds: 0, restSeconds: null });
    expect(resolveBlocRounds(null)).toEqual({ totalRounds: 0, restSeconds: null });
    expect(resolveBlocRounds("Format libre, à l'appréciation du coach")).toEqual({ totalRounds: 0, restSeconds: null });
  });
});

describe("formatClock", () => {
  it("formate en MM:SS, jamais négatif", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(840)).toBe("14:00");
    expect(formatClock(-5)).toBe("00:00");
  });
});
