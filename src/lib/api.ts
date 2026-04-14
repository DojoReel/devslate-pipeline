const API_BASE = 'https://pitchfire-api-production.up.railway.app';

export async function runDeepDive(idea: any): Promise<any> {
  const response = await fetch(`${API_BASE}/deep-dive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ideaId: idea.id,
      title: idea.title,
      hook: idea.hook,
      logline: idea.logline,
      genre: idea.genre,
      location: idea.location,
      whyNow: idea.whyNow,
      peopleAccess: idea.peopleAccess,
      archiveStatus: idea.archiveStatus,
      rightsStatus: idea.rightsStatus,
      comparables: idea.comparables,
      commissionCheck: idea.commissionCheck,
      sources: idea.sources,
    }),
  });
  if (!response.ok) throw new Error('Deep dive request failed');
  const data = await response.json();
  return data.report;
}

export async function runBuildRoomDocument(idea: any, report: any, documentType: string): Promise<{ content: string }> {
  const response = await fetch(`${API_BASE}/build-room`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ideaId: idea.id,
      title: idea.title,
      hook: idea.hook,
      logline: idea.logline,
      genre: idea.genre,
      location: idea.location,
      report,
    }),
  });
  if (!response.ok) throw new Error('Build room request failed');
  const data = await response.json();
  return data.documents;
}
