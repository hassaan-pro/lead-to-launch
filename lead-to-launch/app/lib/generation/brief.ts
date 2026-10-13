import { COMPOSITIONS } from "./knowledge";

/** The creative decisions made for ONE business before a single line of HTML is written. */
export type CreativeBrief = {
  concept: string;
  personality: string[];
  audience: string;
  mood: string;
  composition: { id: string; name: string; why: string };
  palette: { name: string; bg: string; surface: string; text: string; muted: string; accent: string; accent2?: string };
  typography: { display: string; displayWhy: string; body: string; notes: string };
  sections: Array<{ id: string; purpose: string; treatment: string }>;
  signature: string;
  imagery: string;
  motion: string;
  voice: { tone: string; headlines: string[] };
  mustFix: string[];
  notTemplate: string;
};

const str = (v: unknown, max = 400): string => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const arr = (v: unknown, max: number, len = 200): string[] =>
  Array.isArray(v) ? v.map((x) => str(x, len)).filter(Boolean).slice(0, max) : [];
const hex = (v: unknown, fallback: string): string => (typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v.trim()) ? v.trim() : fallback);

/** Pull the first balanced JSON object out of a model reply, tolerating fences and chatter. */
export function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  if (start === -1) throw new Error("No JSON object in reply");
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return JSON.parse(text.slice(start, i + 1));
    }
  }
  throw new Error("Unterminated JSON in reply");
}

/** Validate and sanitise. Throws on anything that would make the build step meaningless. */
export function parseBrief(raw: unknown): CreativeBrief {
  const o = (raw ?? {}) as Record<string, unknown>;
  const comp = (o.composition ?? {}) as Record<string, unknown>;
  const known = COMPOSITIONS.find((c) => c.id === str(comp.id, 60));
  const p = (o.palette ?? {}) as Record<string, unknown>;
  const t = (o.typography ?? {}) as Record<string, unknown>;
  const v = (o.voice ?? {}) as Record<string, unknown>;

  const sections = (Array.isArray(o.sections) ? (o.sections as unknown[]) : [])
    .map((raw) => {
      const x = (raw ?? {}) as Record<string, unknown>;
      return { id: str(x.id, 40), purpose: str(x.purpose, 220), treatment: str(x.treatment, 280) };
    })
    .filter((x) => x.id && x.purpose)
    .slice(0, 10);

  const brief: CreativeBrief = {
    concept: str(o.concept, 300),
    personality: arr(o.personality, 6, 40),
    audience: str(o.audience, 300),
    mood: str(o.mood, 300),
    composition: { id: known?.id ?? (str(comp.id, 60) || "custom"), name: known?.name ?? (str(comp.name, 80) || "Custom"), why: str(comp.why, 400) },
    palette: {
      name: str(p.name, 60),
      bg: hex(p.bg, "#F6F1E9"),
      surface: hex(p.surface, "#FFFFFF"),
      text: hex(p.text, "#1F1B16"),
      muted: hex(p.muted, "#6B6259"),
      accent: hex(p.accent, "#B4532A"),
      accent2: typeof p.accent2 === "string" && /^#[0-9a-fA-F]{3,8}$/.test(p.accent2.trim()) ? p.accent2.trim() : undefined,
    },
    typography: { display: str(t.display, 60), displayWhy: str(t.displayWhy, 200), body: str(t.body, 60), notes: str(t.notes, 300) },
    sections,
    signature: str(o.signature, 400),
    imagery: str(o.imagery, 400),
    motion: str(o.motion, 300),
    voice: { tone: str(v.tone, 200), headlines: arr(v.headlines, 4, 120) },
    mustFix: arr(o.mustFix, 8, 200),
    notTemplate: str(o.notTemplate, 500),
  };

  if (!brief.concept || sections.length < 3 || !brief.typography.display || !brief.typography.body) {
    throw new Error("Brief is missing a concept, fonts or at least three sections");
  }
  return brief;
}
