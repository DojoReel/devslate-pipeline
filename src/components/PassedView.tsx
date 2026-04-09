import { useDevSlate } from '@/context/DevSlateContext';
import { Archive } from 'lucide-react';
import { getUnsplashUrl } from '@/hooks/useUnsplashImage';

export function PassedView() {
  const { activeSlate, slates } = useDevSlate();
  const slate = slates[activeSlate];

  if (slate.passed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-5 shadow-md">
          <Archive className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <p className="text-xl font-bold text-foreground">No passed ideas</p>
        <p className="text-sm mt-2">Ideas you skip in Discover will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
      {slate.passed.map(idea => {
        const imgUrl = getUnsplashUrl(idea.genre, idea.title, 400, 600);
        return (
          <div key={idea.id} className="group relative">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md opacity-60 grayscale group-hover:opacity-80 group-hover:grayscale-0 transition-all duration-300">
              <img src={imgUrl} alt={idea.title} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 gradient-scrim opacity-60" />
            </div>
            <h3 className="mt-2 text-sm font-bold text-foreground/60 leading-tight">{idea.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{idea.genre}</p>
          </div>
        );
      })}
    </div>
  );
}
