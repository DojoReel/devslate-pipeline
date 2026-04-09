import { useDevSlate } from '@/context/DevSlateContext';
import { PipelineIdea, BuildRoomDocument, SLATE_CONFIGS } from '@/types/devslate';
import { Loader2, FileText, ChevronRight, Hammer } from 'lucide-react';
import { useState } from 'react';
import { DeepDiveModal } from './DeepDiveModal';
import { BuildRoomModal } from './BuildRoomModal';

const DOC_TYPES = [
  { type: 'pitchDocument', label: 'Pitch Document' },
  { type: 'budgetEstimate', label: 'Budget Estimate' },
  { type: 'productionSchedule', label: 'Production Schedule' },
  { type: 'keyContacts', label: 'Key Contacts' },
  { type: 'fundingSources', label: 'Funding Sources' },
  { type: 'sponsorshipDeck', label: 'Sponsorship Deck' },
];

const SLATE_BORDER_COLORS: Record<string, string> = {
  'abc': 'border-l-slate_accent-abc',
  'stan': 'border-l-slate_accent-stan',
  'sport': 'border-l-slate_accent-sport',
  'international': 'border-l-slate_accent-international',
  'custom': 'border-l-slate_accent-custom',
};

export function PipelineView() {
  const { activeSlate, slates, updatePipelineIdea } = useDevSlate();
  const slate = slates[activeSlate];
  const [selectedIdea, setSelectedIdea] = useState<PipelineIdea | null>(null);
  const [buildRoomIdea, setBuildRoomIdea] = useState<PipelineIdea | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [buildDocs, setBuildDocs] = useState<BuildRoomDocument[]>([]);

  const runDeepDive = async (idea: PipelineIdea) => {
    setLoadingId(idea.id);
    updatePipelineIdea(activeSlate, idea.id, { status: 'researching' });
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deep-dive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          title: idea.title, logline: idea.logline, format: idea.format,
          targetBroadcaster: idea.targetBroadcaster, genre: idea.genre,
        }),
      });
      if (!response.ok) throw new Error('Deep dive failed');
      const report = await response.json();
      updatePipelineIdea(activeSlate, idea.id, {
        status: 'researched',
        report: { ...report, ideaId: idea.id, generatedAt: new Date().toISOString() },
      });
    } catch (err) {
      console.error('Deep dive error:', err);
      updatePipelineIdea(activeSlate, idea.id, { status: 'swiped' });
    } finally {
      setLoadingId(null);
    }
  };

  const runBuildRoom = async (idea: PipelineIdea) => {
    if (!idea.report) return;
    setBuildingId(idea.id);
    updatePipelineIdea(activeSlate, idea.id, { status: 'building' });
    const initialDocs: BuildRoomDocument[] = DOC_TYPES.map(d => ({
      documentType: d.type, label: d.label, content: '', status: 'pending' as const,
    }));
    setBuildDocs(initialDocs);
    setBuildRoomIdea(idea);
    const ideaPayload = {
      title: idea.title, logline: idea.logline, format: idea.format,
      targetBroadcaster: idea.targetBroadcaster, genre: idea.genre,
    };
    const completedDocs: BuildRoomDocument[] = [...initialDocs];
    for (let i = 0; i < DOC_TYPES.length; i++) {
      const dt = DOC_TYPES[i];
      completedDocs[i] = { ...completedDocs[i], status: 'generating' };
      setBuildDocs([...completedDocs]);
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/build-room`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ idea: ideaPayload, report: idea.report, documentType: dt.type }),
        });
        if (!response.ok) throw new Error(`Failed: ${dt.label}`);
        const result = await response.json();
        completedDocs[i] = { ...completedDocs[i], content: result.content, status: 'complete' };
      } catch (err) {
        console.error(`Build room error for ${dt.type}:`, err);
        completedDocs[i] = { ...completedDocs[i], status: 'error' };
      }
      setBuildDocs([...completedDocs]);
    }
    updatePipelineIdea(activeSlate, idea.id, { status: 'complete', buildRoomDocs: completedDocs });
    setBuildingId(null);
  };

  if (slate.pipeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <p className="text-lg font-semibold text-foreground">Pipeline empty</p>
        <p className="text-sm mt-1">Swipe ideas right in Discover to add them here</p>
      </div>
    );
  }

  const borderColor = SLATE_BORDER_COLORS[activeSlate] || 'border-l-primary';

  const canBuild = (idea: PipelineIdea) =>
    idea.report && (idea.report.verdict === 'GREENLIGHT' || idea.report.verdict === 'DEVELOP FURTHER') &&
    idea.status === 'researched';

  return (
    <>
      <div className="grid gap-4 animate-fade-in">
        {slate.pipeline.map(idea => (
          <div
            key={idea.id}
            className={`p-5 rounded-xl bg-card border border-border border-l-4 ${borderColor} transition-all hover:card-shadow-lg cursor-pointer`}
            onClick={() => {
              if (idea.buildRoomDocs) { setBuildDocs(idea.buildRoomDocs); setBuildRoomIdea(idea); }
              else if (idea.report) setSelectedIdea(idea);
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-lg leading-snug">{idea.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{idea.logline}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <span>{idea.format}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>{idea.targetBroadcaster}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Verdict badge */}
                {idea.report && (
                  <span className={`px-3 py-1 rounded-md text-xs font-bold text-white ${
                    idea.report.verdict === 'GREENLIGHT' ? 'bg-verdict-green' :
                    idea.report.verdict === 'DEVELOP FURTHER' ? 'bg-verdict-amber' :
                    'bg-verdict-red'
                  }`}>
                    {idea.report.verdict}
                  </span>
                )}
                {idea.status === 'complete' && (
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-primary text-primary-foreground">BUILT</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
              {idea.status === 'swiped' && (
                <button
                  onClick={(e) => { e.stopPropagation(); runDeepDive(idea); }}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Deep Dive
                </button>
              )}
              {idea.status === 'researching' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Researching…
                </div>
              )}
              {canBuild(idea) && (
                <button
                  onClick={(e) => { e.stopPropagation(); runBuildRoom(idea); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Hammer className="w-3.5 h-3.5" />
                  Build Room
                </button>
              )}
              {idea.status === 'building' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Building…
                </div>
              )}
              {(idea.report || idea.buildRoomDocs) && (
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedIdea?.report && (
        <DeepDiveModal idea={selectedIdea} report={selectedIdea.report} onClose={() => setSelectedIdea(null)} />
      )}
      {buildRoomIdea?.report && (
        <BuildRoomModal
          idea={buildRoomIdea} report={buildRoomIdea.report} documents={buildDocs}
          isGenerating={buildingId !== null} onClose={() => { setBuildRoomIdea(null); setBuildingId(null); }}
        />
      )}
    </>
  );
}
