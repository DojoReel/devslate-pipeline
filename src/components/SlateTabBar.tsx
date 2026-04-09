import { useDevSlate } from '@/context/DevSlateContext';
import { SLATE_CONFIGS } from '@/types/devslate';

export function SlateTabBar() {
  const { activeSlate, setActiveSlate, slates } = useDevSlate();

  return (
    <div className="flex items-center gap-2 px-6 py-3 bg-surface-0 border-b border-border overflow-x-auto scrollbar-none">
      {SLATE_CONFIGS.map(config => {
        const isActive = activeSlate === config.id;
        const pipelineCount = slates[config.id].pipeline.length;

        return (
          <button
            key={config.id}
            onClick={() => setActiveSlate(config.id)}
            className={`relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-surface-2 text-muted-foreground hover:text-foreground hover:bg-surface-3'
            }`}
          >
            <span>{config.label}</span>
            {pipelineCount > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                isActive 
                  ? 'bg-primary-foreground/20 text-primary-foreground' 
                  : 'bg-surface-3 text-muted-foreground'
              }`}>
                {pipelineCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
