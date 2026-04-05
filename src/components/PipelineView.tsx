import { useDevSlate } from '@/context/DevSlateContext';
import { PipelineIdea } from '@/types/devslate';
import { Loader2, FileText, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { DeepDiveModal } from './DeepDiveModal';

export function PipelineView() {
  const { activeSlate, slates, updatePipelineIdea } = useDevSlate();
  const slate = slates[activeSlate];
  const [selectedIdea, setSelectedIdea] = useState<PipelineIdea | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const accentBgClasses: Record<string, string> = {
    abc: 'bg-slate_accent-abc/10 border-slate_accent-abc/20',
    stan: 'bg-slate_accent-stan/10 border-slate_accent-stan/20',
    sport: 'bg-slate_accent-sport/10 border-slate_accent-sport/20',
    international: 'bg-slate_accent-international/10 border-slate_accent-international/20',
    custom: 'bg-slate_accent-custom/10 border-slate_accent-custom/20',
  };

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
          title: idea.title,
          logline: idea.logline,
          format: idea.format,
          targetBroadcaster: idea.targetBroadcaster,
          genre: idea.genre,
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

  if (slate.pipeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground animate-fade-in">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Pipeline empty</p>
        <p className="text-sm mt-1">Swipe ideas right in Discover to add them here</p>
      </div>
    );
  }

  const verdictColors: Record<string, string> = {
    'GREENLIGHT': 'text-green-400 bg-green-500/10 border-green-500/20',
    'DEVELOP FURTHER': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'PASS': 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <>
      <div className="grid gap-3 animate-fade-in">
        {slate.pipeline.map(idea => (
          <div
            key={idea.id}
            className={`p-4 rounded-xl border ${accentBgClasses[activeSlate]} transition-all hover:bg-surface-3 cursor-pointer`}
            onClick={() => idea.report && setSelectedIdea(idea)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-foreground truncate">{idea.title}</h3>
                  {idea.report && (
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${verdictColors[idea.report.verdict]}`}>
                      {idea.report.verdict}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 truncate">{idea.logline}</p>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {idea.status === 'swiped' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); runDeepDive(idea); }}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Deep Dive
                  </button>
                )}
                {idea.status === 'researching' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Researching…
                  </div>
                )}
                {idea.report && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>
          </div>
        ))}
      </div>

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
