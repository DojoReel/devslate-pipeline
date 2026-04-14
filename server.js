import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "pitchfire-api" });
});

// ─── DEEP DIVE ENDPOINT ──────────────────────────────────────────────────────
// POST /deep-dive
// Body: { ideaId, title, hook, logline, genre, location, whyNow, peopleAccess,
//         archiveStatus, rightsStatus, comparables, commissionCheck, sources }
app.post("/deep-dive", async (req, res) => {
  const idea = req.body;

  if (!idea || !idea.title) {
    return res.status(400).json({ error: "idea is required" });
  }

  try {
    // STEP 1: Research agent with web search
    const researchResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      system: `You are a senior documentary development researcher for an Australian production company.

Research the following story idea thoroughly using web search. Search specifically for:
- The named people, places and events — verify they are real and findable
- Screen Australia production and development database
- ABC, SBS, Stan, Foxtel, NITV recent commissioning announcements
- IF Magazine and Screen Hub for recent greenlight news
- International documentary versions of similar stories
- Archive holders and rights situations
- State screen agency funding (Screen NSW, Screen Queensland, Screen Tasmania, VicScreen, SAFC etc)
- Coronial inquest findings, court records, FOI releases relevant to the story

Write up your findings in detailed prose. Be specific — name your sources, name the people you found, describe what archive exists, note any Australian or international commissions. Do not write JSON — just write everything you found in clear paragraphs.`,
      messages: [
        {
          role: "user",
          content: `Research this documentary story idea thoroughly:

TITLE: ${idea.title}
HOOK: ${idea.hook}
STORY: ${idea.logline}
GENRE: ${idea.genre}
LOCATION: ${idea.location}
WHY NOW: ${idea.whyNow}
PEOPLE & ACCESS: ${idea.peopleAccess}
ARCHIVE: ${idea.archiveStatus}
RIGHTS: ${idea.rightsStatus}
COMPARABLES: ${idea.comparables}
COMMISSION CHECK: ${idea.commissionCheck}
SOURCES: ${idea.sources}

Search extensively before writing your findings.`,
        },
      ],
    });

    // Extract research text from all text blocks
    const researchText = researchResponse.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    if (!researchText) throw new Error("No research findings returned");

    // STEP 2: Format into structured report JSON
    const formatResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: `You are a data formatter. You receive documentary research findings and format them into a specific JSON structure.
Output ONLY raw JSON. No markdown. No backticks. No explanation. No preamble. Start with { and end with }.`,
      messages: [
        {
          role: "user",
          content: `Format these research findings into this exact JSON structure:

RESEARCH FINDINGS:
${researchText}

ORIGINAL IDEA:
Title: ${idea.title}
Hook: ${idea.hook}
Genre: ${idea.genre}
Location: ${idea.location}

OUTPUT THIS JSON (raw JSON only, no markdown):
{
  "verdict": "GREENLIGHT or DEVELOP FURTHER or PASS",
  "verdictReason": "2-3 sentences explaining verdict based on research",
  "storyVerified": true or false,
  "verifiedDetail": "What was verified and how",
  "fullStory": "3-5 sentences of verified specific detail",
  "people": "Named people, access assessment, prior media coverage",
  "archive": "What archive exists, who owns it",
  "rightsDetail": "Specific rights situation detail",
  "commissionCheck": "Australian and international commission findings",
  "broadcasterFit": "Specific broadcaster fit with reasoning based on commissioning history",
  "formatRecommendation": "Recommended format with reasoning",
  "whyNow": "Specific case for making this now",
  "redFlags": "Any red flags — legal, ethical, access. null if none.",
  "sources": "Sources consulted during research"
}

VERDICT LOGIC:
- PASS (automatic): Same story commissioned in Australia in last 24 months
- GREENLIGHT: Strong story, clear access, broadcaster fit, no major red flags
- DEVELOP FURTHER: Good story but red flags or access issues need resolving
- PASS: Fails qualification or no broadcaster fit`,
        },
      ],
    });

    const formatText = formatResponse.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    const jsonMatch = formatText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not extract JSON from format response");

    const report = JSON.parse(jsonMatch[0]);

    // STEP 3: Save to Supabase if ideaId provided
    if (idea.ideaId) {
      await supabase.from("deep_dive_reports").insert({
        idea_id: idea.ideaId,
        verdict: report.verdict,
        verdict_reason: report.verdictReason,
        story_verified: report.storyVerified,
        verified_detail: report.verifiedDetail,
        full_story: report.fullStory,
        people: report.people,
        archive: report.archive,
        rights_detail: report.rightsDetail,
        commission_check: report.commissionCheck,
        broadcaster_fit: report.broadcasterFit,
        format_recommendation: report.formatRecommendation,
        why_now: report.whyNow,
        red_flags: report.redFlags,
        sources: report.sources,
        generated_at: new Date().toISOString(),
      });
    }

    res.json({ success: true, report });
  } catch (err) {
    console.error("Deep dive error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── BUILD ROOM ENDPOINT ─────────────────────────────────────────────────────
// POST /build-room
// Body: { ideaId, title, hook, logline, genre, location, report }
app.post("/build-room", async (req, res) => {
  const { ideaId, title, hook, logline, genre, location, report } = req.body;

  if (!title || !report) {
    return res.status(400).json({ error: "title and report are required" });
  }

  const DOCUMENTS = [
    {
      type: "one_pager",
      label: "One Pager",
      prompt: `Write a compelling one-page pitch document for this documentary idea. Include: logline, story overview, why now, broadcaster fit, format recommendation, and production approach. Tone: professional, compelling, commissioner-ready.`,
    },
    {
      type: "series_bible",
      label: "Series Bible",
      prompt: `Write a detailed series bible for this documentary. Include: series overview, episode breakdown, character profiles, story arc, visual approach, comparable series, and target audience. Make it production-ready.`,
    },
    {
      type: "director_treatment",
      label: "Director Treatment",
      prompt: `Write a director's treatment for this documentary. Include: vision statement, visual language, tone, approach to subjects, archive strategy, music approach, and why this story must be told now. First person, passionate, specific.`,
    },
    {
      type: "budget_overview",
      label: "Budget Overview",
      prompt: `Write a high-level budget overview for this documentary production. Include: development costs, pre-production, production, post-production, delivery. Use Australian dollar estimates appropriate for the format. Include notes on funding pathways and co-production opportunities.`,
    },
    {
      type: "funding_strategy",
      label: "Funding Strategy",
      prompt: `Write a funding strategy for this documentary. Include: primary broadcaster target, Screen Australia pathway, state screen agency opportunities, international co-production potential, presales strategy, and development funding sources. Be specific to Australian funding landscape.`,
    },
    {
      type: "pitch_email",
      label: "Commissioner Pitch Email",
      prompt: `Write a short, punchy pitch email to a commissioner at the primary target broadcaster. Include: subject line, opening hook, one paragraph pitch, format and timing, and call to action. Maximum 200 words. Make it irresistible.`,
    },
  ];

  const results = [];

  for (const doc of DOCUMENTS) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: `You are a senior television development producer specialising in Australian unscripted and documentary content. You write world-class pitch documents that get greenlighted. Your writing is specific, compelling, and grounded in real production knowledge.`,
        messages: [
          {
            role: "user",
            content: `${doc.prompt}

STORY DETAILS:
Title: ${title}
Hook: ${hook}
Story: ${logline}
Genre: ${genre}
Location: ${location}

DEEP DIVE RESEARCH FINDINGS:
Verdict: ${report.verdict}
Full Story: ${report.fullStory}
People & Access: ${report.people}
Archive: ${report.archive}
Broadcaster Fit: ${report.broadcasterFit}
Format Recommendation: ${report.formatRecommendation}
Why Now: ${report.whyNow}
${report.redFlags ? `Red Flags: ${report.redFlags}` : ""}

Write the document now. Be specific, use the research findings, make it production-ready.`,
          },
        ],
      });

      const content = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");

      // Save to Supabase if ideaId provided
      if (ideaId) {
        await supabase.from("build_room_documents").insert({
          idea_id: ideaId,
          document_type: doc.type,
          label: doc.label,
          content,
          status: "complete",
        });
      }

      results.push({ documentType: doc.type, label: doc.label, content, status: "complete" });
    } catch (err) {
      console.error(`Build room error for ${doc.type}:`, err);
      results.push({ documentType: doc.type, label: doc.label, content: "", status: "error" });
    }
  }

  res.json({ success: true, documents: results });
});

// ─── RESEARCH AGENT ENDPOINT ─────────────────────────────────────────────────
// POST /research
// Body: { slateId, genre, brief? }
app.post("/research", async (req, res) => {
  const { slateId, genre, brief } = req.body;

  if (!slateId) {
    return res.status(400).json({ error: "slateId is required" });
  }

  const GENRE_SOURCES = {
    crime: "court records, coronial inquiries, investigative journalism, AFP and state police media releases, legal aid reports, ICAC findings, true crime journalism",
    environment: "scientific journals, CSIRO reports, environmental NGO publications, ABC rural coverage, conservation organisation databases, climate research, corporate regulatory filings",
    sport: "sports journalism archives, athlete memoirs, club histories, sports tribunal records, peak body reports, community sport organisations",
    culture: "arts organisations, cultural institutions, community groups, ABC arts coverage, state library archives, festival programs",
    character: "local and regional newspapers, community Facebook groups, obituaries, ABC local radio archives, local council records",
    political: "ICAC and integrity commission reports, parliament Hansard, ABC political journalism, planning tribunal records, FOI releases",
    history: "national and state archives, AIATSIS, university research databases, museum collections, ABC archives, documentary Australia",
    science: "academic research databases, NHMRC grant records, university media releases, CSIRO, Australian research journals",
    social: "community legal centres, welfare organisations, housing advocacy groups, ABC investigations, social research institutes",
    firstnations: "AIATSIS, land council reports, NITV, ABC Indigenous, native title tribunal records, community media organisations",
    custom: "news archives, academic research, community forums, podcasts, local journalism, court records, FOI releases",
  };

  const sources = GENRE_SOURCES[slateId] || GENRE_SOURCES.custom;
  const searchBrief = brief || `Find real, specific, untold or underdeveloped ${genre || slateId} documentary stories from Australian and international sources`;

  try {
    // Research agent
    const researchResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      system: `You are a documentary research agent finding real, specific, producible stories for an Australian production company.

Your job is to find 3-5 real stories that have strong documentary potential. Search both:
1. KNOWN SOURCES for this genre: ${sources}
2. UNEXPECTED SOURCES: local newspapers, obituaries, FOI releases, academic fieldwork, planning tribunal records, coronial inquests, niche forums, hyperlocal journalism

For each story you find, assess it against these qualification gates:
- Gate 1: Real and specific — named person, place, event or asset. Verifiable.
- Gate 2: Producible — access is plausible, not already in production, rights navigable
- Gate 3: Documentary shape — clear narrative arc, visual world, central character
- Gate 4: Broadcaster relevance — fits at least one Australian broadcaster
- Gate 5: Hasn't been done — no direct Australian version, or fresh angle identified

Only return stories that pass all gates. Write your findings as detailed prose.`,
      messages: [
        {
          role: "user",
          content: `${searchBrief}

Search extensively across multiple sources. Find real, specific stories with named people and verifiable details. Assess each against the qualification gates. Return only stories that pass all gates with enough detail to create a discovery card.`,
        },
      ],
    });

    const researchText = researchResponse.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    // Format into discovery cards
    const formatResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: `You are a data formatter. Convert research findings into discovery card JSON. Output ONLY a raw JSON array. No markdown. No backticks. Start with [ and end with ].`,
      messages: [
        {
          role: "user",
          content: `Convert these research findings into discovery cards:

${researchText}

Output a JSON array of cards. Each card:
{
  "title": "Specific story title — the story, not a show concept",
  "hook": "One sentence specific hook with named people and places",
  "logline": "2-3 sentences of specific verified story detail",
  "format": "Suggested format e.g. 90min Feature Documentary",
  "targetBroadcaster": "Primary broadcaster target",
  "genre": "Primary genre e.g. Crime × First Nations",
  "slateId": "${slateId}",
  "location": "Specific location and character e.g. Bourke, NSW — Remote outback",
  "whyNow": "Specific reason to make this now",
  "peopleAccess": "Named people and access assessment",
  "archiveStatus": "What archive exists specifically",
  "rightsStatus": "Rights situation assessment",
  "comparables": "Comparable formats — what exists, what angle remains",
  "commissionCheck": "Commission check findings",
  "sources": "Sources found during research"
}

Only include stories that pass all qualification gates. Return between 2 and 5 cards.`,
        },
      ],
    });

    const formatText = formatResponse.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    const jsonMatch = formatText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not extract ideas from research");

    const ideas = JSON.parse(jsonMatch[0]);

    // Save qualified ideas to Supabase
    const savedIdeas = [];
    for (const idea of ideas) {
      const { data, error } = await supabase
        .from("ideas")
        .insert({
          title: idea.title,
          hook: idea.hook,
          logline: idea.logline,
          format: idea.format,
          target_broadcaster: idea.targetBroadcaster,
          genre: idea.genre,
          slate_id: idea.slateId,
          location: idea.location,
          why_now: idea.whyNow,
          people_access: idea.peopleAccess,
          archive_status: idea.archiveStatus,
          rights_status: idea.rightsStatus,
          comparables: idea.comparables,
          commission_check: idea.commissionCheck,
          sources: idea.sources,
          verified: true,
          qualification_score: 5,
        })
        .select()
        .single();

      if (!error && data) savedIdeas.push(data);
    }

    res.json({ success: true, ideas: savedIdeas, count: savedIdeas.length });
  } catch (err) {
    console.error("Research agent error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pitchfire API running on port ${PORT}`);
});
