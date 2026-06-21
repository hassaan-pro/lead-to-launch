import { NextResponse } from "next/server";

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_ENDPOINT = "https://api.tavily.com/search";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
};

export async function POST(req: Request) {
  let body: { niche?: string; city?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body", results: [], configured: !!TAVILY_API_KEY }, { status: 400 });
  }

  const { niche, city } = body;
  if (!niche || !city) {
    return NextResponse.json({ error: "niche and city are required", results: [], configured: !!TAVILY_API_KEY }, { status: 400 });
  }

  // No key configured — degrade gracefully. The static, pre-researched niche
  // playbook inspiration in lib/niche-playbooks.ts still applies either way.
  if (!TAVILY_API_KEY) {
    return NextResponse.json({ results: [], configured: false });
  }

  const query = `best rated ${niche} in ${city} website OR booking`;

  try {
    const res = await fetch(TAVILY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        max_results: 5,
      }),
      // Keep this snappy — if Tavily is slow, fall back rather than block the UI.
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Tavily ${res.status}: ${text.slice(0, 200)}`, results: [], configured: true },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { results?: TavilyResult[] };
    const results = (data.results ?? []).slice(0, 5).map((r) => ({
      title: String(r.title ?? "").slice(0, 140),
      url: String(r.url ?? ""),
      snippet: String(r.content ?? "").slice(0, 280),
    }));

    return NextResponse.json({ results, configured: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Research request failed";
    return NextResponse.json({ error: message, results: [], configured: true }, { status: 500 });
  }
}
