import { useDevSlate } from '@/context/DevSlateContext';
import { X } from 'lucide-react';

export function PassedView() {
  const { activeSlate, slates } = useDevSlate();
  const slate = slates[activeSlate];

  if (slate.passed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <X className="w-8 h-8" />
        </div>
        <p className="text-lg font-semibold text-foreground">No passed ideas</p>
        <p className="text-sm mt-1">Ideas you swipe left on will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 animate-fade-in">
      {slate.passed.map(idea => (
        <div key={idea.id} className="p-4 rounded-xl bg-card border border-border opacity-60">
          <h3 className="font-semibold text-foreground">{idea.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{idea.logline}</p>
          <div className="text-xs text-muted-foreground mt-2">
            {idea.format} · {idea.targetBroadcaster}
          </div>
        </div>
      ))}
    </div>
  );
}
