import { DESIGN_KNOWLEDGE } from "./knowledge";

type StreamEvent = { type?: string; delta?: { type?: string; text?: string; stop_reason?: string }; error?: { message?: string } };

const BASE = process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com";
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5";

// A page is written in rounds. When a round ends at the token limit before the page is
// complete, the next round continues from the exact character the last one stopped at.
const MAX_STREAM_ROUNDS = 4;
const CONTINUE_TEXT =
  "Continue the HTML from the exact character where it stopped. Do not repeat any part of it, do not restart the document, do not add commentary, and do not use markdown fences. Output only the remaining HTML, and end with </html>.";

export class GenerationConfigError extends Error {}

function headers(): Record<string, string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new GenerationConfigError("ANTHROPIC_API_KEY is not set");
  return { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" };
}

function body(userText: string, maxTokens: number, stream: boolean, prior?: string) {
  const messages = prior
    ? [
        { role: "user", content: userText },
        { role: "assistant", content: prior },
        { role: "user", content: CONTINUE_TEXT },
      ]
    : [{ role: "user", content: userText }];
  return JSON.stringify({
    model: MODEL,
    max_tokens: maxTokens,
    stream,
    // The design knowledge is identical on every call, so it is cached after the first request.
    system: [{ type: "text", text: DESIGN_KNOWLEDGE, cache_control: { type: "ephemeral" } }],
    messages,
  });
}

/** One-shot call that returns the full text of the reply. */
export async function claudeText(userText: string, maxTokens: number, signal?: AbortSignal): Promise<string> {
  const res = await fetch(`${BASE}/v1/messages`, { method: "POST", headers: headers(), body: body(userText, maxTokens, false), signal });
  if (!res.ok) throw new Error(await apiError(res));
  const j = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  return (j.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
}

async function apiError(res: Response): Promise<string> {
  let detail = "";
  try {
    const j = await res.json();
    detail = j?.error?.message ?? "";
  } catch {
    /* ignore */
  }
  if (res.status === 401) return "Anthropic rejected the API key";
  if (res.status === 429) return "Anthropic rate limit or credit limit reached";
  if (res.status === 529 || res.status === 503) return "Anthropic is overloaded, retry in a moment";
  return `Anthropic error ${res.status}${detail ? `: ${detail.slice(0, 160)}` : ""}`;
}

type Round = {
  reader: ReadableStreamDefaultReader<Uint8Array>;
  buf: string;
  reason: string | null;
  errored: boolean;
};

/** Streams reply text as it is generated, continuing in further rounds when a round hits the token limit mid-page. Emits a marker comment if the page is still unfinished after the last round. */
export async function claudeStream(userText: string, maxTokens: number, signal?: AbortSignal): Promise<ReadableStream<Uint8Array>> {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  let full = "";

  async function startRound(prior: string | null): Promise<Round> {
    const res = await fetch(`${BASE}/v1/messages`, { method: "POST", headers: headers(), body: body(userText, maxTokens, true, prior ?? undefined), signal });
    if (!res.ok || !res.body) throw new Error(await apiError(res));
    return { reader: res.body.getReader(), buf: "", reason: null, errored: false };
  }

  function handleEvent(r: Round, evt: string, controller: ReadableStreamDefaultController<Uint8Array>): void {
    const data = evt.split("\n").find((l) => l.startsWith("data:"))?.slice(5).trim();
    if (!data) return;
    let j: StreamEvent;
    try {
      j = JSON.parse(data) as StreamEvent;
    } catch {
      return;
    }
    if (j.type === "content_block_delta" && j.delta?.type === "text_delta") {
      const t = j.delta.text ?? "";
      if (t) {
        full += t;
        controller.enqueue(enc.encode(t));
      }
    } else if (j.type === "message_delta" && j.delta?.stop_reason) {
      r.reason = j.delta.stop_reason;
    } else if (j.type === "error") {
      controller.enqueue(enc.encode(`\n<!-- L2L_ERROR: ${String(j.error?.message ?? "stream error").slice(0, 120)} -->`));
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
            while ((idx = round.buf.indexOf("\n\n")) !== -1) {
              const evt = round.buf.slice(0, idx);
              round.buf = round.buf.slice(idx + 2);
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
          if (reason === "max_tokens" && !complete && roundsUsed < MAX_STREAM_ROUNDS) continue;
          if (reason === "max_tokens" && !complete) controller.enqueue(enc.encode("\n<!-- L2L_TRUNCATED -->"));
          else if (reason && reason !== "end_turn" && reason !== "stop_sequence") controller.enqueue(enc.encode(`\n<!-- L2L_ERROR: finished with ${reason} -->`));
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
