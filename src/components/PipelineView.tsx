import { useDevSlate } from '@/context/DevSlateContext';
import { PipelineIdea, BuildRoomDocument, SLATE_CONFIGS, SlateId } from '@/types/devslate';
import { Loader2, FileText, Telescope, Eye, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { DeepDiveModal } from './DeepDiveModal';
import { BuildRoomModal } from './BuildRoomModal';
import { UnsplashImage } from './UnsplashImage';

const DOC_TYPES = [
  { type: 'pitchDocument', label: 'Pitch Document' },
  { type: 'budgetEstimate', label: 'Budget Estimate' },
  { type: 'productionSchedule', label: 'Production Schedule' },
  { type: 'keyContacts', label: 'Key Contacts' },
  { type: 'fundingSources', label: 'Funding Sources' },
  { type: 'sponsorshipDeck', label: 'Sponsorship Deck' },
];

const VERDICT_BORDER: Record<string, string> = {
  'GREENLIGHT': 'border-l-verdict-green',
  'DEVELOP FURTHER': 'border-l-verdict-amber',
  'PASS': 'border-l-verdict-red',
};

const VERDICT_DOT: Record<string, string> = {
  'GREENLIGHT': 'bg-verdict-green',
  'DEVELOP FURTHER': 'bg-verdict-amber',
  'PASS': 'bg-verdict-red',
};

const TAB_OPTIONS: { id: 'all' | SlateId; label: string }[] = [
  { id: 'all', label: 'Show All' },
  ...SLATE_CONFIGS.filter(c => c.id !== 'custom').map(c => ({ id: c.id, label: c.label })),
];

function PipelineCard({
  idea, onDeepDive, onViewResearch, onBuildRoom, isLoading,
}: {
  idea: PipelineIdea; onDeepDive: () => void; onViewResearch: () => void; onBuildRoom: () => void; isLoading: boolean;
}) {
  const hasReport = idea.report != null;
  const verdictKey = idea.report?.verdict;
  const canBuild = verdictKey === 'GREENLIGHT' || verdictKey === 'DEVELOP FURTHER';

  return (
    <div
      className={`flex flex-col md:flex-row bg-card rounded-2xl border overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group ${
        hasReport ? `border-l-4 ${VERDICT_BORDER[verdictKey!]} border-border` : 'border-border'
      }`}
    >
      <div className="relative w-full md:w-[45%] min-h-[250px] md:min-h-[350px] shrink-0">
        <UnsplashImage genre={idea.genre} keyword={idea.title} orientation="landscape" logline={idea.logline} className="w-full h-full object-cover" alt={idea.title} />
        {idea.status === 'complete' && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">BUILT</div>
        )}
      </div>
      <div className="flex-1 p-8 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {hasReport && (
                  <span className={`w-3 h-3 rounded-full shrink-0 ${VERDICT_DOT[verdictKey!]}`} />
                )}
                <h3 className="text-2xl font-bold text-foreground leading-tight">{idea.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{idea.format} · {idea.targetBroadcaster}</p>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{idea.logline}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">{idea.genre}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border flex-wrap">
          {idea.status === 'swiped' && (
            <button onClick={(e) => { e.stopPropagation(); onDeepDive(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:scale-105 transition-transform">
              <Telescope className="w-4 h-4" /> Deep Dive
            </button>
          )}
          {idea.status === 'researching' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Researching…
            </div>
          )}
          {(idea.status === 'researched' || idea.status === 'complete' || idea.status === 'building') && hasReport && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onViewResearch(); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-verdict-green text-primary-foreground text-sm font-bold hover:scale-105 transition-transform">
                <Eye className="w-4 h-4" /> View Research
              </button>
              {canBuild && idea.status !== 'building' && (
                <button onClick={(e) => { e.stopPropagation(); onBuildRoom(); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-verdict-amber text-primary-foreground text-sm font-bold hover:scale-105 transition-transform">
                  Send to Build Room <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}
          {idea.status === 'building' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Building…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PipelineView() {
  const { slates, updatePipelineIdea } = useDevSlate();
  const [activeTab, setActiveTab] = useState<'all' | SlateId>('all');
  const [selectedIdea, setSelectedIdea] = useState<PipelineIdea | null>(null);
  const [buildRoomIdea, setBuildRoomIdea] = useState<PipelineIdea | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [buildDocs, setBuildDocs] = useState<BuildRoomDocument[]>([]);

  // Only pipeline ideas — never include passed/Idea Bin
  const allPipelineIdeas = useMemo(() => {
    return SLATE_CONFIGS.filter(c => c.id !== 'custom').flatMap(c => slates[c.id].pipeline);
  }, [slates]);

  const filteredIdeas = activeTab === 'all'
    ? allPipelineIdeas
    : slates[activeTab].pipeline;

  const runDeepDive = async (idea: PipelineIdea) => {
    setLoadingId(idea.id);
    updatePipelineIdea(idea.slateId, idea.id, { status: 'researching' });
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deep-dive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ title: idea.title, logline: idea.logline, format: idea.format, targetBroadcaster: idea.targetBroadcaster, genre: idea.genre }),
      });
      if (!response.ok) throw new Error('Deep dive failed');
      const report = await response.json();
      updatePipelineIdea(idea.slateId, idea.id, { status: 'researched', report: { ...report, ideaId: idea.id, generatedAt: new Date().toISOString() } });
    } catch (err) {
      console.error('Deep dive error:', err);
      updatePipelineIdea(idea.slateId, idea.id, { status: 'swiped' });
    } finally { setLoadingId(null); }
  };

  const runBuildRoom = async (idea: PipelineIdea) => {
    if (!idea.report) return;
    setBuildingId(idea.id);
    updatePipelineIdea(idea.slateId, idea.id, { status: 'building' });
    const initialDocs: BuildRoomDocument[] = DOC_TYPES.map(d => ({ documentType: d.type, label: d.label, content: '', status: 'pending' as const }));
    setBuildDocs(initialDocs);
    setBuildRoomIdea(idea);
    setSelectedIdea(null);
    const ideaPayload = { title: idea.title, logline: idea.logline, format: idea.format, targetBroadcaster: idea.targetBroadcaster, genre: idea.genre };
    const completedDocs: BuildRoomDocument[] = [...initialDocs];
    for (let i = 0; i < DOC_TYPES.length; i++) {
      const dt = DOC_TYPES[i];
      completedDocs[i] = { ...completedDocs[i], status: 'generating' };
      setBuildDocs([...completedDocs]);
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/build-room`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
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
    updatePipelineIdea(idea.slateId, idea.id, { status: 'complete', buildRoomDocs: completedDocs });
    setBuildingId(null);
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {TAB_OPTIONS.map(tab => {
          const isActive = activeTab === tab.id;
          const count = tab.id === 'all' ? allPipelineIdeas.length : slates[tab.id].pipeline.length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-2 text-xs ${isActive ? 'opacity-80' : 'opacity-60'}`}>({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {filteredIdeas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-muted-foreground animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-5 shadow-md">
            <FileText className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <p className="text-xl font-bold text-foreground">Pipeline empty</p>
          <p className="text-sm mt-2 text-muted-foreground">Add ideas from Discover to start building your slate</p>
        </div>
      ) : (
        <div className="grid gap-6 animate-fade-in">
          {filteredIdeas.map(idea => (
            <PipelineCard key={idea.id} idea={idea} isLoading={loadingId === idea.id}
              onDeepDive={() => runDeepDive(idea)}
              onViewResearch={() => setSelectedIdea(idea)}
              onBuildRoom={() => runBuildRoom(idea)}
            />
          ))}
        </div>
      )}

      {selectedIdea?.report && (
        <DeepDiveModal
          idea={selectedIdea}
          report={selectedIdea.report}
          onClose={() => setSelectedIdea(null)}
          onBuildRoom={() => runBuildRoom(selectedIdea)}
        />
      )}
      {buildRoomIdea?.report && (
        <BuildRoomModal idea={buildRoomIdea} report={buildRoomIdea.report} documents={buildDocs}
          isGenerating={buildingId !== null} onClose={() => { setBuildRoomIdea(null); setBuildingId(null); }} />
      )}
    </>
  );
}
