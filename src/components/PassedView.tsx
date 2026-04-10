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
          <PackageOpen className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <p className="text-xl font-bold text-foreground">Idea Bin is empty</p>
        <p className="text-sm mt-2">Ideas you pass on in Discover will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
      {allPassed.map(idea => (
        <IdeaBinCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
}

function IdeaBinCard({ idea }: { idea: ShowIdea }) {
  const { restoreToPipeline } = useDevSlate();

  return (
    <div className="group relative">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md opacity-50 saturate-[0.3] group-hover:opacity-70 group-hover:saturate-[0.6] transition-all duration-300">
        <UnsplashImage genre={idea.genre} keyword={idea.title} orientation="portrait" className="w-full h-full object-cover" alt={idea.title} />
        <div className="absolute inset-0 gradient-scrim opacity-60" />
        <button
          onClick={() => restoreToPipeline(idea.slateId, idea.id)}
          className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-background/80 backdrop-blur text-foreground text-xs font-semibold opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:bg-background"
        >
          <RotateCcw className="w-3 h-3" />
          Restore to Pipeline
        </button>
      </div>
      <h3 className="mt-2 text-sm font-bold text-foreground/50 leading-tight">{idea.title}</h3>
      <p className="text-xs text-muted-foreground/60 mt-0.5">{idea.genre}</p>
    </div>
  );
}
