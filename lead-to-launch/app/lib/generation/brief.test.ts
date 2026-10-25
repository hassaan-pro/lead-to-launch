import { describe, expect, it } from "vitest";
import { extractJson, parseBrief } from "./brief";

function validBrief(over: Record<string, unknown> = {}) {
  return {
    concept: "Warm, honest neighbourhood barber, built around trust",
    personality: ["Warm", "Direct"],
    audience: "Local men who want a reliable cut",
    mood: "Calm and confident",
    composition: { id: "booking-first", name: "Booking first", why: "Booking is the job" },
    palette: { name: "Warm", bg: "#F6F1E9", surface: "#FFFFFF", text: "#1F1B16", muted: "#6B6259", accent: "#B4532A" },
    typography: { display: "Serif", displayWhy: "Feels established", body: "Sans", notes: "" },
    sections: [
      { id: "hero", purpose: "Say who this is", treatment: "Big headline" },
      { id: "services", purpose: "List cuts and prices", treatment: "Simple cards" },
      { id: "booking", purpose: "Let people book", treatment: "Clear button" },
    ],
    signature: "A chair, a mirror, a name you remember",
    imagery: "Real shop photos",
    motion: "Subtle",
    voice: { tone: "Plain", headlines: ["A cut you can trust"] },
    mustFix: ["No booking path"],
    notTemplate: "Built around this shop, not a generic template",
    ...over,
  };
}

describe("extractJson", () => {
  it("pulls JSON out of a fenced reply with chatter around it", () => {
    const out = extractJson('Here is the direction:\n```json\n{"concept": "Hi"}\n```\nHope that helps') as { concept: string };
    expect(out.concept).toBe("Hi");
  });

  it("handles braces inside strings", () => {
    const out = extractJson('{"concept": "A {brave} idea"}') as { concept: string };
    expect(out.concept).toBe("A {brave} idea");
  });

  it("throws when there is no JSON object", () => {
    expect(() => extractJson("just words, no object")).toThrow("No JSON object in reply");
  });

  it("throws on unterminated JSON", () => {
    expect(() => extractJson('{"concept": "never closed"')).toThrow("Unterminated JSON in reply");
  });
});

describe("parseBrief", () => {
  it("accepts a valid brief and keeps its composition", () => {
    const brief = parseBrief(validBrief());
    expect(brief.concept).toContain("barber");
    expect(brief.composition.id).toBe("booking-first");
    expect(brief.sections).toHaveLength(3);
  });

  it("falls back to safe palette colours on bad hex values", () => {
    const brief = parseBrief(validBrief({ palette: { name: "Bad", bg: "not-a-colour", surface: "", text: "", muted: "", accent: "" } }));
    expect(brief.palette.bg).toBe("#F6F1E9");
    expect(brief.palette.accent).toBe("#B4532A");
  });

  it("rejects a brief with fewer than three sections", () => {
    expect(() =>
      parseBrief(validBrief({ sections: [{ id: "hero", purpose: "Only one", treatment: "x" }] })),
    ).toThrow("Brief is missing");
  });

  it("rejects a brief with no concept or fonts", () => {
    expect(() => parseBrief(validBrief({ concept: "", typography: { display: "", body: "" } }))).toThrow("Brief is missing");
  });

  it("keeps an unknown composition as custom instead of inventing a known one", () => {
    const brief = parseBrief(validBrief({ composition: { id: "made-up", name: "Made Up", why: "why" } }));
    expect(brief.composition.id).toBe("made-up");
    expect(brief.composition.name).toBe("Made Up");
  });
});
