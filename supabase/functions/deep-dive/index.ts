import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an experienced unscripted television development researcher. You analyze documentary and factual entertainment concepts and produce structured research reports with verified facts.

## RESPONSE FORMAT RULES

You MUST respond with valid JSON using this exact structure:

{
  "verdict": "GREENLIGHT or DEVELOP FURTHER or PASS",
  "verdictReason": "Clear reasoning for the verdict in 2-3 sentences",
  "storyVerified": true/false,
  "verifiedDetail": "What you were able to verify about the core story claims",
  "fullStory": "4 bullet points expanding the story — what happened, who is involved, what is the narrative arc. Use • prefix.",
  "people": "4 bullet points on key people — who are the characters, can they be accessed, are they media-ready. Use • prefix.",
  "archive": "What archive material exists — footage, documents, photos, court records. Use • prefix for 3-4 points.",
  "rightsDetail": "Rights status — who controls the story, are there competing projects, any legal issues. Use • prefix.",
  "commissionCheck": "Which Australian broadcasters/streamers would commission this and why. Use • prefix for 3-4 points.",
  "broadcasterFit": "Specific broadcaster analysis — how this fits their slate, audience, and strategy. Use • prefix.",
  "formatRecommendation": "Recommended format, episode count, duration with reasoning. 2-3 sentences.",
  "whyNow": "Why this story matters right now — cultural moment, news cycle, policy change. 2-3 sentences.",
  "redFlags": "Any concerns — legal risk, access problems, ethical issues, competing projects. Use • prefix.",
  "sources": "Key sources consulted or recommended for further research. Use • prefix."
}

Be specific, reference real comparable Australian and international shows. Be honest — not every idea deserves a GREENLIGHT.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, logline, format, targetBroadcaster, genre, hook, whyNow, peopleAccess, comparables } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const userPrompt = `Analyze this unscripted television concept:

Title: ${title}
Hook: ${hook || 'N/A'}
Logline: ${logline}
Format: ${format}
Target Broadcaster: ${targetBroadcaster}
Genre: ${genre}
Why Now: ${whyNow || 'N/A'}
People/Access: ${peopleAccess || 'N/A'}
Comparables: ${comparables || 'N/A'}

Produce your Deep Dive research report as JSON.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again shortly" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) throw new Error("No response from AI");

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    const report = JSON.parse(jsonMatch[1]!.trim());

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Deep dive error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
