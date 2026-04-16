import { useDevSlate } from '@/context/DevSlateContext';
import { PipelineIdea, SLATE_CONFIGS, SlateId } from '@/types/devslate';
import { Loader2, FileText, Telescope, Eye, ArrowRight, Hammer, Archive, ArchiveRestore } from 'lucide-react';
import { useState, useMemo } from 'react';
import { DeepDiveModal } from './DeepDiveModal';
import { UnsplashImage } from './UnsplashImage';
import { getGenrePillColor, extractWhyNow, getIdeaMeta } from '@/lib/idea-meta';
import { runDeepDive } from '@/lib/api';
import { upsertReport } from '@/lib/supabase-helpers';

/** Single source of truth: verdict → colour classes */
const VERDICT_COLORS: Record<string, { border: string; dot: string; bg: string }> = {
  'GREENLIGHT':      { border: 'border-l-green-500',  dot: 'bg-green-500',  bg: 'bg-green-500' },
  'DEVELOP FURTHER': { border: 'border-l-red-500',    dot: 'bg-red-500',    bg: 'bg-red-500' },
  'PASS':            { border: 'border-l-gray-500',   dot: 'bg-gray-500',   bg: 'bg-gray-500' },
};

function getVerdictColor(verdict?: string) {
  if (!verdict || !VERDICT_COLORS[verdict]) return null;
  return VERDICT_COLORS[verdict];
}

const TAB_OPTIONS: { id: 'all' | 'archived' | SlateId; label: string }[] = [
  { id: 'all', label: 'Show All' },
  ...SLATE_CONFIGS.map(c => ({ id: c.id, label: c.label })),
  { id: 'archived', label: 'Archived' },
];

function PipelineCard({
  idea, onDeepDive, onViewResearch, onSendToBuildRoom, onViewBuildRoom, onArchive, onUnarchive, isLoading, isArchived,
}: {
  idea: PipelineIdea;
  onDeepDive: () => void;
  onViewResearch: () => void;
  onSendToBuildRoom: () => void;
  onViewBuildRoom: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  isLoading: boolean;
  isArchived?: boolean;
}) {
  const hasReport = idea.report != null;
  const vc = getVerdictColor(idea.report?.verdict);
  
  const isBuilt = idea.status === 'built' || idea.status === 'complete' || idea.status === 'building';
  const meta = getIdeaMeta(idea);
  const whyNow = extractWhyNow(idea);

  const borderClass = vc ? `border-l-[6px] ${vc.border}` : 'border-l-[6px] border-l-border';

  return (
    <div className={`relative flex flex-col md:flex-row w-full bg-card rounded-2xl border border-border overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${borderClass} ${isArchived ? 'opacity-70' : ''}`}>
      {/* Archive button */}
      {!isArchived && onArchive && (
        <button
          onClick={(e) => { e.stopPropagation(); onArchive(); }}
          className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background transition-colors backdrop-blur-sm"
          title="Archive"
        >
          <Archive className="w-4 h-4" />
        </button>
      )}

      {/* Image panel */}
      <div className="relative w-full h-48 md:w-[45%] md:h-auto shrink-0 overflow-hidden">
        <UnsplashImage genre={idea.genre} keyword={idea.title} orientation="landscape" logline={idea.logline} className="absolute inset-0 w-full h-full object-cover" alt={idea.title} />
        {isBuilt && (
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full ${vc?.bg || 'bg-slate-600'} text-white text-xs font-bold`}>BUILT</div>
        )}
      </div>

      {/* Info panel */}
      <div className="w-full md:w-[55%] p-5 md:p-8 flex flex-col justify-between">
        <div>
          <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm mb-3 md:mb-4 ${getGenrePillColor(idea.genre)}`}>
            {idea.genre}
          </span>

          <div className="flex items-center gap-2.5 mb-2 md:mb-3">
            {vc && (
              <span className={`w-3 h-3 rounded-full shrink-0 ${vc.dot}`} />
            )}
            <h3 className="text-xl md:text-[32px] font-extrabold text-foreground leading-tight">{idea.title}</h3>
          </div>

          <p className="text-sm text-muted-foreground mb-3 md:mb-4">{idea.format} · {idea.targetBroadcaster}</p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 md:mb-5">{idea.logline}</p>

          <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-5">
            {[
              { label: 'Format', value: meta.format },
              { label: 'Funding Path', value: meta.fundingPath },
              { label: 'Comparable Shows', value: meta.comparables },
              { label: 'Production Complexity', value: meta.complexity },
            ].map(stat => (
              <div key={stat.label} className="bg-muted/40 rounded-lg p-2.5 md:p-3">
                <p className="text-[10px] md:text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-xs md:text-[13px] font-semibold text-foreground leading-snug">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-xl p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Why Now?</p>
            <p className="text-sm text-foreground leading-relaxed italic">{whyNow}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-border pt-4 md:pt-5 mt-4 md:mt-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
            {isArchived && onUnarchive ? (
              <button onClick={(e) => { e.stopPropagation(); onUnarchive(); }}
                className="flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-full border border-border bg-muted text-muted-foreground text-sm font-bold hover:bg-muted/80 transition-colors">
                <ArchiveRestore className="w-4 h-4" /> Restore to Pipeline
              </button>
            ) : (
              <>
                {idea.status === 'swiped' && (
                  <button onClick={(e) => { e.stopPropagation(); onDeepDive(); }}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-full bg-amber-500 text-primary-foreground text-sm font-bold hover:scale-105 transition-transform">
                    <Telescope className="w-4 h-4" /> Deep Dive
                  </button>
                )}
                {idea.status === 'researching' && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground min-h-[48px]">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" /> Researching…
                  </div>
                )}
                {idea.status === 'researched' && hasReport && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); onViewResearch(); }}
                      className={`flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-full ${vc?.bg || 'bg-green-500'} text-white text-sm font-bold hover:scale-105 transition-transform`}>
                      <Eye className="w-4 h-4" /> View Research
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onSendToBuildRoom(); }}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-full bg-foreground text-background text-sm font-bold hover:scale-105 transition-transform">
                      Send to Build Room <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                {isBuilt && hasReport && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); onViewResearch(); }}
                      className={`flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-full ${vc?.bg || 'bg-green-500'} text-white text-sm font-bold hover:scale-105 transition-transform`}>
                      <Eye className="w-4 h-4" /> View Research
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onViewBuildRoom(); }}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-full bg-slate-700 text-white text-sm font-bold hover:scale-105 transition-transform">
                      <Hammer className="w-4 h-4" /> View in Build Room <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PipelineView() {
  const { slates, updatePipelineIdea, sendToBuildRoom, archiveIdea, unarchiveIdea, archivedIdeas, setCurrentView } = useDevSlate();
  const [activeTab, setActiveTab] = useState<'all' | 'archived' | SlateId>('all');
  const [selectedIdea, setSelectedIdea] = useState<PipelineIdea | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deepDiveFilter, setDeepDiveFilter] = useState(false);

  const allPipelineIdeas = useMemo(() => {
    return SLATE_CONFIGS.flatMap(c => slates[c.id].pipeline);
  }, [slates]);

  const baseIdeas = activeTab === 'all'
    ? allPipelineIdeas
    : activeTab === 'archived'
    ? archivedIdeas
    : slates[activeTab].pipeline;

  const filteredIdeas = useMemo(() => {
    let ideas = [...baseIdeas];
    if (deepDiveFilter && activeTab !== 'archived') {
      ideas = ideas.filter(i => i.report != null);
    }
    // Sort by most recently added (reverse array order — newest first)
    ideas.reverse();
    return ideas;
  }, [baseIdeas, deepDiveFilter, activeTab]);

  const handleDeepDive = async (idea: PipelineIdea) => {
    setLoadingId(idea.id);
    updatePipelineIdea(idea.slateId, idea.id, { status: 'researching' });
    try {
      const report = await runDeepDive(idea);
      const mappedReport = {
        ideaId: idea.id,
        verdict: report.verdict,
        verdictReason: report.verdictReason || report.verdictRationale || '',
        storyVerified: report.storyVerified ?? false,
        verifiedDetail: report.verifiedDetail || '',
        fullStory: report.fullStory || '',
        people: report.people || report.talentAccess || '',
        archive: report.archive || '',
        rightsDetail: report.rightsDetail || '',
        commissionCheck: report.commissionCheck || report.competitiveLandscape || '',
        broadcasterFit: report.broadcasterFit || report.commissionerFit || '',
        formatRecommendation: report.formatRecommendation || '',
        whyNow: report.whyNow || report.audience || '',
        redFlags: report.redFlags || '',
        sources: report.sources || '',
        generatedAt: new Date().toISOString(),
      };
      // Persist report to Supabase
      upsertReport(idea.id, mappedReport);
      updatePipelineIdea(idea.slateId, idea.id, {
        status: 'researched',
        report: mappedReport,
      });
    } catch (err) {
      console.error('Deep dive error:', err);
      updatePipelineIdea(idea.slateId, idea.id, { status: 'swiped' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleSendToBuildRoom = (idea: PipelineIdea) => {
    sendToBuildRoom(idea.slateId, idea.id);
    setCurrentView('buildroom');
  };

  return (
    <>
      {/* Scrollable tab strip on mobile */}
      <div className="flex items-center gap-2 mb-4 md:mb-6 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {TAB_OPTIONS.map(tab => {
          const isActive = activeTab === tab.id;
          const count = tab.id === 'all'
            ? allPipelineIdeas.length
            : tab.id === 'archived'
            ? archivedIdeas.length
            : slates[tab.id].pipeline.length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
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

      {/* Deep Dive filter toggle */}
      {activeTab !== 'archived' && (
        <div className="flex items-center gap-2 mb-4 md:mb-6 pt-2 border-t border-border/50">
          <button
            onClick={() => setDeepDiveFilter(false)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              !deepDiveFilter
                ? 'bg-foreground text-background shadow-md'
                : 'bg-white text-foreground border border-border hover:bg-muted'
            }`}
          >
            All Ideas
          </button>
          <button
            onClick={() => setDeepDiveFilter(true)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              deepDiveFilter
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-white text-foreground border border-border hover:bg-muted'
            }`}
          >
            Deep Dive Completed
          </button>
        </div>
      )}

      {filteredIdeas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 md:h-96 text-muted-foreground animate-fade-in">
          <div className="w-16 md:w-20 h-16 md:h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-4 md:mb-5 shadow-md">
            {activeTab === 'archived' ? <Archive className="w-8 md:w-10 h-8 md:h-10 text-muted-foreground/50" /> : <FileText className="w-8 md:w-10 h-8 md:h-10 text-muted-foreground/50" />}
          </div>
          <p className="text-lg md:text-xl font-bold text-foreground">{activeTab === 'archived' ? 'No archived ideas' : 'Pipeline empty'}</p>
          <p className="text-xs md:text-sm mt-2 text-muted-foreground text-center px-4">
            {activeTab === 'archived' ? 'Archive ideas from the pipeline to see them here' : 'Add ideas from Discover to start building your slate'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 animate-fade-in">
          {filteredIdeas.map(idea => (
            <PipelineCard key={idea.id} idea={idea} isLoading={loadingId === idea.id}
              isArchived={activeTab === 'archived'}
              onDeepDive={() => handleDeepDive(idea)}
              onViewResearch={() => setSelectedIdea(idea)}
              onSendToBuildRoom={() => handleSendToBuildRoom(idea)}
              onViewBuildRoom={() => setCurrentView('buildroom')}
              onArchive={() => archiveIdea(idea.slateId, idea.id)}
              onUnarchive={() => unarchiveIdea(idea.id)}
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
