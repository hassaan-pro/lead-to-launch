/**
 * Niche playbooks for Phase 4 (Build).
 *
 * Each playbook encodes what currently makes the *best* websites in that
 * category convert — section structure, hero angle, trust signals, FAQ
 * topics, photography direction — distilled from category-specific design
 * research rather than one generic local-business template.
 *
 * This is what makes a Salon prompt look different from a Restaurant prompt
 * beyond swapping the business name in.
 */

export type NichePlaybook = {
  id: string;
  /** Lowercase keywords matched against the lead's category string. */
  matches: string[];
  /** One-line aesthetic/mood direction. */
  vibe: string;
  /** Accent color direction (paired with an off-white/neutral base). */
  accent: string;
  /** What the H1 promise should sell — not literal copy, a direction. */
  heroAngle: string;
  primaryCTA: string;
  secondaryCTA: string;
  /** Signature sections specific to this niche, inserted into the build. */
  signatureSections: string[];
  /** Example services to seed a grid/menu if the lead has none on record. */
  serviceExamples: string[];
  trustSignals: string[];
  faqTopics: string[];
  photographyNote: string;
  /** 3-4 bullets on what top real-world sites in this category do well right now. */
  inspiration: string[];
  /** Literal hero headline HTML used by the in-app live preview (not the AI prompt). */
  previewHeadline: string;
  /** Literal CTA button label used by the in-app live preview. */
  previewCtaLabel: string;
};

const PLAYBOOKS: NichePlaybook[] = [
  {
    id: "salon",
    matches: ["salon", "parlour", "parlor", "beauty", "hair", "nail", "barber", "makeup"],
    vibe: "Editorial-clean with warm neutrals — the salon chair should feel like the calmest part of the visitor's day.",
    accent: "deep rose, blush pink, or muted terracotta against an off-white base",
    heroAngle: "Show, don't tell: lead with the transformation/results visual, not a tagline. The promise is 'see what we do' before 'trust us'.",
    primaryCTA: "Book on WhatsApp",
    secondaryCTA: "View style menu",
    signatureSections: [
      "Visual style/service menu — services shown with reference imagery, not just a text list, so first-timers know what they're booking before they arrive",
      "Before/after gallery — real transformation photos in a grid, this is the #1 trust driver for salons, never use stock photos here",
      "Stylist/team profiles — name, specialty, photo; clients book a person, not just a salon",
      "Pricing shown openly per service — hidden pricing is the #1 reason salon visitors bounce",
    ],
    serviceExamples: ["Haircut & styling", "Hair color / balayage", "Keratin / smoothing treatment", "Bridal makeup & hair", "Facial & skincare", "Manicure & pedicure"],
    trustSignals: ["Google rating + review count", "years in the neighborhood", "stylist credentials/training", "before/after results"],
    faqTopics: ["walk-ins vs appointment-only", "how far in advance to book for bridal/event work", "first-visit consultation process", "pricing transparency / what's included", "products used (organic, ammonia-free, etc.)"],
    photographyNote: "Real transformation and salon-interior photography only — stock beauty photos kill credibility for this niche specifically.",
    inspiration: [
      "Top-converting salon sites put the booking button and priced service menu above the fold — those are the two highest-converting elements on any salon site",
      "Before/after galleries with real client results consistently outperform generic 'our services' copy for building first-time-visitor trust",
      "Stylist bio cards (face + specialty + experience) reduce first-visit anxiety more than any amount of brand copy",
      "Booking flows that stay in 3 steps or fewer (service → time → confirm) convert meaningfully better than redirecting off-site",
    ],
    previewHeadline: `Your next look,<br/>booked in seconds.<br/><span class="italic text-stone-500">No calls needed.</span>`,
    previewCtaLabel: "Book on WhatsApp →",
  },
  {
    id: "spa",
    matches: ["spa", "wellness", "massage", "therapy center", "ayurved"],
    vibe: "Slow, spacious, sensory — generous whitespace and muted tones that lower the visitor's heart rate before they even book.",
    accent: "sage green, warm sand, or soft lavender against an off-white base",
    heroAngle: "Sell the feeling of the experience first (calm, escape, relief), the service menu second.",
    primaryCTA: "Book on WhatsApp",
    secondaryCTA: "View treatment menu",
    signatureSections: [
      "Treatment menu with duration + price (e.g. '60 min — Deep Tissue')",
      "Ambience gallery — interior/room photography that sells the atmosphere, not just the service",
      "Therapist credentials — certifications matter more here than in most niches",
      "Packages/memberships section if recurring visits are common for this business",
    ],
    serviceExamples: ["Swedish/deep tissue massage", "Facial therapy", "Body scrub & wrap", "Couples spa package", "Ayurvedic treatment", "Foot reflexology"],
    trustSignals: ["certified therapists", "hygiene/sanitation standards", "years operating", "Google rating"],
    faqTopics: ["what to bring/wear", "arrival time before appointment", "hygiene protocols", "gender of therapist (if relevant locally)", "cancellation policy"],
    photographyNote: "Soft, natural-light interior and treatment-room photography. Avoid clinical or overly bright imagery.",
    inspiration: [
      "Spa sites that lead with ambience photography over service lists convert better — visitors are buying a feeling first",
      "Visible certifications and hygiene signals reduce the specific hesitation spa-first-timers have",
      "Package/membership upsell sections placed after the core treatment menu, not before, perform best",
    ],
    previewHeadline: `An hour away<br/>from everything.<br/><span class="italic text-stone-500">Book your escape.</span>`,
    previewCtaLabel: "Book on WhatsApp →",
  },
  {
    id: "restaurant",
    matches: ["restaurant", "cafe", "café", "dhaba", "diner", "bakery", "eatery", "food", "bbq", "biryani", "pizzeria"],
    vibe: "Appetite-first — full-bleed food photography does the selling, copy stays out of the way.",
    accent: "warm terracotta, charcoal, or deep red against a cream base — match to cuisine type",
    heroAngle: "Lead with the single best dish photo and the fastest path to order/reserve. Never lead with a paragraph about the restaurant's history.",
    primaryCTA: "Order on WhatsApp",
    secondaryCTA: "Reserve a table",
    signatureSections: [
      "Live HTML menu (never a PDF) — categorized, with prices, scannable in one screen, since menu/hours/location/phone/order are the 5 things visitors look for in order",
      "Hero-size food photography for 3-5 signature dishes — this is the highest-ROI design element on the whole site",
      "Reservation widget or WhatsApp table-booking, with party size + time",
      "Ambience/interior gallery — sells the dine-in experience, not just the food",
    ],
    serviceExamples: ["Signature main course", "Chef's special", "Family combo / thali", "Starters & appetizers", "Desserts", "Beverages"],
    trustSignals: ["Google rating + review count", "years serving the area", "fresh-ingredient/sourcing note", "hygiene rating if available"],
    faqTopics: ["dine-in vs takeaway vs delivery", "reservation policy for groups", "timings & last-order time", "dietary options (veg/halal/allergens)", "parking/location"],
    photographyNote: "Professional, well-lit food photography is non-negotiable — diners decide on photos before reading a word of copy. No stock food images.",
    inspiration: [
      "The best restaurant sites put menu, hours, location, phone, and ordering within one tap of the homepage — never buried behind multiple clicks",
      "HTML menus consistently outperform PDF menus for both SEO and order completion; PDFs are not mobile-friendly and don't get indexed for dish-specific search",
      "Hero sections built around one outstanding dish photo with a single clear CTA outperform text-heavy intros",
      "Sites that show real interior/ambience photography (not just food) help dine-in guests picture themselves there before they book",
    ],
    previewHeadline: `Hungry?<br/>Order in one tap.<br/><span class="italic text-stone-500">No app, no wait.</span>`,
    previewCtaLabel: "Order on WhatsApp →",
  },
  {
    id: "dentist",
    matches: ["dentist", "dental", "clinic", "doctor", "physician", "dermat", "ortho", "hospital", "diagnostic"],
    vibe: "Calm clinical authority — clean white space that reduces anxiety, never cold or sterile.",
    accent: "trust-signaling blue or soft teal against a clean white base",
    heroAngle: "Lead with trust + ease of booking. The visitor is often anxious or in discomfort — the hero's job is to lower that anxiety in one screen.",
    primaryCTA: "Book on WhatsApp",
    secondaryCTA: "Call now",
    signatureSections: [
      "Doctor/dentist credentials section — degree, certifications, years practicing; this is the single biggest trust lever in healthcare",
      "Treatments offered with plain-language descriptions (avoid jargon that increases anxiety)",
      "Patient testimonials — text or video, with real names where consent allows; testimonials measurably lift booking conversion in this category",
      "Insurance/payment info section — 'accepts most insurance' or clear pricing removes a major booking blocker",
    ],
    serviceExamples: ["General checkup & cleaning", "Root canal", "Teeth whitening", "Braces / orthodontics", "Dental implants", "Pediatric dentistry"],
    trustSignals: ["years in practice", "degrees/certifications", "Google rating + review count", "insurance accepted", "hygiene/safety standards"],
    faqTopics: ["what to expect at first visit", "pricing/insurance coverage", "is the procedure painful", "appointment vs walk-in", "emergency availability"],
    photographyNote: "Real photos of the doctor/team and a clean clinic interior. Smiling, approachable staff photography reduces patient anxiety more than stock clinical imagery.",
    inspiration: [
      "Top clinic/dental sites treat the website as the first 'handshake' — credentials and a calm, uncluttered layout do more trust-building than any amount of marketing copy",
      "Testimonials (especially video) measurably outperform text-only descriptions for converting anxious first-time patients",
      "Transparent pricing or insurance info displayed early removes the single biggest hesitation before booking",
      "Clean, low-clutter white space signals hygiene and care even before a visitor reads any content",
    ],
    previewHeadline: `Painless care,<br/>booked in seconds.<br/><span class="italic text-stone-500">No more phone tag.</span>`,
    previewCtaLabel: "Book on WhatsApp →",
  },
  {
    id: "gym",
    matches: ["gym", "fitness", "crossfit", "yoga", "pilates", "martial art", "akhara", "akhada", "boxing"],
    vibe: "High-energy and confident, or calm and minimal for yoga/pilates — match intensity to the specific discipline, not a generic 'fitness' template.",
    accent: "energetic orange/red/electric-blue for high-intensity gyms; sage/earth tones for yoga or wellness-leaning studios",
    heroAngle: "Tell the visitor who this gym is *for* and remove the financial/social risk of a first visit in the same screen — 'is this place for someone like me' matters more than an amenities list.",
    primaryCTA: "Book a free trial class",
    secondaryCTA: "View class schedule",
    signatureSections: [
      "Free trial / intro offer placed above the fold — the single highest-converting element across fitness sites",
      "Class schedule/timetable — must be easy to scan on mobile, since most visitors check this before anything else",
      "Trainer profiles with real photos and specialties — independents win on trainer trust, not equipment lists",
      "Membership tiers with transparent pricing — hidden 'contact us for pricing' measurably hurts conversion",
    ],
    serviceExamples: ["Personal training", "Group classes", "Strength & conditioning", "Yoga/pilates sessions", "Nutrition coaching", "Open gym access"],
    trustSignals: ["real member/trainer photos (never stock)", "Google rating + review count", "years operating", "transparent membership pricing"],
    faqTopics: ["how the free trial works", "what to bring on the first visit", "membership pause/cancellation policy", "class booking process", "beginner-friendliness"],
    photographyNote: "Real photography of the actual space, trainers, and members training — authentic gym photography is a stronger trust signal here than almost any other niche.",
    inspiration: [
      "The best-performing gym sites lead with a free trial or low-risk first step above the fold, rather than asking for a membership commitment immediately",
      "A scannable, mobile-friendly class schedule is one of the first things visitors look for, before pricing or amenities",
      "Sites that show real trainers and real members (not stock fitness photos) consistently win trust over generic 'energetic gym' templates",
      "Picking a clear identity ('CrossFit box', 'boutique cycling studio', 'community gym') and designing around it outperforms a generic all-purpose fitness template",
    ],
    previewHeadline: `Your first class<br/>is on us.<br/><span class="italic text-stone-500">No commitment yet.</span>`,
    previewCtaLabel: "Book a free trial →",
  },
  {
    id: "lawyer",
    matches: ["lawyer", "advocate", "legal", "law firm", "attorney", "notary"],
    vibe: "Understated authority — minimal navigation, restrained palette, the design should read as credible and serious, not flashy.",
    accent: "navy, charcoal, or deep green against a white/off-white base",
    heroAngle: "Lead with practice area + a clear consultation CTA. Visitors arriving here are often stressed — clarity and credibility beat cleverness.",
    primaryCTA: "Book a free consultation",
    secondaryCTA: "Call now",
    signatureSections: [
      "Practice areas grid — what kinds of cases this lawyer/firm handles, in plain language",
      "Advocate/attorney bio — bar registration, years practicing, notable experience (no specific case results or client names without explicit confirmation they may be used)",
      "Client testimonials — general statements of satisfaction rather than case specifics, respecting confidentiality",
      "Free consultation CTA repeated at top and bottom of the page",
    ],
    serviceExamples: ["Family law / divorce", "Property & civil disputes", "Criminal defense", "Corporate & business law", "Immigration", "Documentation & notary services"],
    trustSignals: ["years practicing", "bar council registration", "Google rating + review count", "areas of specialization"],
    faqTopics: ["how the first consultation works", "fee structure (fixed vs hourly)", "how long cases typically take", "documents to bring to first meeting", "confidentiality assurance"],
    photographyNote: "Professional headshots and a credible office interior. Avoid stock 'gavel and scales' imagery — it reads as generic.",
    inspiration: [
      "Legal sites that lead with a clear practice-area grid and one obvious consultation CTA outperform sites that try to explain everything in paragraphs",
      "Restrained, minimal design (navy/charcoal, generous whitespace) signals credibility more effectively than bold colors or busy layouts for this niche",
      "Visible bar registration and years of experience are the trust signals visitors specifically look for before reaching out",
    ],
    previewHeadline: `Clear advice,<br/>when it matters.<br/><span class="italic text-stone-500">First consult free.</span>`,
    previewCtaLabel: "Book a free consult →",
  },
  {
    id: "coaching",
    matches: ["coaching", "tuition", "academy", "institute", "classes", "school", "tutor", "education"],
    vibe: "Aspirational but approachable — should feel credible to parents/students without feeling like a corporate brochure.",
    accent: "confident blue, gold, or maroon against an off-white base — common in education branding for trust + ambition",
    heroAngle: "Lead with outcomes (results, success stories, pass rates) and a clear 'book a free demo class' CTA.",
    primaryCTA: "Book a free demo class",
    secondaryCTA: "View courses & batches",
    signatureSections: [
      "Courses/batches grid with timings and fee structure shown openly",
      "Faculty profiles — qualifications and teaching experience build parent/student trust directly",
      "Student results/success stories — scores, placements, or testimonials specific to outcomes",
      "Free demo class CTA repeated through the page — this is the standard low-risk first step in this category",
    ],
    serviceExamples: ["Foundation/beginner batch", "Exam-prep intensive course", "One-on-one tutoring", "Weekend/evening batches", "Online classes", "Doubt-clearing sessions"],
    trustSignals: ["years running", "faculty qualifications", "student results/pass rate", "Google rating + review count"],
    faqTopics: ["how the demo class works", "batch timings & class size", "fee structure & payment plans", "study material included", "online vs in-person options"],
    photographyNote: "Real classroom and faculty photography. Genuine student success moments outperform generic stock 'students studying' imagery.",
    inspiration: [
      "Education sites that lead with outcomes (results, success stories) before course details build trust faster than feature lists",
      "A free demo class as the primary CTA is the standard low-risk first step that performs best for converting parents/students into enrollments",
      "Faculty profiles with real credentials measurably increase trust for both parents and adult learners",
    ],
    previewHeadline: `Results worth<br/>talking about.<br/><span class="italic text-stone-500">Book a free demo class.</span>`,
    previewCtaLabel: "Book a free demo →",
  },
];

const DEFAULT_PLAYBOOK: NichePlaybook = {
  id: "default",
  matches: [],
  vibe: "Premium local-business aesthetic — clean, confident, unmistakably modern.",
  accent: "one deep accent colour against an off-white base",
  heroAngle: "Lead with the core promise of the business and the fastest path to contact.",
  primaryCTA: "Book on WhatsApp",
  secondaryCTA: "Call now",
  signatureSections: [
    "Services/offerings grid with the 6 most-searched services for this category",
    "About + owner/team bio with credentials or years of experience",
    "Reviews/testimonials section",
  ],
  serviceExamples: ["Core service one", "Core service two", "Core service three", "Core service four", "Core service five", "Core service six"],
  trustSignals: ["Google rating + review count", "years in business", "local reputation"],
  faqTopics: ["pricing", "first-visit/first-contact process", "timings", "payment methods"],
  photographyNote: "Real photography of the business, owner, and premises rather than stock imagery.",
  inspiration: [
    "High-converting local-business sites put one clear primary CTA above the fold and remove every unnecessary click between interest and contact",
    "Real photography of the actual business outperforms stock imagery for local trust",
    "Transparent pricing or a clear next step (book/call/visit) reduces the single biggest source of visitor drop-off",
  ],
  previewHeadline: `A trusted local name.<br/>Now online.<br/><span class="italic text-stone-500">Book in seconds.</span>`,
  previewCtaLabel: "Book on WhatsApp →",
};

/** Fuzzy-match a lead's free-text category string to the closest niche playbook. */
export function getNichePlaybook(category: string): NichePlaybook {
  const c = (category ?? "").toLowerCase();
  for (const playbook of PLAYBOOKS) {
    if (playbook.matches.some((kw) => c.includes(kw))) return playbook;
  }
  return DEFAULT_PLAYBOOK;
}

export { PLAYBOOKS, DEFAULT_PLAYBOOK };
