import { describe, expect, it } from "vitest";
import { parseRestSeconds } from "@/lib/format";

describe("parseRestSeconds", () => {
  it("secondes (deux apostrophes)", () => {
    expect(parseRestSeconds("R 60''")).toBe(60);
    expect(parseRestSeconds("R 45''")).toBe(45);
    expect(parseRestSeconds("R 90''")).toBe(90);
  });

  it("minutes (une apostrophe)", () => {
    expect(parseRestSeconds("R 2'")).toBe(120);
    expect(parseRestSeconds("R 3'")).toBe(180);
  });

  it("plage — moyenne", () => {
    expect(parseRestSeconds("R 2-3'")).toBe(150);
    expect(parseRestSeconds("R 3-4'")).toBe(210);
  });

  it("null si absent ou non parseable", () => {
    expect(parseRestSeconds(undefined)).toBeNull();
    expect(parseRestSeconds(null)).toBeNull();
    expect(parseRestSeconds("")).toBeNull();
    expect(parseRestSeconds("même barre")).toBeNull();
  });
});
