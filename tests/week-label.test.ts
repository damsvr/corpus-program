import { describe, expect, it } from "vitest";
import { compareWeeks, currentWeekNumero, formatRange, parseMonday, weekLabel, weekStart, weekTitle } from "@/lib/week-label";

const start = new Date("2027-01-04T00:00:00Z"); // lundi

describe("week-label", () => {
  it("libellé et ordre par cycle puis semaine", () => {
    expect(weekLabel({ blocNumero: 3, semaineDansBloc: 1 })).toBe("Cycle 3 · S1");
    const w = [{ blocNumero: 2, semaineDansBloc: 1 }, { blocNumero: 1, semaineDansBloc: 6 }, { blocNumero: 1, semaineDansBloc: 2 }];
    expect(w.sort(compareWeeks).map(weekLabel)).toEqual(["Cycle 1 · S2", "Cycle 1 · S6", "Cycle 2 · S1"]);
  });
  it("calcule les dates d'une semaine de calendrier", () => {
    expect(formatRange(weekStart(start, 1))).toBe("04/01/27 au 10/01/27");
    expect(formatRange(weekStart(start, 3))).toBe("18/01/27 au 24/01/27");
    expect(formatRange(start, true)).toBe("04/01 → 10/01/27");
    expect(weekTitle({ blocNumero: 3, semaineDansBloc: 1 }, start)).toBe("Cycle 3 · Semaine 1 · 04/01/27 au 10/01/27");
    expect(weekTitle({ blocNumero: 3, semaineDansBloc: 1 })).toBe("Cycle 3 · Semaine 1");
  });
  it("traverse bien le changement d'heure et d'année", () => {
    expect(formatRange(weekStart(new Date("2026-12-28T00:00:00Z"), 2))).toBe("04/01/27 au 10/01/27");
    expect(formatRange(weekStart(new Date("2027-03-22T00:00:00Z"), 2))).toBe("29/03/27 au 04/04/27");
  });
  it("trouve la semaine en cours d'après le calendrier", () => {
    const weeks = [
      { numero: 1, blocNumero: 3, semaineDansBloc: 1 },
      { numero: 2, blocNumero: 3, semaineDansBloc: 2 },
      { numero: 3, blocNumero: 4, semaineDansBloc: 1 },
    ];
    const starts = new Map([[3, start]]);
    expect(currentWeekNumero(weeks, starts, new Date(2027, 0, 12, 18, 30))).toBe(2);
    expect(currentWeekNumero(weeks, starts, new Date(2027, 0, 10, 23, 59))).toBe(1);
    expect(currentWeekNumero(weeks, starts, new Date(2027, 1, 20))).toBeNull();
    expect(currentWeekNumero(weeks, new Map(), new Date(2027, 0, 5))).toBeNull();
  });
  it("n'accepte qu'un lundi", () => {
    expect(parseMonday("2027-01-04")?.toISOString()).toBe("2027-01-04T00:00:00.000Z");
    expect(parseMonday("2027-01-05")).toBeNull();
    expect(parseMonday("04/01/2027")).toBeNull();
    expect(parseMonday("2027-02-30")).toBeNull();
  });
});
