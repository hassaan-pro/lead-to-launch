import type { OutreachLanguage } from "./types";
import { detectLocale } from "./locale";

/**
 * The languages an outreach draft can be written in, and the market
 * detection that picks the default for a lead. The user can always
 * override the default in Phase 5; detection only sets the starting
 * point, from the lead's own address and city.
 */

export type OutreachLanguageOption = {
  id: OutreachLanguage;
  /** The language's name in that language, for the picker. */
  label: string;
  /** Text direction for the draft editor. */
  dir: "ltr" | "rtl";
};

export const OUTREACH_LANGUAGES: OutreachLanguageOption[] = [
  { id: "english", label: "English", dir: "ltr" },
  { id: "spanish", label: "Español", dir: "ltr" },
  { id: "arabic", label: "العربية", dir: "rtl" },
  { id: "french", label: "Français", dir: "ltr" },
  { id: "portuguese", label: "Português", dir: "ltr" },
  { id: "german", label: "Deutsch", dir: "ltr" },
  { id: "roman-urdu", label: "Roman Urdu", dir: "ltr" },
];

export function languageDir(id: OutreachLanguage): "ltr" | "rtl" {
  return OUTREACH_LANGUAGES.find((o) => o.id === id)?.dir ?? "ltr";
}

const SPANISH_HINTS = [
  "españa", "spain", "madrid", "barcelona", "valencia", "sevilla", "bilbao",
  "méxico", "mexico city", "guadalajara", "monterrey", "buenos aires", "argentina",
  "bogotá", "bogota", "colombia", "medellín", "medellin", "santiago", "chile",
  "lima", "perú", "peru", "quito", "ecuador", "caracas", "venezuela", "guatemala",
  "honduras", "el salvador", "nicaragua", "costa rica", "panamá", "panama city",
  "bolivia", "paraguay", "uruguay", "montevideo", "la habana", "cuba",
  "santo domingo", "dominican republic", "puerto rico", "san juan",
];

const PORTUGUESE_HINTS = [
  "brasil", "brazil", "são paulo", "sao paulo", "rio de janeiro", "brasília",
  "brasilia", "belo horizonte", "salvador", "fortaleza", "curitiba", "recife",
  "porto alegre", "portugal", "lisboa", "lisbon", "oporto", "braga", "coimbra",
];

const GERMAN_HINTS = [
  "deutschland", "germany", "berlin", "münchen", "hamburg", "köln", "frankfurt",
  "stuttgart", "düsseldorf", "leipzig", "dortmund", "hannover", "nürnberg",
  "dresden", "bremen", "österreich", "austria", "wien", "vienna", "graz", "linz",
  "salzburg", "zürich", "zurich", "bern",
];

const FRENCH_HINTS = [
  "france", "paris", "lyon", "marseille", "toulouse", "nantes", "bordeaux",
  "lille", "strasbourg", "belgique", "belgium", "bruxelles", "liège",
  "québec", "quebec", "montréal", "montreal",
];

const ARABIC_HINTS = [
  "saudi", "riyadh", "jeddah", "makkah", "dammam", "emirates", "dubai",
  "abu dhabi", "sharjah", "ajman", "qatar", "doha", "kuwait", "bahrain",
  "manama", "oman", "muscat", "egypt", "cairo", "alexandria", "jordan",
  "amman", "lebanon", "beirut", "morocco", "casablanca", "rabat", "algeria",
  "algiers", "tunisia", "tunis", "iraq", "baghdad",
];

// Order matters: Spanish is checked before Portuguese so "el salvador" lands
// in Spanish while the Brazilian city "Salvador" still lands in Portuguese.
const HINTS: { lang: OutreachLanguage; words: string[] }[] = [
  { lang: "spanish", words: SPANISH_HINTS },
  { lang: "portuguese", words: PORTUGUESE_HINTS },
  { lang: "german", words: GERMAN_HINTS },
  { lang: "french", words: FRENCH_HINTS },
  { lang: "arabic", words: ARABIC_HINTS },
];

/**
 * Default draft language for a lead, from where the lead actually is.
 * Pakistan keeps Roman Urdu, US leads stay English, other markets match
 * their language where one is supported, and everything else falls back
 * to English. The user can override any of this in the Phase 5 picker.
 */
export function detectOutreachLanguage(lead: { address?: string; city?: string }): OutreachLanguage {
  const locale = detectLocale(lead);
  if (locale.id === "pakistan") return "roman-urdu";
  if (locale.id === "us") return "english";
  const text = `${lead.address ?? ""} ${lead.city ?? ""}`.toLowerCase();
  for (const h of HINTS) {
    if (h.words.some((w) => text.includes(w))) return h.lang;
  }
  return "english";
}
