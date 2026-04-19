// Lovable Cloud edge function: search-funding-calendar
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

const ALLOWED_CATEGORIES = ["SCREEN AGENCY", "BROADCASTER", "INTERNATIONAL", "CO-PRODUCTION"];

interface FundingItem {
  funder: string;
  program: string;
  amount: string;
  deadline: string;
  category: string;
  link: string | null;
}

const SYSTEM_PROMPT = `You are a funding intelligence analyst tracking grant deadlines and broadcaster pitch windows for the Australian unscripted (factual / reality / documentary) television industry.

Generate 12 realistic, plausible upcoming funding opportunities with deadlines in the next 6 months. Cover screen agencies (Screen Australia, Screen NSW, VicScreen, Screen Queensland, SAFC, Screenwest, Screen Tasmania, Screen Territory), broadcasters (ABC, SBS, NITV), international markets (MIPCOM, Series Mania, Sunny Side of the Doc, Sheffield DocFest), and co-production funds.

Return ONLY a JSON array — no prose, no markdown fences. Each item must match this shape:
{
  "funder": "Org name (e.g. Screen Australia)",
  "program": "Specific program name (e.g. Documentary Development)",
  "amount": "Funding range or 'Licence fee negotiable' or 'Market event'",
  "deadline": "YYYY-MM-DD within the next 6 months",
  "category": "SCREEN AGENCY" | "BROADCASTER" | "INTERNATIONAL" | "CO-PRODUCTION",
  "link": null
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
        { role: "user", content: "Generate 12 upcoming funding deadlines now." },
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

  let items: FundingItem[];
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
    .filter((i) => i && i.funder && ALLOWED_CATEGORIES.includes(i.category))
    .map((i) => ({
      funder: String(i.funder).slice(0, 200),
      program: String(i.program || "").slice(0, 300),
      amount: String(i.amount || "").slice(0, 200),
      deadline: i.deadline && /^\d{4}-\d{2}-\d{2}$/.test(i.deadline) ? i.deadline : today,
      category: i.category,
      link: i.link ?? null,
    }));

  if (rows.length === 0) {
    console.error("No valid rows after filtering");
    return;
  }

  // Clear stale rows so we don't accumulate duplicates each refresh
  await supabase.from("funding_calendar_items").delete().lt("deadline", today);

  const { error } = await supabase.from("funding_calendar_items").insert(rows);
  if (error) console.error("Insert failed:", error);
  else console.log(`Inserted ${rows.length} funding_calendar_items`);
}

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // @ts-ignore EdgeRuntime is provided by Supabase Functions runtime
  EdgeRuntime.waitUntil(runSearch().catch((e) => console.error("runSearch crash:", e)));

  return new Response(
    JSON.stringify({ status: "started", message: "Funding calendar search running in background." }),
    {
      status: 202,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
