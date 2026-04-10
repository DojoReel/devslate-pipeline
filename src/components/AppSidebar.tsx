import { useDevSlate } from '@/context/DevSlateContext';
import { SLATE_CONFIGS } from '@/types/devslate';
import { Layers, GitBranch, RotateCcw, Clapperboard, Palette, Hammer, PackageOpen, Radio, CalendarDays } from 'lucide-react';

type ViewId = 'discover' | 'pipeline' | 'passed' | 'custom' | 'buildroom' | 'market-radar' | 'funding-calendar';

export function AppSidebar() {
  const { activeSlate, currentView, setCurrentView, slates, resetSlate } = useDevSlate();

  const totalDeck = SLATE_CONFIGS.reduce((sum, c) => sum + slates[c.id].deck.length, 0);
  const totalPipeline = SLATE_CONFIGS.reduce((sum, c) => sum + slates[c.id].pipeline.length, 0);
  const totalPassed = SLATE_CONFIGS.reduce((sum, c) => sum + slates[c.id].passed.length, 0);

  const viewItems: { id: ViewId; label: string; icon: typeof Layers; count?: number }[] = [
    { id: 'discover', label: 'Discover', icon: Layers, count: totalDeck },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch, count: totalPipeline },
    { id: 'passed', label: 'Idea Bin', icon: PackageOpen, count: totalPassed },
  ];

  const toolItems: { id: ViewId; label: string; icon: typeof Layers }[] = [
    { id: 'custom', label: 'Custom', icon: Palette },
    { id: 'market-radar', label: 'Market Radar', icon: Radio },
    { id: 'funding-calendar', label: 'Funding Calendar', icon: CalendarDays },
  ];

  const renderButton = (view: { id: ViewId; label: string; icon: typeof Layers; count?: number }, isPrimary: boolean) => {
    const isActive = currentView === view.id;
    return (
      <button
        key={view.id}
        onClick={() => setCurrentView(view.id as any)}
        className={`w-full flex items-center justify-between px-3 rounded-lg transition-all mb-0.5 ${
          isPrimary ? 'py-2.5 text-sm font-semibold' : 'py-2 text-[13px] font-medium'
        } ${
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : isPrimary
              ? 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
        }`}
      >
        <span className="flex items-center gap-3">
          <view.icon className={isPrimary ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          {view.label}
        </span>
        {view.count != null && view.count > 0 && (
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
            isActive ? 'bg-sidebar-primary/20 text-sidebar-primary' : 'text-sidebar-foreground/40'
          }`}>{view.count}</span>
        )}
      </button>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground shrink-0 h-screen sticky top-0">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Clapperboard className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-sidebar-accent-foreground">DevSlate</h1>
            <p className="text-[11px] text-sidebar-foreground/60 uppercase tracking-widest">Pipeline</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 pt-6 pb-4 flex-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40 mb-2">Views</p>
        {viewItems.map(v => renderButton(v, true))}

        {/* Divider */}
        <div className="mx-3 my-3 border-t border-sidebar-foreground/10" />

        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/30 mb-2">Tools</p>
        {toolItems.map(v => renderButton(v, false))}
      </nav>

      {/* Reset */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={() => resetSlate(activeSlate)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Slate
        </button>
      </div>
    </aside>
  );
}
