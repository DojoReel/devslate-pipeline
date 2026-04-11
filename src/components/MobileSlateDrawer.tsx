import { useDevSlate } from '@/context/DevSlateContext';
import { SLATE_CONFIGS, SlateId } from '@/types/devslate';
import { Layers, GitBranch, Hammer, Palette, PackageOpen, X } from 'lucide-react';

type ViewId = 'discover' | 'pipeline' | 'passed' | 'custom' | 'buildroom' | 'market-radar' | 'funding-calendar';

interface MobileSlateDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSlateDrawer({ open, onClose }: MobileSlateDrawerProps) {
  const { activeSlate, setActiveSlate, currentView, setCurrentView, slates } = useDevSlate();

  const handleSlateSelect = (id: SlateId) => {
    setActiveSlate(id);
    if (currentView !== 'discover') setCurrentView('discover');
    onClose();
  };

  const handleNavSelect = (view: ViewId) => {
    setCurrentView(view);
    onClose();
  };

  const navItems: { id: ViewId; label: string; icon: typeof Layers }[] = [
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'buildroom', label: 'Build Room', icon: Hammer },
    { id: 'custom', label: 'Custom Idea', icon: Palette },
    { id: 'passed', label: 'Idea Bin', icon: PackageOpen },
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      )}
      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-sidebar transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border">
          <span className="text-base font-bold text-sidebar-accent-foreground">Slates</span>
          <button onClick={onClose} className="p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slate list */}
        <div className="px-3 pt-4 pb-2">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40 mb-2">Broadcaster Slates</p>
          {SLATE_CONFIGS.map(config => {
            const isActive = activeSlate === config.id && currentView === 'discover';
            const count = slates[config.id].deck.length;
            return (
              <button
                key={config.id}
                onClick={() => handleSlateSelect(config.id)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-semibold transition-all mb-0.5 min-h-[48px] ${
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <span>{config.label}</span>
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                    isActive ? 'text-primary/80' : 'text-sidebar-foreground/40'
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-6 my-2 border-t border-sidebar-foreground/10" />

        {/* Nav items */}
        <div className="px-3">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40 mb-2">Navigate</p>
          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all mb-0.5 min-h-[48px] ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
