// Lovable Cloud edge function: search-market-radar
// Returns 202 immediately and runs the AI search in the background.
// Uses raw fetch (no supabase-js import) to keep cold-start memory low
// and avoid WORKER_RESOURCE_LIMIT (546) errors.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const ALLOWED_CATEGORIES = ["COMMISSION", "RATINGS", "FORMAT TREND", "INDUSTRY NEWS"];

const SYSTEM_PROMPT = `You are a market intelligence analyst for the Australian unscripted (factual / reality / documentary) TV industry.

Generate 8 realistic, plausible market intelligence items as if pulled from trade press in the last 30 days. Cover commissions, ratings, format trends, and industry news from broadcasters like ABC, SBS, Nine, Seven, Network 10, Stan, Foxtel, Binge, NITV, Screen Australia.

Return ONLY a JSON array — no prose, no markdown fences. Each item:
{
  "category": "COMMISSION" | "RATINGS" | "FORMAT TREND" | "INDUSTRY NEWS",
  "headline": "8-14 word trade-press headline",
  "summary": "2 sentences with concrete detail (titles, prodcos, episode counts, audience numbers)",
  "broadcaster": "Network or org name",
  "published_date": "YYYY-MM-DD within the last 30 days",
  "source_url": null
}`;

async function runSearch() {
  try {
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "Generate 8 items now." },
        ],
      }),
    });

    if (!aiRes.ok) {
      console.error("AI gateway error:", aiRes.status, await aiRes.text());
      return;
    }

    const aiJson = await aiRes.json();
    const raw: string = aiJson?.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

    let items: any[];
    try {
      items = JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON parse failed:", e, "raw:", raw.slice(0, 300));
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      console.error("AI did not return an array");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const rows = items
      .filter((i) => i && i.headline && ALLOWED_CATEGORIES.includes(i.category))
      .map((i) => ({
        category: i.category,
        headline: String(i.headline).slice(0, 300),
        summary: String(i.summary || "").slice(0, 1200),
        broadcaster: String(i.broadcaster || "").slice(0, 120),
        published_date:
          i.published_date && /^\d{4}-\d{2}-\d{2}$/.test(i.published_date)
            ? i.published_date
            : today,
        source_url: i.source_url ?? null,
      }));

    if (rows.length === 0) {
      console.error("No valid rows after filtering");
      return;
    }

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/market_radar_items`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(rows),
    });

    if (!insertRes.ok) {
      console.error("Insert failed:", insertRes.status, await insertRes.text());
    } else {
      console.log(`Inserted ${rows.length} market_radar_items`);
    }
  } catch (e) {
    console.error("runSearch crash:", e);
  }
}

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // @ts-ignore EdgeRuntime is provided by Supabase Functions runtime
  EdgeRuntime.waitUntil(runSearch());

  return new Response(
    JSON.stringify({ status: "started", message: "Market radar search running in background." }),
    {
      status: 202,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
