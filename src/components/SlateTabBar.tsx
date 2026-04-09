import { useDevSlate } from '@/context/DevSlateContext';
import { SLATE_CONFIGS } from '@/types/devslate';

export function SlateTabBar() {
  const { activeSlate, setActiveSlate, slates } = useDevSlate();

  return (
    <div className="flex items-center gap-2 px-5 py-3 bg-nav-bg overflow-x-auto scrollbar-none">
      {SLATE_CONFIGS.map(config => {
        const isActive = activeSlate === config.id;
        const pipelineCount = slates[config.id].pipeline.length;

        return (
          <button
            key={config.id}
            onClick={() => setActiveSlate(config.id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'bg-sidebar-accent/50 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: `hsl(var(${config.colorVar}))` }}
            />
            <span>{config.label}</span>
            {pipelineCount > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                isActive
                  ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/60'
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
