import { useDevSlate } from '@/context/DevSlateContext';
import { PipelineIdea, SLATE_CONFIGS, SlateId } from '@/types/devslate';
import { Loader2, FileText, Telescope, Eye, ArrowRight, Hammer } from 'lucide-react';
import { useState, useMemo } from 'react';
import { DeepDiveModal } from './DeepDiveModal';
import { UnsplashImage } from './UnsplashImage';
import { getGenrePillColor, extractWhyNow, getIdeaMeta } from '@/lib/idea-meta';

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
  ...SLATE_CONFIGS.map(c => ({ id: c.id, label: c.label })),
];

function PipelineCard({
  idea, onDeepDive, onViewResearch, onSendToBuildRoom, onViewBuildRoom, isLoading,
}: {
  idea: PipelineIdea;
  onDeepDive: () => void;
  onViewResearch: () => void;
  onSendToBuildRoom: () => void;
  onViewBuildRoom: () => void;
  isLoading: boolean;
}) {
  const hasReport = idea.report != null;
  const verdictKey = idea.report?.verdict;
  const canBuild = verdictKey === 'GREENLIGHT' || verdictKey === 'DEVELOP FURTHER';
  const isBuilt = idea.status === 'built' || idea.status === 'complete' || idea.status === 'building';
  const meta = getIdeaMeta(idea);
  const whyNow = extractWhyNow(idea);

  const borderClass = hasReport ? `border-l-4 ${VERDICT_BORDER[verdictKey!]}` : 'border-l-4 border-l-border';

  return (
    <div className={`relative flex w-full bg-card rounded-2xl border border-border overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${borderClass}`}>
      {/* Image panel — 45% */}
      <div className="relative w-[45%] shrink-0 overflow-hidden">
        <UnsplashImage genre={idea.genre} keyword={idea.title} orientation="landscape" logline={idea.logline} className="absolute inset-0 w-full h-full object-cover" alt={idea.title} />
        {isBuilt && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-teal-600 text-primary-foreground text-xs font-bold">BUILT</div>
        )}
      </div>

      {/* Info panel — 55% */}
      <div className="w-[55%] p-8 flex flex-col justify-between">
        <div>
          <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm mb-4 ${getGenrePillColor(idea.genre)}`}>
            {idea.genre}
          </span>

          <div className="flex items-center gap-2.5 mb-3">
            {hasReport && (
              <span className={`w-3 h-3 rounded-full shrink-0 ${VERDICT_DOT[verdictKey!]}`} />
            )}
            <h3 className="text-[32px] font-extrabold text-foreground leading-tight">{idea.title}</h3>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{idea.format} · {idea.targetBroadcaster}</p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">{idea.logline}</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Format', value: meta.format },
              { label: 'Funding Path', value: meta.fundingPath },
              { label: 'Comparable Shows', value: meta.comparables },
              { label: 'Production Complexity', value: meta.complexity },
            ].map(stat => (
              <div key={stat.label} className="bg-muted/40 rounded-lg p-3">
                <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-[13px] font-semibold text-foreground leading-snug">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Why Now?</p>
            <p className="text-sm text-foreground leading-relaxed italic">{whyNow}</p>
          </div>
        </div>

        {/* Divider + Action buttons */}
        <div className="border-t border-border pt-5 mt-6">
          <div className="flex items-center gap-3 flex-wrap">
            {idea.status === 'swiped' && (
              <button onClick={(e) => { e.stopPropagation(); onDeepDive(); }}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-amber-500 text-primary-foreground text-sm font-bold hover:scale-105 transition-transform">
                <Telescope className="w-4 h-4" /> Deep Dive
              </button>
            )}
            {idea.status === 'researching' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" /> Researching…
              </div>
            )}
            {idea.status === 'researched' && hasReport && (
              <>
                <button onClick={(e) => { e.stopPropagation(); onViewResearch(); }}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-verdict-green text-primary-foreground text-sm font-bold hover:scale-105 transition-transform ${!canBuild ? 'flex-1' : ''}`}>
                  <Eye className="w-4 h-4" /> View Research
                </button>
                {canBuild && (
                  <button onClick={(e) => { e.stopPropagation(); onSendToBuildRoom(); }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-amber-500 text-primary-foreground text-sm font-bold hover:scale-105 transition-transform">
                    Send to Build Room <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
            {isBuilt && hasReport && (
              <>
                <button onClick={(e) => { e.stopPropagation(); onViewResearch(); }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-verdict-green text-primary-foreground text-sm font-bold hover:scale-105 transition-transform">
                  <Eye className="w-4 h-4" /> View Research
                </button>
                <button onClick={(e) => { e.stopPropagation(); onViewBuildRoom(); }}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-slate-700 text-primary-foreground text-sm font-bold hover:scale-105 transition-transform">
                  <Hammer className="w-4 h-4" /> View in Build Room <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PipelineView() {
  const { slates, updatePipelineIdea, sendToBuildRoom, setCurrentView } = useDevSlate();
  const [activeTab, setActiveTab] = useState<'all' | SlateId>('all');
  const [selectedIdea, setSelectedIdea] = useState<PipelineIdea | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const allPipelineIdeas = useMemo(() => {
    return SLATE_CONFIGS.flatMap(c => slates[c.id].pipeline);
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

  const handleSendToBuildRoom = (idea: PipelineIdea) => {
    sendToBuildRoom(idea.slateId, idea.id);
    setCurrentView('buildroom');
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
              onSendToBuildRoom={() => handleSendToBuildRoom(idea)}
              onViewBuildRoom={() => setCurrentView('buildroom')}
            />
          ))}
        </div>
      )}

      {selectedIdea?.report && (
        <DeepDiveModal
          idea={selectedIdea}
          report={selectedIdea.report}
          onClose={() => setSelectedIdea(null)}
        />
      )}
    </>
  );
}
