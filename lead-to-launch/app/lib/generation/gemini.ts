import { DESIGN_KNOWLEDGE } from "./knowledge";
import { GenerationConfigError } from "./anthropic";

const BASE = process.env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com";
export const GEMINI_DEFAULT_MODEL = "gemini-3.8-flash";
const model = () => process.env.GEMINI_MODEL || GEMINI_DEFAULT_MODEL;

type Part = { text?: string; thought?: boolean };
type GeminiChunk = {
  candidates?: Array<{ content?: { parts?: Part[] }; finishReason?: string }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

function key(): string {
  const k = process.env.GEMINI_API_KEY;
  if (!k) throw new GenerationConfigError("GEMINI_API_KEY is not set");
  return k;
}

function requestBody(userText: string, maxTokens: number, opts: { json?: boolean; thinking?: number }) {
  const generationConfig: Record<string, unknown> = { maxOutputTokens: maxTokens, temperature: 1 };
  if (opts.json) generationConfig.responseMimeType = "application/json";
  // Gemini 2.5 models accept a thinking budget. Newer families use a different control, so only set it where it is known to work.
  if (/^gemini-2\.5/.test(model()) && typeof opts.thinking === "number") generationConfig.thinkingConfig = { thinkingBudget: opts.thinking };
  return JSON.stringify({
    systemInstruction: { parts: [{ text: DESIGN_KNOWLEDGE }] },
    contents: [{ role: "user", parts: [{ text: userText }] }],
    generationConfig,
  });
}

async function apiError(res: Response): Promise<string> {
  let detail = "";
  try {
    detail = ((await res.json()) as GeminiChunk)?.error?.message ?? "";
  } catch {
    /* ignore */
  }
  if (res.status === 400 && /API key/i.test(detail)) return "Google rejected the Gemini API key";
  if (res.status === 401 || res.status === 403) return "Google rejected the Gemini API key or this model is not allowed on your plan";
  if (res.status === 429) return "Gemini free tier limit reached. Wait a minute and try again, or switch to manual mode.";
  if (res.status === 503 || res.status === 500) return "Gemini is overloaded, retry in a moment";
  return `Gemini error ${res.status}${detail ? `: ${detail.slice(0, 160)}` : ""}`;
}

function textOf(c: GeminiChunk): string {
  return (c.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("");
}

export async function geminiText(userText: string, maxTokens: number, signal?: AbortSignal, opts: { json?: boolean } = {}): Promise<string> {
  const res = await fetch(`${BASE}/v1beta/models/${model()}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key() },
    body: requestBody(userText, maxTokens, { json: opts.json, thinking: 1024 }),
    signal,
  });
  if (!res.ok) throw new Error(await apiError(res));
  const j = (await res.json()) as GeminiChunk;
  if (j.promptFeedback?.blockReason) throw new Error(`Gemini blocked the request (${j.promptFeedback.blockReason}). Try a different steer.`);
  return textOf(j);
}

export async function geminiStream(userText: string, maxTokens: number, signal?: AbortSignal): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${BASE}/v1beta/models/${model()}:streamGenerateContent?alt=sse`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key() },
    // The creative brief already carries the thinking, so spend the budget on writing the page.
    body: requestBody(userText, maxTokens, { thinking: 0 }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(await apiError(res));

  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const reader = res.body.getReader();
  let buf = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) return controller.close();
        buf += dec.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.search(/\r?\n\r?\n/)) !== -1) {
          const evt = buf.slice(0, idx);
          buf = buf.slice(idx).replace(/^\r?\n\r?\n/, "");
          const data = evt.split(/\r?\n/).find((l) => l.startsWith("data:"))?.slice(5).trim();
          if (!data) continue;
          let j: GeminiChunk;
          try {
            j = JSON.parse(data) as GeminiChunk;
          } catch {
            continue;
          }
          const t = textOf(j);
          if (t) controller.enqueue(enc.encode(t));
          const reason = j.candidates?.[0]?.finishReason;
          if (reason === "MAX_TOKENS") controller.enqueue(enc.encode("\n<!-- L2L_TRUNCATED -->"));
          else if (reason && reason !== "STOP") controller.enqueue(enc.encode(`\n<!-- L2L_ERROR: finished with ${reason} -->`));
          if (j.error) {
            controller.enqueue(enc.encode(`\n<!-- L2L_ERROR: ${String(j.error.message ?? "stream error").slice(0, 120)} -->`));
            return controller.close();
          }
        }
      } catch (e) {
        controller.error(e);
      }
    },
    cancel() {
      reader.cancel().catch(() => undefined);
    },
  });
}
