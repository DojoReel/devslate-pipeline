import { useDevSlate } from '@/context/DevSlateContext';
import { SLATE_CONFIGS, SlateId } from '@/types/devslate';

const SHORT_LABELS: Record<SlateId, string> = {
  crime: 'Crime',
  environment: 'Environ',
  sport: 'Sport',
  culture: 'Culture',
  character: 'Character',
  political: 'Political',
  history: 'History',
  science: 'Science',
  social: 'Social',
  firstnations: '1st Nations',
  cooking: 'Cooking',
  travel: 'Travel',
  custom: 'Custom',
};

export function SlateTabBar() {
  const { activeSlate, setActiveSlate, slates } = useDevSlate();

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 md:gap-1.5 md:px-4 md:py-2 md:bg-nav-bg" style={{ backgroundColor: '#1e2235' }}>
      {SLATE_CONFIGS.map(config => {
        const isActive = activeSlate === config.id;
        const pipelineCount = slates[config.id].pipeline.length;

        return (
          <button
            key={config.id}
            onClick={() => setActiveSlate(config.id)}
            className={`relative flex items-center justify-center gap-1 h-9 rounded-full text-[13px] font-semibold transition-all flex-1 min-w-0 md:px-3 md:py-1.5 md:text-xs ${
              isActive
                ? 'bg-primary text-white'
                : 'bg-transparent text-white/90 hover:text-white'
            }`}
          >
            <span>{SHORT_LABELS[config.id]}</span>
            {pipelineCount > 0 && (
              <span className={`text-[9px] px-1 py-0.5 rounded-full font-bold shrink-0 ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/50'
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
