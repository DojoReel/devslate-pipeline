import { useDevSlate } from '@/context/DevSlateContext';
import { SLATE_CONFIGS, SlateId } from '@/types/devslate';

const SHORT_LABELS: Record<SlateId, string> = {
  abc: 'ABC/SBS',
  stan: 'Stan',
  sport: 'Sport',
  international: 'Intl',
  custom: 'Custom',
};

export function SlateTabBar() {
  const { activeSlate, setActiveSlate, slates } = useDevSlate();

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 bg-nav-bg">
      {SLATE_CONFIGS.map(config => {
        const isActive = activeSlate === config.id;
        const pipelineCount = slates[config.id].pipeline.length;

        return (
          <button
            key={config.id}
            onClick={() => setActiveSlate(config.id)}
            className={`relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex-1 min-w-0 ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <span className="truncate">{SHORT_LABELS[config.id]}</span>
            {pipelineCount > 0 && (
              <span className={`text-[9px] px-1 py-0.5 rounded-full font-bold shrink-0 ${
                isActive
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'text-muted-foreground/60'
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
