import { useDevSlate } from '@/context/DevSlateContext';
import { SLATE_CONFIGS } from '@/types/devslate';
import { Layers, GitBranch, Hammer, Wrench, PlusCircle } from 'lucide-react';

type ViewId = 'discover' | 'pipeline' | 'passed' | 'custom' | 'buildroom' | 'market-radar' | 'funding-calendar' | 'tools';

export function MobileNav() {
  const { currentView, setCurrentView, slates } = useDevSlate();

  const totalPipeline = SLATE_CONFIGS.reduce((sum, c) => sum + slates[c.id].pipeline.length, 0);
  const totalDeck = SLATE_CONFIGS.reduce((sum, c) => sum + slates[c.id].deck.length, 0);
  const totalBuildRoom = SLATE_CONFIGS.reduce((sum, c) => sum + slates[c.id].pipeline.filter(i => i.status === 'built' || i.status === 'complete' || i.status === 'building').length, 0);

  const views: { id: ViewId; label: string; icon: typeof Layers; count?: number }[] = [
    { id: 'discover', label: 'Discover', icon: Layers, count: totalDeck },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch, count: totalPipeline },
    { id: 'buildroom', label: 'Build', icon: Hammer, count: totalBuildRoom },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'custom', label: 'Add Idea', icon: PlusCircle },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-nav-bg border-t border-sidebar-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around px-1 pt-1.5 pb-1">
        {views.map(view => {
          const isActive = currentView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`relative flex flex-col items-center gap-0.5 min-w-[48px] min-h-[48px] justify-center rounded-lg text-[10px] font-medium transition-all ${
                isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60'
              }`}
            >
              <view.icon className="w-5 h-5" />
              <span>{view.label}</span>
              {view.count != null && view.count > 0 && (
                <span className="absolute -top-0.5 right-0.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-1">
                  {view.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
