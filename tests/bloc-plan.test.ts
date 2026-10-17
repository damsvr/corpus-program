import { describe, expect, it } from "vitest";
import { planBloc } from "@/lib/bloc-plan";

const ex = (sets: number, repos: string | null = null) => ({ sets, repos });

describe("planBloc", () => {
  it("« N rounds, Every X:XX » -> interval, tous mouvements à chaque round", () => {
    expect(planBloc("4 rounds, Every 3:00 (12') — score = qualité d'exécution", [ex(1), ex(1), ex(1)])).toEqual({
      kind: "interval",
      total: 4,
      roundSeconds: 180,
    });
  });

  it("EMOM non-WOD -> interval 60 s", () => {
    expect(planBloc("EMOM 14' (14 rounds, alternée)", [ex(1), ex(1)])).toEqual({ kind: "interval", total: 14, roundSeconds: 60 });
  });

  it("un mouvement 5×5 avec repos -> sets", () => {
    expect(planBloc(null, [ex(5, "R 2'")])).toEqual({ kind: "sets", total: 5, restSeconds: 120 });
  });

  it("squat + hollow hold en superset -> un seul enchaînement de 5 séries", () => {
    expect(planBloc(null, [ex(5, "R 2'"), ex(5, "en superset avec le squat")])).toEqual({
      kind: "sets",
      total: 5,
      restSeconds: 120,
    });
  });

  it("séries sans repos -> sets sans repos automatique", () => {
    expect(planBloc(null, [ex(3)])).toEqual({ kind: "sets", total: 3, restSeconds: null });
  });

  it("mouvements indépendants (montée en charge, séries mixtes) -> sequence", () => {
    expect(planBloc(null, [ex(1), ex(1), ex(1, "R 60''")])).toEqual({ kind: "sequence" });
    expect(planBloc(null, [ex(3, "R 60''"), ex(1, "R 90''"), ex(3, "R 90''"), ex(2, "R 60''")])).toEqual({ kind: "sequence" });
  });

  it("un seul mouvement à une série -> sequence", () => {
    expect(planBloc(null, [ex(1)])).toEqual({ kind: "sequence" });
  });
});
