import { useDevSlate } from '@/context/DevSlateContext';
import { Layers, GitBranch, PackageOpen, Palette, Hammer } from 'lucide-react';

export function MobileNav() {
  const { currentView, setCurrentView, activeSlate, slates } = useDevSlate();
  const { SLATE_CONFIGS } = require('@/types/devslate');

  const totalPipeline = SLATE_CONFIGS.reduce((sum: number, c: any) => sum + slates[c.id].pipeline.length, 0);
  const totalPassed = SLATE_CONFIGS.reduce((sum: number, c: any) => sum + slates[c.id].passed.length, 0);
  const totalDeck = SLATE_CONFIGS.reduce((sum: number, c: any) => sum + slates[c.id].deck.length, 0);

  const views = [
    { id: 'discover' as const, label: 'Discover', icon: Layers, count: totalDeck },
    { id: 'pipeline' as const, label: 'Pipeline', icon: GitBranch, count: totalPipeline },
    { id: 'buildroom' as const, label: 'Build', icon: Hammer },
    { id: 'passed' as const, label: 'Idea Bin', icon: PackageOpen, count: totalPassed },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-nav-bg border-t border-sidebar-border px-2 py-1 safe-area-bottom">
      <div className="flex items-center justify-around">
        {views.map(view => {
          const isActive = currentView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60'
              }`}
            >
              <view.icon className="w-5 h-5" />
              <span>{view.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
