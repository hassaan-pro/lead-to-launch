/**
 * Design directives injected into every generated build prompt.
 *
 * These are condensed, adapted summaries (not verbatim copies) of rules from:
 *   - taste-skill by Leonxlnx          (MIT)        https://github.com/Leonxlnx/taste-skill
 *   - impeccable by Paul Bakaus        (Apache-2.0) https://github.com/pbakaus/impeccable
 *   - skills by Emil Kowalski          (MIT)        https://github.com/emilkowalski/skills
 *
 * Full license texts and a change statement live in /third_party. Keep them if you edit this file.
 * Prompts for Lovable, Bolt and ChatGPT have to stay compact, so the source skills are distilled
 * here rather than pasted whole (taste-skill alone is ~90KB).
 */
import type { AuditResult, Lead } from "./types";
import type { NichePlaybook } from "./niche-playbooks";

type Archetype = {
  id: string;
  world: string;
  palette: string;
  display: string;
  body: string;
  layout: string;
};

const EDITORIAL_LUXURY: Archetype = {
  id: "editorial-luxury",
  world: "Editorial luxury: a printed beauty magazine spread, calm and expensive, never salesy.",
  palette: "Warm cream background (about #FDFBF7), deep espresso text, ONE muted accent used sparingly. Optional very subtle film grain.",
  display: "A high-contrast serif for headings (Fraunces, Instrument Serif or Cormorant Garamond from Google Fonts), very large, tight tracking.",
  body: "A clean grotesk for body and UI (Plus Jakarta Sans or Manrope).",
  layout: "Editorial split: oversized headline on one side, staggered image cards on the other. Collapses to one column on phones.",
};

const SOFT_STRUCTURALISM: Archetype = {
  id: "soft-structuralism",
  world: "Soft structuralism: airy, calm, clinical without being cold. Trust first.",
  palette: "White or silver-grey ground, near-black text, one confident accent. Floating cards with very soft, diffused shadows.",
  display: "A bold modern grotesk for headings (Plus Jakarta Sans, Geist or Bricolage Grotesque), large and tight.",
  body: "The same family at regular weight, or Manrope.",
  layout: "Asymmetrical bento grid of mixed card sizes with generous gaps. Single column on phones.",
};

const WARM_EDITORIAL: Archetype = {
  id: "warm-editorial",
  world: "Warm editorial: a good restaurant menu printed on heavy paper. Appetite and atmosphere over polish.",
  palette: "Paper white or warm off-white, ink-dark text, one earthy accent (terracotta, olive or saffron).",
  display: "An expressive serif for headings (Fraunces or Instrument Serif).",
  body: "Manrope or Plus Jakarta Sans.",
  layout: "Large food or interior photography leads; menu and hours are scannable, not buried.",
};

const KINETIC: Archetype = {
  id: "kinetic",
  world: "Kinetic and direct: energy, momentum, proof of results.",
  palette: "Near-black or bone ground with one high-energy accent. High contrast.",
  display: "A heavy grotesk for headings (Bricolage Grotesque or Geist), huge, tight tracking.",
  body: "Geist or Manrope.",
  layout: "Big type, full-bleed photography, short punchy sections. Single column on phones.",
};

function pickArchetype(niche: string): Archetype {
  const n = niche.toLowerCase();
  if (/(salon|spa|beauty|barber|hair|makeup|bridal|nail|boutique|florist|jewel)/.test(n)) return EDITORIAL_LUXURY;
  if (/(dent|clinic|doctor|physio|optic|derma|medical|hospital|lawyer|attorney|law |accountant)/.test(n)) return SOFT_STRUCTURALISM;
  if (/(restaurant|cafe|caf\u00e9|bakery|bistro|kitchen|dhaba|catering)/.test(n)) return WARM_EDITORIAL;
  if (/(gym|fitness|crossfit|yoga|coach|trainer|martial)/.test(n)) return KINETIC;
  return SOFT_STRUCTURALISM;
}

/** What the page must visibly fix, taken from what the audit actually found on their current site. */
function fixesFromAudit(audit: AuditResult): string[] {
  const fails = new Set((audit.checks ?? []).filter((c) => c.status === "fail").map((c) => c.id));
  const out: string[] = [];
  if (!audit.hasWebsite || fails.has("booking")) out.push("Booking: a booking CTA in the first viewport and again at the end. Make it one tap, ideally into WhatsApp with the service pre-filled.");
  if (fails.has("viewport")) out.push("Mobile: design at 375px first. Their current site is not built for phones.");
  if (fails.has("whatsapp")) out.push("WhatsApp: a floating tap-to-chat button on every screen.");
  if (fails.has("tel")) out.push("Phone: a tap-to-call link in the header.");
  if (fails.has("prices")) out.push("Prices: show a clear price list or 'from' prices. Their current site hides them.");
  if (fails.has("images")) out.push("Photography: a real gallery section. Their current site has almost no photos.");
  if (fails.has("schema")) out.push("Search: add LocalBusiness JSON-LD with hours, address, geo and aggregateRating.");
  if (fails.has("meta")) out.push("Search: write a real title and meta description.");
  if (fails.has("https") || fails.has("speed")) out.push("Speed and security: HTTPS, compressed images, no render-blocking scripts.");
  return out;
}

export function buildDesignDirectives(lead: Lead, pb: NichePlaybook, audit: AuditResult, mobileNote: string): string {
  const a = pickArchetype(lead.category);
  const fixes = fixesFromAudit(audit);
  const keep = (audit.strengths ?? []).slice(0, 4);
  const reviews = lead.reviewsCount ? `${lead.reviewsCount.toLocaleString("en-US")} Google reviews` : "their Google reputation";

  return `# DESIGN BRIEF (write this first, 6 to 8 lines, then build)
Before any code, write a short design brief: who the visitor is and what state of mind they arrive in (${mobileNote}); the one action they must take (${pb.primaryCTA}); what is genuinely true about THIS business that a neighbouring competitor could not claim (use the data above: ${reviews}${lead.rating ? ` at ${lead.rating.toFixed(1)} stars` : ""}); the visual world you will use; and where the proof goes. Then build from that brief. Do not skip it.

# VISUAL WORLD: ${a.id}
- ${a.world}
- Palette: ${a.palette} Accent direction: ${pb.accent}. Mood: ${pb.vibe}
- Display type: ${a.display}
- Body type: ${a.body}
- Layout: ${a.layout}
- One dominant visual move per page (a huge headline, or one great photo, or one striking layout). Everything else supports it.

# TYPOGRAPHY
- 4 or 5 type roles only (display, heading, body, label, caption), identical wherever the role repeats.
- Body copy line length 45 to 75 characters. Headings tight, body comfortable.
- Real fallback stacks for every font. Load only the weights you use.

# SPACE AND LAYOUT
- Generous whitespace: section padding around py-24 on desktop, py-16 on phones. Let it breathe.
- A small eyebrow label above major headings. No glued edge-to-edge navbar: use a floating pill nav or a quiet header.
- Hero uses min-height 100svh, never 100vh. Inputs are 16px minimum so iOS does not zoom. Never disable pinch zoom.
- Asymmetry over symmetrical three-column icon grids. Collapse every multi-column layout to one column under 768px, remove rotations and overlaps on phones.
- Keep touch targets at least 44px.

# MOTION
- Animate transform and opacity only. Never animate width, height, margin or top/left.
- Entrances use ease-out cubic-bezier(0.23, 1, 0.32, 1). Never ease-in, never linear on UI. Never scale from 0; start from scale 0.95 with opacity 0.
- UI animations stay under 300ms. Button press feedback 100 to 160ms with scale(0.97). Scroll reveals can run longer (600 to 800ms) with a small fade-up, staggered 30 to 80ms, triggered by IntersectionObserver, not scroll listeners.
- Wrap hover effects in @media (hover: hover) and (pointer: fine). Honour prefers-reduced-motion with gentler motion, not none.

# BANNED (these make a page read as AI-generated, so avoid all of them)
- Fonts: Inter, Roboto, Arial, Open Sans, Helvetica, system-ui as a design choice.
- Purple to blue gradients, glowing orbs, glassmorphism on everything, emoji used as icons, thick default Lucide or FontAwesome icons.
- Harsh drop shadows and generic 1px grey borders on every card.
- Identical three-card rows with an icon, a title and two lines of copy.
- A centred hero with a headline and two buttons as the whole idea.
- Filler copy: "Welcome to", "Your one stop shop", "We are passionate about", lorem ipsum.

# HONESTY RULES (non-negotiable)
- Use only facts from the BUSINESS section. Do NOT invent years in business, awards, team names, testimonials, prices or statistics.
- Where information is missing, leave a visible [REPLACE: what goes here] placeholder instead of making something up.
- Reviews: show the rating and review count as proof. Quote a review only if a real one is provided.

# WHAT THIS PAGE MUST FIX (found by auditing their current site)
${fixes.length ? fixes.map((f) => `- ${f}`).join("\n") : "- No major gaps found. The win is visual quality, speed and a clearer booking path."}${keep.length ? `\n\nAlready working on their current site, so keep these: ${keep.join(", ")}.` : ""}`;
}
