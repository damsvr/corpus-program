import { describe, expect, it } from "vitest";
import { validateImport, parseDuree } from "@/lib/import-schema";

const ex = (nom: string, extra = {}) => ({ nom, notation: "3×8", ...extra });

function crossfitWeek() {
  const seance = (jour: number, slot: number, titre: string, min: number) => ({
    slot,
    jour,
    jour_type: "entrainement",
    duree_estimee_min: min,
    titre,
    blocs: [
      { nom: "ÉCHAUFFEMENT DYNAMIQUE", duree_min: 10, exercices: [ex("Corde à sauter")] },
      {
        nom: "WOD — TEST",
        type: "wod",
        format_entete: "AMRAP 12' — score = rounds + reps",
        duree_min: 12,
        exercices: [ex("Wall ball"), ex("Row")],
      },
    ],
  });
  return {
    profil: "crossfit",
    bloc: { numero: 2, duree_semaines: 6, structure: "5+1", focus_progression: "charge" },
    semaine: { numero_dans_le_bloc: 3, type: "chargee", duree_totale_min: 309 },
    seances: [
      seance(1, 1, "FORCE — DEADLIFT", 78),
      seance(2, 2, "HALTÉROPHILIE — SNATCH", 86),
      seance(4, 3, "GYMNASTIQUE — PULL", 69),
      seance(5, 4, "ENDURANCE — ROW", 76),
    ],
    controles_anti_monotonie: { enveloppe_temps: "ok" },
  };
}

function functionalWeek() {
  const mod = (module: string, nom: string, duree: number) => ({
    nom,
    module,
    duree_min: duree,
    exercices: [ex("Goblet squat tempo")],
  });
  const jour = (n: number, titre: string) => ({
    slot: n,
    jour: n,
    jour_type: "entrainement",
    duree_estimee_min: 60,
    titre,
    blocs: [mod("charge", "CHARGE", 20), mod("volume", "VOLUME", 20), mod("moteur", "MOTEUR", 20)],
  });
  return {
    profil: "functional",
    bloc: { numero: 1, duree_semaines: 6 },
    semaine: { numero_dans_le_bloc: 1, type: "chargee", duree_totale_min: 300 },
    seances: [
      jour(1, "FORCE & STRUCTURE"),
      jour(2, "PUISSANCE & BALISTIQUE"),
      jour(3, "GYMNASTIQUE & CONTRÔLE"),
      jour(4, "CAPACITÉ DE TRAVAIL"),
      {
        jour: 6,
        jour_type: "tampon",
        duree_estimee_min: 60,
        titre: "JOUR TAMPON — MOBILITÉ ET POINT FAIBLE",
        blocs: [{ nom: "MOBILITÉ", exercices: [ex("90/90")] }],
      },
    ],
    controles_anti_monotonie: { total: "300" },
  };
}

describe("parseDuree", () => {
  it("gère nombres, plages et texte", () => {
    expect(parseDuree(10)).toBe(10);
    expect(parseDuree("6-7")).toBe(6.5);
    expect(parseDuree("12'")).toBe(12);
    expect(parseDuree("abc")).toBeNull();
  });
});

describe("validateImport — cas valides", () => {
  it("accepte une semaine CrossFit valide", () => {
    const r = validateImport(crossfitWeek());
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.warnings).toEqual([]);
  });

  it("accepte une semaine Functional valide (4 jours × 3 modules + tampon)", () => {
    const r = validateImport(functionalWeek());
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.warnings).toEqual([]);
  });
});

describe("validateImport — cas invalides", () => {
  it("rejette un JSON sans controles_anti_monotonie", () => {
    const w: Record<string, unknown> = crossfitWeek();
    delete w.controles_anti_monotonie;
    const r = validateImport(w);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(" ")).toContain("controles_anti_monotonie");
  });

  it("rejette un WOD sans format_entete", () => {
    const w = crossfitWeek();
    delete (w.seances[0].blocs[1] as Record<string, unknown>).format_entete;
    const r = validateImport(w);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(" ")).toContain("format_entete");
  });

  it("rejette une séance de plus de 90 min", () => {
    const w = crossfitWeek();
    w.seances[1].duree_estimee_min = 95;
    const r = validateImport(w);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(" ")).toContain("90");
  });

  it("rejette un exercice sans nom, avec le chemin de l'erreur", () => {
    const w = crossfitWeek();
    w.seances[0].blocs[0].exercices[0].nom = "";
    const r = validateImport(w);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toContain("exercices › [1] › nom");
  });

  it("rejette un jour tampon hors Functional", () => {
    const w = crossfitWeek();
    w.seances[3].jour_type = "tampon";
    const r = validateImport(w);
    expect(r.ok).toBe(false);
  });

  it("rejette un Functional sans jour tampon", () => {
    const w = functionalWeek();
    w.seances.pop();
    const r = validateImport(w);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(" ")).toContain("jour tampon");
  });

  it("rejette un Functional dont un module manque", () => {
    const w = functionalWeek();
    w.seances[0].blocs.pop();
    const r = validateImport(w);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(" ")).toContain("moteur");
  });

  it("rejette le champ module hors Functional", () => {
    const w = crossfitWeek();
    (w.seances[0].blocs[0] as Record<string, unknown>).module = "charge";
    expect(validateImport(w).ok).toBe(false);
  });

  it("rejette deux séances sur le même jour", () => {
    const w = crossfitWeek();
    w.seances[1].jour = 1;
    expect(validateImport(w).ok).toBe(false);
  });
});

describe("validateImport — avertissements", () => {
  it("signale une durée totale hors de ≈ 300 min", () => {
    const w = crossfitWeek();
    w.semaine.duree_totale_min = 400;
    const r = validateImport(w);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.warnings.join(" ")).toContain("300");
  });

  it("signale de l'haltérophilie à la barre en Hybrid mais pas en haltère", () => {
    const w = crossfitWeek();
    w.profil = "hybrid";
    w.seances[0].blocs[0].exercices[0].nom = "Power snatch";
    w.seances[1].blocs[0].exercices[0].nom = "Dumbbell snatch";
    const r = validateImport(w);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.warnings.some((x) => x.includes("Power snatch"))).toBe(true);
      expect(r.warnings.some((x) => x.includes("Dumbbell snatch"))).toBe(false);
    }
  });

  it("signale un module Functional qui ne totalise pas 20 min", () => {
    const w = functionalWeek();
    (w.seances[0].blocs[0] as { duree_min?: number }).duree_min = 30;
    const r = validateImport(w);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.warnings.join(" ")).toContain("20 min");
  });
});
