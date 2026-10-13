import { NextResponse } from "next/server";
import { requireGenerator } from "@/lib/api-guard";
import { llmStream, GenerationConfigError } from "@/lib/generation/llm";
import { parseBrief } from "@/lib/generation/brief";
import { buildSitePrompt, type LeadWithAudit } from "@/lib/generation/prompts";

// Hobby with Fluid Compute allows up to 300 seconds. A full page streams for one to three minutes.
export const maxDuration = 300;

export async function POST(req: Request) {
  const user = await requireGenerator();
  if (user instanceof NextResponse) return user;

  let lead: LeadWithAudit;
  let brief;
  try {
    const body = (await req.json()) as { lead?: LeadWithAudit; brief?: unknown };
    if (!body.lead || typeof body.lead.id !== "string" || typeof body.lead.name !== "string" || !body.lead.audit) throw new Error("bad lead");
    lead = body.lead;
    brief = parseBrief(body.brief); // re-validate: never trust the client's copy of the brief
  } catch {
    return NextResponse.json({ error: "A valid lead and creative brief are required" }, { status: 400 });
  }

  try {
    const stream = await llmStream(buildSitePrompt(lead, brief), 16000, req.signal);
    return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" } });
  } catch (e) {
    if (e instanceof GenerationConfigError) return NextResponse.json({ error: "No AI engine is connected. Use manual mode, or set GEMINI_API_KEY (free) or ANTHROPIC_API_KEY in Vercel.", manual: true }, { status: 503 });
    const msg = e instanceof Error ? e.message : "Generation failed";
    console.error("site generation failed", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
