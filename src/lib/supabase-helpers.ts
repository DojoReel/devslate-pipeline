import { supabase } from '@/lib/supabase';
import { ShowIdea, PipelineIdea, DeepDiveReport, BuildRoomDocument, SlateId } from '@/types/devslate';

// Field mapping: DB snake_case → App camelCase

function dbToShowIdea(row: any): ShowIdea {
  return {
    id: row.id,
    title: row.title,
    hook: row.hook,
    logline: row.logline,
    format: row.format,
    targetBroadcaster: row.target_broadcaster,
    genre: row.genre,
    slateId: row.slate_id as SlateId,
    location: row.location,
    whyNow: row.why_now,
    peopleAccess: row.people_access,
    archiveStatus: row.archive_status,
    rightsStatus: row.rights_status,
    comparables: row.comparables,
    commissionCheck: row.commission_check,
    sources: row.sources,
  };
}

function dbToReport(row: any): DeepDiveReport {
  return {
    ideaId: row.idea_id,
    verdict: row.verdict,
    verdictReason: row.verdict_reason,
    storyVerified: row.story_verified,
    verifiedDetail: row.verified_detail,
    fullStory: row.full_story,
    people: row.people,
    archive: row.archive,
    rightsDetail: row.rights_detail,
    commissionCheck: row.commission_check,
    broadcasterFit: row.broadcaster_fit,
    formatRecommendation: row.format_recommendation,
    whyNow: row.why_now,
    redFlags: row.red_flags,
    sources: row.sources,
    generatedAt: row.generated_at,
  };
}

function dbToBuildDoc(row: any): BuildRoomDocument {
  return {
    documentType: row.document_type,
    label: row.label,
    content: row.content,
    status: row.status,
  };
}

export interface LoadedData {
  ideas: ShowIdea[];
  pipelineRows: { idea_id: string; slate_id: string; status: string; notes: string[] }[];
  decisions: { idea_id: string; decision: string }[];
  reports: Map<string, DeepDiveReport>;
  buildDocs: Map<string, BuildRoomDocument[]>;
}

export async function loadAllData(): Promise<LoadedData> {
  const [ideasRes, pipelineRes, decisionsRes, reportsRes, docsRes] = await Promise.all([
    supabase.from('ideas').select('*'),
    supabase.from('user_pipeline').select('*'),
    supabase.from('user_decisions').select('*'),
    supabase.from('deep_dive_reports').select('*'),
    supabase.from('build_room_documents').select('*'),
  ]);

  const ideas = (ideasRes.data || []).map(dbToShowIdea);
  const pipelineRows = (pipelineRes.data || []).map((r: any) => ({
    idea_id: r.idea_id,
    slate_id: r.slate_id,
    status: r.status,
    notes: r.notes || [],
  }));
  const decisions = (decisionsRes.data || []).map((r: any) => ({
    idea_id: r.idea_id,
    decision: r.decision,
  }));

  const reports = new Map<string, DeepDiveReport>();
  for (const r of reportsRes.data || []) {
    reports.set(r.idea_id, dbToReport(r));
  }

  const buildDocs = new Map<string, BuildRoomDocument[]>();
  for (const r of docsRes.data || []) {
    const ideaId = r.idea_id;
    if (!buildDocs.has(ideaId)) buildDocs.set(ideaId, []);
    buildDocs.get(ideaId)!.push(dbToBuildDoc(r));
  }

  return { ideas, pipelineRows, decisions, reports, buildDocs };
}

// Write operations
export async function insertDecision(ideaId: string, decision: string) {
  const { error } = await supabase.from('user_decisions').insert({ idea_id: ideaId, decision } as any);
  if (error) console.error('insertDecision error:', error);
}

export async function insertPipeline(ideaId: string, slateId: string, status: string) {
  const { error } = await supabase.from('user_pipeline').insert({ idea_id: ideaId, slate_id: slateId, status } as any);
  if (error) console.error('insertPipeline error:', error);
}

export async function updatePipelineStatus(ideaId: string, status: string) {
  const { error } = await supabase.from('user_pipeline').update({ status } as any).eq('idea_id', ideaId);
  if (error) console.error('updatePipelineStatus error:', error);
}

export async function upsertReport(ideaId: string, report: DeepDiveReport) {
  const { error } = await supabase.from('deep_dive_reports').upsert({
    idea_id: ideaId,
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
    generated_at: report.generatedAt,
  } as any, { onConflict: 'idea_id' });
  if (error) console.error('upsertReport error:', error);
}

export async function upsertBuildDoc(ideaId: string, doc: BuildRoomDocument) {
  const { error } = await supabase.from('build_room_documents').upsert({
    idea_id: ideaId,
    document_type: doc.documentType,
    label: doc.label,
    content: doc.content,
    status: doc.status,
  } as any, { onConflict: 'idea_id,document_type' });
  if (error) console.error('upsertBuildDoc error:', error);
}

export async function deletePipelineRow(ideaId: string) {
  const { error } = await supabase.from('user_pipeline').delete().eq('idea_id', ideaId);
  if (error) console.error('deletePipelineRow error:', error);
}

export async function clearAllDecisions() {
  const [d1, d2] = await Promise.all([
    supabase.from('user_decisions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    supabase.from('user_pipeline').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
  ]);
  if (d1.error) console.error('clearAllDecisions (decisions):', d1.error);
  if (d2.error) console.error('clearAllDecisions (pipeline):', d2.error);
}
