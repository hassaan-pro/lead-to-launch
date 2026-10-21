import { DESIGN_KNOWLEDGE } from "./knowledge";
import { GenerationConfigError } from "./anthropic";

const BASE = process.env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com";
export const GEMINI_DEFAULT_MODEL = "gemini-3.8-flash";
const model = () => process.env.GEMINI_MODEL || GEMINI_DEFAULT_MODEL;

// A page is written in rounds. When a round ends at the token limit before the page is
// complete, the next round continues from the exact character the last one stopped at.
const MAX_STREAM_ROUNDS = 4;
const CONTINUE_TEXT =
  "Continue the HTML from the exact character where it stopped. Do not repeat any part of it, do not restart the document, do not add commentary, and do not use markdown fences. Output only the remaining HTML, and end with </html>.";

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

function requestBody(userText: string, maxTokens: number, opts: { json?: boolean; thinking?: number; prior?: string; omitThinking?: boolean }) {
  const generationConfig: Record<string, unknown> = { maxOutputTokens: maxTokens, temperature: 1 };
  if (opts.json) generationConfig.responseMimeType = "application/json";
  // Gemini 2.5 models accept a thinking budget. Newer families take a thinking level instead,
  // and an unset control lets default thinking drain the token budget before the page is
  // written, so the explicit no-thinking case (0) maps to the lowest level there. Support for
  // specific levels varies by model (gemini-3.8-flash rejects "minimal"), so the lowest broadly
  // supported level is used, and geminiStream retries with no thinking control at all when a
  // model rejects even that. An unsupported level must never be able to block a build.
  if (typeof opts.thinking === "number" && !opts.omitThinking) {
    if (/^gemini-2\.5/.test(model())) generationConfig.thinkingConfig = { thinkingBudget: opts.thinking };
    else if (opts.thinking === 0) generationConfig.thinkingConfig = { thinkingLevel: "low" };
  }
  const contents = opts.prior
    ? [
        { role: "user", parts: [{ text: userText }] },
        { role: "model", parts: [{ text: opts.prior }] },
        { role: "user", parts: [{ text: CONTINUE_TEXT }] },
      ]
    : [{ role: "user", parts: [{ text: userText }] }];
  return JSON.stringify({
    systemInstruction: { parts: [{ text: DESIGN_KNOWLEDGE }] },
    contents,
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

type Round = {
  reader: ReadableStreamDefaultReader<Uint8Array>;
  buf: string;
  reason: string | null;
  errored: boolean;
};

export async function geminiStream(userText: string, maxTokens: number, signal?: AbortSignal): Promise<ReadableStream<Uint8Array>> {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  let full = "";

  // Set once a model rejects the thinking control, so later rounds go straight to
  // the control-free request instead of paying for a failed attempt every round.
  let thinkingUnsupported = false;

  async function startRound(prior: string | null): Promise<Round> {
    const attempt = (omitThinking: boolean) =>
      fetch(`${BASE}/v1beta/models/${model()}:streamGenerateContent?alt=sse`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key() },
        // The creative brief already carries the thinking, so spend the budget on writing the page.
        body: requestBody(userText, maxTokens, { thinking: 0, prior: prior ?? undefined, omitThinking }),
        signal,
      });
    let res = await attempt(thinkingUnsupported);
    if (!res.ok && res.status === 400 && !thinkingUnsupported) {
      // A model that refuses the thinking level fails the whole build before a single
      // character streams. Retry once with no thinking control at all: an unset control
      // is always accepted, it just lets default thinking share the token budget, and
      // the continuation rounds absorb that.
      const detail = await res
        .clone()
        .json()
        .then((j) => (j as GeminiChunk)?.error?.message ?? "")
        .catch(() => "");
      if (/thinking/i.test(detail)) {
        thinkingUnsupported = true;
        res = await attempt(true);
      }
    }
    if (!res.ok || !res.body) throw new Error(await apiError(res));
    return { reader: res.body.getReader(), buf: "", reason: null, errored: false };
  }

  function handleEvent(r: Round, evt: string, controller: ReadableStreamDefaultController<Uint8Array>): void {
    const data = evt.split(/\r?\n/).find((l) => l.startsWith("data:"))?.slice(5).trim();
    if (!data) return;
    let j: GeminiChunk;
    try {
      j = JSON.parse(data) as GeminiChunk;
    } catch {
      return;
    }
    const t = textOf(j);
    if (t) {
      full += t;
      controller.enqueue(enc.encode(t));
    }
    const reason = j.candidates?.[0]?.finishReason;
    if (reason) r.reason = reason;
    if (j.error) {
      controller.enqueue(enc.encode(`\n<!-- L2L_ERROR: ${String(j.error.message ?? "stream error").slice(0, 120)} -->`));
      r.errored = true;
    }
  }

  // The first round is opened eagerly so configuration and key errors reach the route
  // handler as proper HTTP errors, exactly as before. Continuation rounds open lazily.
  let round: Round | null = await startRound(null);
  let roundsUsed = 1;
  let finished = false;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        for (;;) {
          if (finished) return;
          if (!round) {
            try {
              round = await startRound(full);
              roundsUsed++;
            } catch (e) {
              controller.enqueue(enc.encode(`\n<!-- L2L_ERROR: ${String(e instanceof Error ? e.message : "stream error").slice(0, 120)} -->`));
              finished = true;
              return controller.close();
            }
          }
          const { done, value } = await round.reader.read();
          if (!done) {
            round.buf += dec.decode(value, { stream: true });
            let idx: number;
            while ((idx = round.buf.search(/\r?\n\r?\n/)) !== -1) {
              const evt = round.buf.slice(0, idx);
              round.buf = round.buf.slice(idx).replace(/^\r?\n\r?\n/, "");
              handleEvent(round, evt, controller);
              if (round.errored) break;
            }
            if (round.errored) {
              finished = true;
              return controller.close();
            }
            return;
          }
          // The round ended. Parse any tail event that arrived without a trailing blank line.
          if (round.buf.trim()) handleEvent(round, round.buf, controller);
          const reason = round.reason;
          const wasErrored = round.errored;
          round = null;
          if (wasErrored) {
            finished = true;
            return controller.close();
          }
          const complete = /<\/html>/i.test(full);
          if (reason === "MAX_TOKENS" && !complete && roundsUsed < MAX_STREAM_ROUNDS) continue;
          if (reason === "MAX_TOKENS" && !complete) controller.enqueue(enc.encode("\n<!-- L2L_TRUNCATED -->"));
          else if (reason && reason !== "STOP") controller.enqueue(enc.encode(`\n<!-- L2L_ERROR: finished with ${reason} -->`));
          finished = true;
          return controller.close();
        }
      } catch (e) {
        controller.error(e);
      }
    },
    cancel() {
      round?.reader.cancel().catch(() => undefined);
    },
  });
}
