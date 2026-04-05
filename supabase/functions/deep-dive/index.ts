import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, logline, format, targetBroadcaster, genre } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an experienced unscripted television development executive with deep knowledge of the Australian and international broadcast landscape. You analyze documentary and factual entertainment concepts and produce structured research reports.

You MUST respond with a valid JSON object using this exact structure:
{
  "competitiveLandscape": "Analysis of similar shows, what's worked, what hasn't, and where this concept sits in the market",
  "commissionerFit": "How well this concept fits the target broadcaster's brand, audience, and commissioning priorities",
  "audience": "Target demographic, viewing habits, and potential reach",
  "talentAccess": "Key talent requirements, access challenges, and production feasibility",
  "verdict": "GREENLIGHT" or "DEVELOP FURTHER" or "PASS",
  "verdictRationale": "Clear reasoning for the verdict in 2-3 sentences"
}

Be specific, insightful, and reference real comparable shows and broadcasters where possible. Be honest — not every idea deserves a GREENLIGHT.`;

    const userPrompt = `Analyze this unscripted television concept:

Title: ${title}
Logline: ${logline}
Format: ${format}
Target Broadcaster: ${targetBroadcaster}
Genre: ${genre}

Produce your Deep Dive research report.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "deep_dive_report",
              description: "Generate a structured deep dive research report for a TV concept",
              parameters: {
                type: "object",
                properties: {
                  competitiveLandscape: { type: "string", description: "Analysis of similar shows and market positioning" },
                  commissionerFit: { type: "string", description: "How well this fits the target broadcaster" },
                  audience: { type: "string", description: "Target demographic and reach analysis" },
                  talentAccess: { type: "string", description: "Talent requirements and production feasibility" },
                  verdict: { type: "string", enum: ["GREENLIGHT", "DEVELOP FURTHER", "PASS"] },
                  verdictRationale: { type: "string", description: "Reasoning for the verdict" },
                },
                required: ["competitiveLandscape", "commissionerFit", "audience", "talentAccess", "verdict", "verdictRationale"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "deep_dive_report" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again shortly" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted — add funds in Settings > Workspace > Usage" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const report = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Deep dive error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
