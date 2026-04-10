import { useDevSlate } from '@/context/DevSlateContext';
import { PackageOpen, RotateCcw } from 'lucide-react';
import { UnsplashImage } from './UnsplashImage';
import { ShowIdea, SLATE_CONFIGS } from '@/types/devslate';
import { getGenrePillColor, extractWhyNow, getIdeaMeta } from '@/lib/idea-meta';

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
    <div className="grid gap-6 animate-fade-in">
      {allPassed.map(idea => (
        <IdeaBinCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
}

function IdeaBinCard({ idea }: { idea: ShowIdea }) {
  const { restoreToPipeline } = useDevSlate();
  const meta = getIdeaMeta(idea);
  const whyNow = extractWhyNow(idea);

  return (
    <div className="relative flex w-full bg-card rounded-2xl border border-border overflow-hidden shadow-md opacity-50 saturate-[0.15] hover:opacity-70 hover:saturate-[0.3] transition-all duration-300">
      {/* Image panel — 45% */}
      <div className="relative w-[45%] shrink-0 overflow-hidden">
        <UnsplashImage genre={idea.genre} keyword={idea.title} orientation="landscape" logline={idea.logline} className="absolute inset-0 w-full h-full object-cover" alt={idea.title} />
      </div>

      {/* Info panel — 55% */}
      <div className="w-[55%] p-8 flex flex-col justify-between">
        <div>
          <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm mb-4 ${getGenrePillColor(idea.genre)}`}>
            {idea.genre}
          </span>

          <h3 className="text-[32px] font-extrabold text-foreground leading-tight mb-3">{idea.title}</h3>

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

        <div className="border-t border-border pt-5 mt-6">
          <button
            onClick={() => restoreToPipeline(idea.slateId, idea.id)}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restore to Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}
