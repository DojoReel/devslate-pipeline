import { useDevSlate } from '@/context/DevSlateContext';
import { PipelineIdea, BuildRoomDocument } from '@/types/devslate';
import { Loader2, FileText, Hammer, Telescope, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { DeepDiveModal } from './DeepDiveModal';
import { BuildRoomModal } from './BuildRoomModal';
import { getUnsplashUrl } from '@/hooks/useUnsplashImage';

const DOC_TYPES = [
  { type: 'pitchDocument', label: 'Pitch Document' },
  { type: 'budgetEstimate', label: 'Budget Estimate' },
  { type: 'productionSchedule', label: 'Production Schedule' },
  { type: 'keyContacts', label: 'Key Contacts' },
  { type: 'fundingSources', label: 'Funding Sources' },
  { type: 'sponsorshipDeck', label: 'Sponsorship Deck' },
];

const VERDICT_STYLES: Record<string, string> = {
  'GREENLIGHT': 'bg-verdict-green',
  'DEVELOP FURTHER': 'bg-verdict-amber',
  'PASS': 'bg-verdict-red',
};

const VERDICT_STRIPE: Record<string, string> = {
  'GREENLIGHT': 'bg-verdict-green',
  'DEVELOP FURTHER': 'bg-verdict-amber',
  'PASS': 'bg-verdict-red',
};

function PipelineCard({
  idea,
  onClickCard,
  onDeepDive,
  onBuildRoom,
  isLoading,
  isBuilding,
}: {
  idea: PipelineIdea;
  onClickCard: () => void;
  onDeepDive: () => void;
  onBuildRoom: () => void;
  isLoading: boolean;
  isBuilding: boolean;
}) {
  const imgUrl = getUnsplashUrl(idea.genre, idea.title, 600, 400);
  const canBuild =
    idea.report &&
    (idea.report.verdict === 'GREENLIGHT' || idea.report.verdict === 'DEVELOP FURTHER') &&
    idea.status === 'researched';

  return (
    <div
      onClick={onClickCard}
      className="flex flex-col md:flex-row bg-card rounded-2xl border border-border overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      {/* Image side */}
      <div className="relative w-full md:w-[280px] h-48 md:h-auto shrink-0">
        <img src={imgUrl} alt={idea.title} className="w-full h-full object-cover" loading="lazy" />
        {/* Verdict stripe */}
        {idea.report && (
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${VERDICT_STRIPE[idea.report.verdict]}`} />
        )}
        {/* Status badge overlay */}
        {idea.status === 'complete' && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            BUILT
          </div>
        )}
      </div>

      {/* Content side */}
      <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-foreground leading-tight">{idea.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{idea.logline}</p>
            </div>
            {idea.report && (
              <span className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-primary-foreground ${VERDICT_STYLES[idea.report.verdict]}`}>
                {idea.report.verdict}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">{idea.format}</span>
            <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">{idea.targetBroadcaster}</span>
            <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">{idea.genre}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
          {idea.status === 'swiped' && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeepDive(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:scale-105 transition-transform"
            >
              <Telescope className="w-4 h-4" />
              Deep Dive
            </button>
          )}
          {idea.status === 'researching' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Researching…
            </div>
          )}
          {canBuild && (
            <button
              onClick={(e) => { e.stopPropagation(); onBuildRoom(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-bold hover:scale-105 transition-transform"
            >
              <Hammer className="w-4 h-4" />
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
            <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
          )}
        </div>
      </div>
    </div>
  );
}

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
        <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-5 shadow-md">
          <FileText className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <p className="text-xl font-bold text-foreground">Pipeline empty</p>
        <p className="text-sm mt-2 text-muted-foreground">Add ideas from Discover to start building your slate</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 animate-fade-in">
        {slate.pipeline.map(idea => (
          <PipelineCard
            key={idea.id}
            idea={idea}
            isLoading={loadingId === idea.id}
            isBuilding={buildingId === idea.id}
            onClickCard={() => {
              if (idea.buildRoomDocs) { setBuildDocs(idea.buildRoomDocs); setBuildRoomIdea(idea); }
              else if (idea.report) setSelectedIdea(idea);
            }}
            onDeepDive={() => runDeepDive(idea)}
            onBuildRoom={() => runBuildRoom(idea)}
          />
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
