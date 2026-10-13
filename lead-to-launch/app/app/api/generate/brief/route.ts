import { NextResponse } from "next/server";
import { requireGenerator } from "@/lib/api-guard";
import { llmText, GenerationConfigError } from "@/lib/generation/llm";
import { extractJson, parseBrief } from "@/lib/generation/brief";
import { buildBriefPrompt, type BriefRequest, type LeadWithAudit } from "@/lib/generation/prompts";
import type { MarketResearchResult } from "@/lib/types";

// The brief is a short JSON reply, but give it room.
export const maxDuration = 120;

export async function POST(req: Request) {
  const user = await requireGenerator();
  if (user instanceof NextResponse) return user;

  let body: { lead?: LeadWithAudit; research?: MarketResearchResult[]; recent?: BriefRequest["recent"]; steer?: string; seed?: number };
  try {
    body = await req.json();
    if (!body.lead || typeof body.lead.id !== "string" || typeof body.lead.name !== "string" || !body.lead.audit) throw new Error("bad lead");
  } catch {
    return NextResponse.json({ error: "A valid lead with an audit is required" }, { status: 400 });
  }

  const seed = Number.isFinite(body.seed) ? Number(body.seed) : Math.floor(Math.random() * 2 ** 31);
  const prompt = buildBriefPrompt({ lead: body.lead, research: body.research, recent: body.recent, steer: body.steer, seed });

  // One retry: the only realistic failure is malformed JSON, and a second sample usually fixes it.
  let lastError = "Brief failed";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await llmText(prompt, 6000, AbortSignal.timeout(100_000), { json: true });
      const brief = parseBrief(extractJson(text));
      return NextResponse.json({ brief, seed });
    } catch (e) {
      if (e instanceof GenerationConfigError) return NextResponse.json({ error: "No AI engine is connected. Use manual mode, or set GEMINI_API_KEY (free) or ANTHROPIC_API_KEY in Vercel.", manual: true }, { status: 503 });
      lastError = e instanceof Error ? e.message : "Brief failed";
      if (/rejected the|rate limit|limit reached|blocked/i.test(lastError)) break;
    }
  }
  console.error("brief failed", lastError);
  return NextResponse.json({ error: lastError }, { status: 502 });
}
