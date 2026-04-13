import { useDevSlate } from '@/context/DevSlateContext';
import { SLATE_CONFIGS, SlateId } from '@/types/devslate';
import { PackageOpen, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface MobileSlateDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSlateDrawer({ open, onClose }: MobileSlateDrawerProps) {
  const { activeSlate, setActiveSlate, currentView, setCurrentView, slates } = useDevSlate();
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleSlateSelect = (id: SlateId) => {
    setActiveSlate(id);
    if (currentView !== 'discover') setCurrentView('discover');
    onClose();
  };

  const handleBinSelect = () => {
    setCurrentView('passed');
    onClose();
  };

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      )}
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed left-0 right-0 bottom-0 z-50 bg-sidebar rounded-t-2xl transform transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '80vh' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-sidebar-foreground/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2">
          <span className="text-base font-bold text-sidebar-accent-foreground">Slates</span>
          <button onClick={onClose} className="p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slate list */}
        <div className="px-3 pt-2 pb-2">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40 mb-2">Genre Slates</p>
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
        <div className="mx-6 my-1 border-t border-sidebar-foreground/10" />

        {/* Organise section */}
        <div className="px-3 pb-4">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40 mb-2">Organise</p>
          <button
            onClick={handleBinSelect}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all min-h-[48px] ${
              currentView === 'passed'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
            }`}
          >
            <PackageOpen className="w-4 h-4" />
            Idea Bin
          </button>
        </div>

        {/* Safe area padding */}
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </>
  );
}
