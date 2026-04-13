import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DOCUMENT_PROMPTS: Record<string, string> = {
  pitchDocument: `You are a senior TV development producer. Write a compelling 1-page pitch document for this unscripted TV concept. Include: Title, Logline, Format Description, Tone & Style, Why Now (cultural relevance), Key Talent/Presenter Notes, Episode Breakdown (3-4 sample episodes), and a closing hook for commissioners. Write in professional Australian TV industry language. Output as clean formatted text with clear section headers.`,

  budgetEstimate: `You are an experienced Australian TV line producer. Create a realistic top-sheet budget estimate for this unscripted TV concept. Include major categories: Above The Line (Executive Producer, Series Producer, Director, Presenter fees), Below The Line (crew, camera, sound, edit, post-production), Production Costs (travel, locations, insurance, legal), Post-Production (edit suite, grade, sound mix, music licensing, delivery), and Contingency (10%). Use realistic AUD figures based on the format type and target broadcaster. Include per-episode and series totals. Output as clean formatted text.`,

  productionSchedule: `You are a production manager for Australian unscripted television. Create a realistic production schedule/timeline for this concept. Include phases: Development (research, casting, recce), Pre-Production (crew hire, logistics, tech prep), Production (shoot blocks, number of shoot days), Post-Production (edit, review, grade, sound, delivery). Provide week-by-week timeline with key milestones. Consider Australian seasonal factors and broadcaster delivery windows. Output as clean formatted text.`,

  keyContacts: `You are a well-connected Australian TV development executive. List the key contacts and stakeholders needed to develop this concept. Include categories: Commissioner Contacts (relevant commissioning editors at the target broadcaster), Production Companies (3-5 Australian production companies suited to this genre), Key Crew Roles (specific department heads needed), Talent/Presenter Suggestions (3-5 realistic Australian presenter options with brief rationale), Funding Bodies (Screen Australia, state agencies, etc.), and Legal/Compliance contacts needed. Use realistic Australian industry references. Output as clean formatted text.`,

  fundingSources: `You are an Australian TV financing specialist. Create a funding strategy for this concept. Include: Primary Broadcaster License Fee (estimated %), Screen Australia (documentary or multiplatform programs), State Screen Agencies (relevant state bodies based on likely production location), International Pre-Sales (territories and potential buyers), Tax Offsets (Producer Offset at 30% or PDV Offset), Gap Financing options, and a suggested financing plan showing how the budget could be fully funded. Use realistic Australian TV financing structures. Output as clean formatted text.`,

  sponsorshipDeck: `You are a TV brand partnerships specialist in the Australian market. Create a sponsorship/brand partnership deck outline for this concept. Include: Brand Alignment Opportunity (what makes this show attractive to sponsors), Target Sponsor Categories (3-5 industry categories with example brands), Integration Opportunities (in-show, digital, social media, events), Audience Value Proposition (demographics and reach), Sponsorship Tiers (Presenting Partner, Major Sponsor, Associate), Estimated CPMs and value, and Digital/Social extensions. Use realistic Australian market references. Output as clean formatted text.`,
};

const DOCUMENT_LABELS: Record<string, string> = {
  pitchDocument: "Pitch Document",
  budgetEstimate: "Budget Estimate",
  productionSchedule: "Production Schedule",
  keyContacts: "Key Contacts",
  fundingSources: "Funding Sources",
  sponsorshipDeck: "Sponsorship Deck",
};

async function generateDocument(
  apiKey: string,
  docType: string,
  idea: { title: string; logline: string; format: string; targetBroadcaster: string; genre: string; hook?: string },
  report: { verdict: string; verdictReason: string; fullStory?: string; people?: string; broadcasterFit?: string; commissionCheck?: string; whyNow?: string }
): Promise<string> {
  const userPrompt = `Generate the ${DOCUMENT_LABELS[docType]} for this TV concept:

Title: ${idea.title}
Hook: ${idea.hook || ''}
Logline: ${idea.logline}
Format: ${idea.format}
Target Broadcaster: ${idea.targetBroadcaster}
Genre: ${idea.genre}

Deep Dive Verdict: ${report.verdict}
Verdict Reason: ${report.verdictReason}
Full Story: ${report.fullStory || ''}
People & Access: ${report.people || ''}
Broadcaster Fit: ${report.broadcasterFit || ''}
Commission Check: ${report.commissionCheck || ''}
Why Now: ${report.whyNow || ''}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      system: DOCUMENT_PROMPTS[docType],
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Anthropic error for ${docType}:`, response.status, errText);
    throw new Error(`Failed to generate ${DOCUMENT_LABELS[docType]}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "Failed to generate content.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { idea, report, documentType } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    if (!idea || !report) throw new Error("Missing idea or report data");

    if (documentType) {
      if (!DOCUMENT_PROMPTS[documentType]) throw new Error(`Unknown document type: ${documentType}`);
      const content = await generateDocument(ANTHROPIC_API_KEY, documentType, idea, report);
      return new Response(JSON.stringify({ documentType, content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const docTypes = Object.keys(DOCUMENT_PROMPTS);
    const results = await Promise.all(
      docTypes.map(async (dt) => {
        try {
          const content = await generateDocument(ANTHROPIC_API_KEY, dt, idea, report);
          return { documentType: dt, label: DOCUMENT_LABELS[dt], content, status: "complete" as const };
        } catch (err) {
          console.error(`Error generating ${dt}:`, err);
          return { documentType: dt, label: DOCUMENT_LABELS[dt], content: "", status: "error" as const };
        }
      })
    );

    return new Response(JSON.stringify({ documents: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Build room error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
