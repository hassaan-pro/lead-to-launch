import { NextResponse } from "next/server";
import { requireGenerator } from "@/lib/api-guard";
import { activeEngine } from "@/lib/generation/llm";

/** Tells the UI which engine is live. Never returns keys. */
export async function GET() {
  const g = await requireGenerator();
  const engine = activeEngine();
  if (g instanceof NextResponse) {
    if (g.status === 401) return g;
    const reason = ((await g.json()) as { error?: string }).error ?? "Not allowed";
    return NextResponse.json({ provider: engine?.provider ?? null, model: engine?.model ?? null, allowed: false, reason });
  }
  return NextResponse.json({ provider: engine?.provider ?? null, model: engine?.model ?? null, allowed: true });
}
