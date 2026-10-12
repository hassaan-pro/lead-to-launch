import { DESIGN_KNOWLEDGE } from "./knowledge";

type StreamEvent = { type?: string; delta?: { type?: string; text?: string; stop_reason?: string }; error?: { message?: string } };

const BASE = process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com";
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5";

export class GenerationConfigError extends Error {}

function headers(): Record<string, string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new GenerationConfigError("ANTHROPIC_API_KEY is not set");
  return { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" };
}

function body(userText: string, maxTokens: number, stream: boolean) {
  return JSON.stringify({
    model: MODEL,
    max_tokens: maxTokens,
    stream,
    // The design knowledge is identical on every call, so it is cached after the first request.
    system: [{ type: "text", text: DESIGN_KNOWLEDGE, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userText }],
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

/** Streams reply text as it is generated. Emits a marker comment if the model hit its token limit. */
export async function claudeStream(userText: string, maxTokens: number, signal?: AbortSignal): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${BASE}/v1/messages`, { method: "POST", headers: headers(), body: body(userText, maxTokens, true), signal });
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
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const evt = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const data = evt.split("\n").find((l) => l.startsWith("data:"))?.slice(5).trim();
          if (!data) continue;
          let j: StreamEvent;
          try {
            j = JSON.parse(data) as StreamEvent;
          } catch {
            continue;
          }
          if (j.type === "content_block_delta" && j.delta?.type === "text_delta") controller.enqueue(enc.encode(j.delta.text ?? ""));
          else if (j.type === "message_delta" && j.delta?.stop_reason === "max_tokens") controller.enqueue(enc.encode("\n<!-- L2L_TRUNCATED -->"));
          else if (j.type === "error") {
            controller.enqueue(enc.encode(`\n<!-- L2L_ERROR: ${String(j.error?.message ?? "stream error").slice(0, 120)} -->`));
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
