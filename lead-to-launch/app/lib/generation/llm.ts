import { claudeText, claudeStream, GenerationConfigError } from "./anthropic";
import { geminiText, geminiStream, GEMINI_DEFAULT_MODEL } from "./gemini";

export { GenerationConfigError };
export type Provider = "anthropic" | "gemini";

/**
 * Which engine writes the brief and the page.
 * LLM_PROVIDER forces one. Otherwise Anthropic wins if its key exists (best quality), else Gemini (has a free tier).
 * Returns null when no key is configured, and the UI falls back to free manual mode.
 */
export function activeEngine(): { provider: Provider; model: string } | null {
  const forced = process.env.LLM_PROVIDER?.toLowerCase();
  const hasA = !!process.env.ANTHROPIC_API_KEY;
  const hasG = !!process.env.GEMINI_API_KEY;
  const pick: Provider | null = forced === "gemini" && hasG ? "gemini" : forced === "anthropic" && hasA ? "anthropic" : hasA ? "anthropic" : hasG ? "gemini" : null;
  if (!pick) return null;
  return pick === "gemini"
    ? { provider: "gemini", model: process.env.GEMINI_MODEL || GEMINI_DEFAULT_MODEL }
    : { provider: "anthropic", model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5" };
}

export async function llmText(userText: string, maxTokens: number, signal?: AbortSignal, opts: { json?: boolean } = {}): Promise<string> {
  const e = activeEngine();
  if (!e) throw new GenerationConfigError("No AI engine configured");
  return e.provider === "gemini" ? geminiText(userText, maxTokens, signal, opts) : claudeText(userText, maxTokens, signal);
}

export async function llmStream(userText: string, maxTokens: number, signal?: AbortSignal): Promise<ReadableStream<Uint8Array>> {
  const e = activeEngine();
  if (!e) throw new GenerationConfigError("No AI engine configured");
  return e.provider === "gemini" ? geminiStream(userText, maxTokens, signal) : claudeStream(userText, maxTokens, signal);
}
