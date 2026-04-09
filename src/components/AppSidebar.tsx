import { useDevSlate } from '@/context/DevSlateContext';
import { SLATE_CONFIGS } from '@/types/devslate';
import { Layers, GitBranch, Archive, RotateCcw, Clapperboard } from 'lucide-react';

export function AppSidebar() {
  const { activeSlate, setActiveSlate, currentView, setCurrentView, slates, resetSlate } = useDevSlate();

  const views = [
    { id: 'discover' as const, label: 'Discover', icon: Layers },
    { id: 'pipeline' as const, label: 'Pipeline', icon: GitBranch },
    { id: 'passed' as const, label: 'Passed', icon: Archive },
  ];

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

      {/* Views */}
      <nav className="px-3 pt-6 pb-4">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40 mb-2">Views</p>
        {views.map(view => {
          const count = view.id === 'discover' ? slates[activeSlate].deck.length
            : view.id === 'pipeline' ? slates[activeSlate].pipeline.length
            : slates[activeSlate].passed.length;
          const isActive = currentView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <span className="flex items-center gap-3">
                <view.icon className="w-4 h-4" />
                {view.label}
              </span>
              {count > 0 && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                  isActive ? 'bg-sidebar-primary/20 text-sidebar-primary' : 'text-sidebar-foreground/50'
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Slates */}
      <nav className="px-3 flex-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40 mb-2">Slates</p>
        {SLATE_CONFIGS.map(config => {
          const isActive = activeSlate === config.id;
          const count = slates[config.id].pipeline.length;
          return (
            <button
              key={config.id}
              onClick={() => setActiveSlate(config.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: `hsl(var(${config.colorVar}))` }}
                />
                {config.label}
              </span>
              {count > 0 && (
                <span className="text-xs font-semibold text-sidebar-foreground/50">{count}</span>
              )}
            </button>
          );
        })}
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
