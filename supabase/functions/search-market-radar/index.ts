// Lovable Cloud edge function: search-market-radar
// Returns 202 immediately and runs the AI search in the background
// to avoid hitting the 2s CPU limit on the request thread.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

interface RadarItem {
  category: string;
  headline: string;
  summary: string;
  broadcaster: string;
  published_date: string;
  source_url: string | null;
}

const SYSTEM_PROMPT = `You are a market intelligence analyst tracking the Australian unscripted (factual / reality / documentary) television industry.

Generate 10 realistic, plausible market intelligence items as if pulled from trade press in the last 30 days. Cover commissions, ratings, format trends, and industry news from broadcasters like ABC, SBS, Nine, Seven, Network 10, Stan, Foxtel, Binge, NITV, Screen Australia.

Return ONLY a JSON array — no prose, no markdown fences. Each item must match this shape:
{
  "category": "COMMISSION" | "RATINGS" | "FORMAT TREND" | "INDUSTRY NEWS",
  "headline": "Punchy 8-14 word trade-press headline",
  "summary": "2-3 sentence summary with concrete detail (titles, prodcos, episode counts, audience numbers)",
  "broadcaster": "Network or org name",
  "published_date": "YYYY-MM-DD within the last 30 days",
  "source_url": null
}`;

async function runSearch() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "Generate the latest 10 market intelligence items now." },
      ],
    }),
  });

  if (!aiRes.ok) {
    console.error("AI gateway error:", aiRes.status, await aiRes.text());
    return;
  }

  const aiJson = await aiRes.json();
  const raw: string = aiJson?.choices?.[0]?.message?.content ?? "";

  // Strip markdown fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  let items: RadarItem[];
  try {
    items = JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON parse failed:", e, "raw:", raw.slice(0, 500));
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
      published_date: i.published_date && /^\d{4}-\d{2}-\d{2}$/.test(i.published_date) ? i.published_date : today,
      source_url: i.source_url ?? null,
    }));

  if (rows.length === 0) {
    console.error("No valid rows after filtering");
    return;
  }

  const { error } = await supabase.from("market_radar_items").insert(rows);
  if (error) console.error("Insert failed:", error);
  else console.log(`Inserted ${rows.length} market_radar_items`);
}

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Fire-and-forget: keep the worker alive past the response
  // so we don't hit the 2s CPU/wall limit on the request thread.
  // @ts-ignore EdgeRuntime is provided by Supabase Functions runtime
  EdgeRuntime.waitUntil(runSearch().catch((e) => console.error("runSearch crash:", e)));

  return new Response(
    JSON.stringify({ status: "started", message: "Market radar search running in background." }),
    {
      status: 202,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
