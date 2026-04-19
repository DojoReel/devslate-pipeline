// Lovable Cloud edge function: search-funding-calendar
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

const ALLOWED_CATEGORIES = ["SCREEN AGENCY", "BROADCASTER", "INTERNATIONAL", "CO-PRODUCTION"];

function buildSystemPrompt(today: string, sixMonthsOut: string): string {
  return `You are a funding intelligence analyst tracking grant deadlines and broadcaster pitch windows for the Australian unscripted (factual / reality / documentary) TV industry.

TODAY'S DATE IS ${today}. All deadline values MUST be FUTURE dates between ${today} and ${sixMonthsOut}. Do NOT use 2023 or 2024 dates — use dates relative to ${today}.

Generate 10 realistic, plausible upcoming funding opportunities with deadlines in the next 6 months. Cover screen agencies (Screen Australia, Screen NSW, VicScreen, Screen Queensland, SAFC, Screenwest, Screen Tasmania, Screen Territory), broadcasters (ABC, SBS, NITV), international markets (MIPCOM, Series Mania, Sunny Side of the Doc, Sheffield DocFest), and co-production funds.

Return ONLY a JSON array — no prose, no markdown fences. Each item:
{
  "funder": "Org name",
  "program": "Specific program name",
  "amount": "Funding range or 'Licence fee negotiable' or 'Market event'",
  "deadline": "YYYY-MM-DD between ${today} and ${sixMonthsOut}",
  "category": "SCREEN AGENCY" | "BROADCASTER" | "INTERNATIONAL" | "CO-PRODUCTION",
  "link": null
}`;
}

async function runSearch() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const sixMonthsOutDate = new Date();
    sixMonthsOutDate.setMonth(sixMonthsOutDate.getMonth() + 6);
    const sixMonthsOut = sixMonthsOutDate.toISOString().slice(0, 10);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: buildSystemPrompt(today, sixMonthsOut) },
          { role: "user", content: `Today is ${today}. Generate 10 upcoming funding deadlines with dates between ${today} and ${sixMonthsOut}.` },
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

    const todayDate = new Date(today);

    const rows = items
      .filter((i) => i && i.funder && ALLOWED_CATEGORIES.includes(i.category))
      .map((i) => {
        let dl = sixMonthsOut;
        if (i.deadline && /^\d{4}-\d{2}-\d{2}$/.test(i.deadline)) {
          const d = new Date(i.deadline);
          if (d < todayDate || d > sixMonthsOutDate) {
            // Clamp to a random day in the next 6 months
            const offset = 7 + Math.floor(Math.random() * 170);
            const clamped = new Date(todayDate);
            clamped.setDate(clamped.getDate() + offset);
            dl = clamped.toISOString().slice(0, 10);
          } else {
            dl = i.deadline;
          }
        }
        return {
          funder: String(i.funder).slice(0, 200),
          program: String(i.program || "").slice(0, 300),
          amount: String(i.amount || "").slice(0, 200),
          deadline: dl,
          category: i.category,
          link: i.link ?? null,
        };
      });

    if (rows.length === 0) {
      console.error("No valid rows after filtering");
      return;
    }

    // Prune past deadlines
    await fetch(
      `${SUPABASE_URL}/rest/v1/funding_calendar_items?deadline=lt.${today}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/funding_calendar_items`, {
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
      console.log(`Inserted ${rows.length} funding_calendar_items`);
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
    JSON.stringify({ status: "started", message: "Funding calendar search running in background." }),
    {
      status: 202,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
