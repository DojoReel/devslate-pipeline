import { useDevSlate } from '@/context/DevSlateContext';
import { PackageOpen, RotateCcw } from 'lucide-react';
import { UnsplashImage } from './UnsplashImage';
import { ShowIdea, SLATE_CONFIGS } from '@/types/devslate';

export function PassedView() {
  const { slates } = useDevSlate();

  const allPassed = SLATE_CONFIGS.flatMap(c =>
    slates[c.id].passed.map(idea => ({ ...idea, slateId: c.id }))
  );

  if (allPassed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-5 shadow-md">
          <PackageOpen className="w-10 h-10 text-muted-foreground/30" />
        </div>
        <p className="text-lg font-semibold text-muted-foreground/60">No ideas here yet</p>
        <p className="text-sm mt-2 text-muted-foreground/40">Pass on ideas in Discover to park them here</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 animate-fade-in">
      {allPassed.map(idea => (
        <IdeaBinCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
}

function IdeaBinCard({ idea }: { idea: ShowIdea }) {
  const { restoreToPipeline } = useDevSlate();

  return (
    <div className="flex bg-card rounded-xl border border-border overflow-hidden shadow-sm opacity-60 saturate-[0.2] hover:opacity-75 hover:saturate-[0.4] transition-all duration-300">
      {/* Compact portrait image */}
      <div className="relative w-[180px] md:w-[200px] shrink-0">
        <UnsplashImage genre={idea.genre} keyword={idea.title} orientation="portrait" className="w-full h-full object-cover" alt={idea.title} />
      </div>

      {/* Info panel */}
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wide">{idea.genre}</span>
          <h3 className="text-lg font-bold text-foreground/50 leading-tight mt-2">{idea.title}</h3>
          <p className="text-xs text-muted-foreground/50 mt-1">{idea.format} · {idea.targetBroadcaster}</p>
          <p className="text-sm text-muted-foreground/40 mt-2 leading-relaxed line-clamp-2">{idea.logline}</p>

          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/30">Format</p>
              <p className="text-xs font-bold text-foreground/40">{idea.format}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/30">Funding Path</p>
              <p className="text-xs font-bold text-foreground/40">Screen Australia + License Fee</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/30">Comparable Shows</p>
              <p className="text-xs font-bold text-foreground/40">—</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/30">Production Complexity</p>
              <p className="text-xs font-bold text-foreground/40">Medium</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/50">
          <button
            onClick={() => restoreToPipeline(idea.slateId, idea.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-xs font-semibold text-muted-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Restore to Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}
