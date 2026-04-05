import { useDevSlate } from '@/context/DevSlateContext';
import { SLATE_CONFIGS } from '@/types/devslate';

export function SlateTabBar() {
  const { activeSlate, setActiveSlate, slates } = useDevSlate();

  const accentClasses: Record<string, string> = {
    abc: 'bg-slate_accent-abc',
    stan: 'bg-slate_accent-stan',
    sport: 'bg-slate_accent-sport',
    international: 'bg-slate_accent-international',
    custom: 'bg-slate_accent-custom',
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-surface-0 border-b border-border overflow-x-auto">
      {SLATE_CONFIGS.map(config => {
        const isActive = activeSlate === config.id;
        const pipelineCount = slates[config.id].pipeline.length;
        const deckCount = slates[config.id].deck.length;

        return (
          <button
            key={config.id}
            onClick={() => setActiveSlate(config.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'bg-surface-2 text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-1'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${accentClasses[config.id]}`} />
            <span>{config.label}</span>
            {pipelineCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-surface-3 text-muted-foreground">
                {pipelineCount}
              </span>
            )}
            {isActive && (
              <span className="text-xs text-muted-foreground">
                {deckCount} left
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
