import { useDevSlate } from '@/context/DevSlateContext';
import { Layers, GitBranch, Archive, RotateCcw } from 'lucide-react';

export function ViewSwitcher() {
  const { currentView, setCurrentView, activeSlate, slates, resetSlate } = useDevSlate();
  const slate = slates[activeSlate];

  const views = [
    { id: 'discover' as const, label: 'Discover', icon: Layers, count: slate.deck.length },
    { id: 'pipeline' as const, label: 'Pipeline', icon: GitBranch, count: slate.pipeline.length },
    { id: 'passed' as const, label: 'Passed', icon: Archive, count: slate.passed.length },
  ];

  return (
    <div className="flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-1 bg-surface-1 rounded-2xl p-1 border border-border">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => setCurrentView(view.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === view.id
                ? 'bg-surface-3 text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <view.icon className="w-4 h-4" />
            {view.label}
            {view.count > 0 && (
              <span className={`text-xs font-semibold ${currentView === view.id ? 'text-primary' : 'opacity-50'}`}>{view.count}</span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => resetSlate(activeSlate)}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-all border border-transparent hover:border-border"
        title="Reset this slate"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset
      </button>
    </div>
  );
}
