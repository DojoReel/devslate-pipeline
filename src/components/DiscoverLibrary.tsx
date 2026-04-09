import { useDevSlate } from '@/context/DevSlateContext';
import { ShowIdea, SLATE_CONFIGS, SlateId } from '@/types/devslate';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { useState, useRef, useMemo } from 'react';
import { getUnsplashUrl } from '@/hooks/useUnsplashImage';

const GENRE_COLORS: Record<string, string> = {
  'Documentary': 'bg-primary',
  'Political Documentary': 'bg-primary',
  'Natural History': 'bg-primary',
  'Factual Entertainment': 'bg-primary',
  'Human Interest': 'bg-primary',
  'Factual Drama': 'bg-primary',
  'True Crime': 'bg-primary',
  'Sports Documentary': 'bg-slate_accent-sport',
  'Sports Reality': 'bg-slate_accent-sport',
  'Adventure Sports': 'bg-slate_accent-sport',
  'Travel Food': 'bg-slate_accent-international',
  'Geopolitical Documentary': 'bg-slate_accent-international',
  'Current Affairs': 'bg-slate_accent-international',
  'Business Reality': 'bg-slate_accent-stan',
  'Competition Reality': 'bg-slate_accent-stan',
  'Behind the Scenes': 'bg-muted-foreground',
  'Custom': 'bg-muted-foreground',
};

function getGenreColor(genre: string) {
  return GENRE_COLORS[genre] || 'bg-primary';
}

function ShowCard({ idea, onAdd }: { idea: ShowIdea; onAdd: (idea: ShowIdea) => void }) {
  const [hovered, setHovered] = useState(false);
  const imgUrl = getUnsplashUrl(`${idea.genre} ${idea.title} cinematic`, 400, 600);

  return (
    <div
      className="group relative flex-shrink-0 w-[180px] cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Portrait image card */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        <img
          src={imgUrl}
          alt={idea.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Genre pill */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary-foreground ${getGenreColor(idea.genre)}`}>
            {idea.genre}
          </span>
        </div>

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-foreground/60 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(idea); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Pipeline
          </button>
        </div>
      </div>
      {/* Title below */}
      <h3 className="mt-3 text-sm font-bold text-foreground leading-tight line-clamp-2">{idea.title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{idea.format}</p>
    </div>
  );
}

function HeroBanner({ idea, onAdd }: { idea: ShowIdea; onAdd: (idea: ShowIdea) => void }) {
  const imgUrl = getUnsplashUrl(`${idea.genre} ${idea.title} cinematic dramatic`, 1400, 600);

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden mb-10 shadow-xl">
      <img src={imgUrl} alt={idea.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 gradient-scrim" />
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-primary-foreground ${getGenreColor(idea.genre)}`}>
            {idea.genre}
          </span>
          <span className="text-sm text-primary-foreground/70">{idea.format} · {idea.targetBroadcaster}</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-primary-foreground leading-tight max-w-2xl">{idea.title}</h2>
        <p className="text-base text-primary-foreground/80 mt-3 max-w-xl leading-relaxed">{idea.logline}</p>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => onAdd(idea)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Add to Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}

function SlateRow({ slateId, label, ideas, onAdd }: { slateId: SlateId; label: string; ideas: ShowIdea[]; onAdd: (idea: ShowIdea) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (ideas.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-foreground">{label}</h3>
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          See all <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
        {ideas.map(idea => (
          <ShowCard key={idea.id} idea={idea} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
}

export function DiscoverLibrary() {
  const { slates, swipeRight } = useDevSlate();
  const [activeFilter, setActiveFilter] = useState<SlateId | 'all'>('all');

  const allIdeas = useMemo(() => {
    const ideas: ShowIdea[] = [];
    for (const config of SLATE_CONFIGS) {
      ideas.push(...slates[config.id].deck);
    }
    return ideas;
  }, [slates]);

  const heroIdea = allIdeas[0];

  const handleAdd = (idea: ShowIdea) => {
    swipeRight(idea.slateId, idea);
  };

  const filteredConfigs = activeFilter === 'all'
    ? SLATE_CONFIGS
    : SLATE_CONFIGS.filter(c => c.id === activeFilter);

  return (
    <div className="animate-fade-in">
      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card text-muted-foreground hover:text-foreground border border-border'
          }`}
        >
          All Slates
        </button>
        {SLATE_CONFIGS.map(config => (
          <button
            key={config.id}
            onClick={() => setActiveFilter(config.id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              activeFilter === config.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Hero banner */}
      {heroIdea && <HeroBanner idea={heroIdea} onAdd={handleAdd} />}

      {/* Slate rows */}
      {filteredConfigs.map(config => (
        <SlateRow
          key={config.id}
          slateId={config.id}
          label={config.label}
          ideas={slates[config.id].deck}
          onAdd={handleAdd}
        />
      ))}

      {allIdeas.length === 0 && (
        <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
          <Search className="w-12 h-12 mb-4 opacity-40" />
          <p className="text-lg font-semibold text-foreground">All ideas have been reviewed</p>
          <p className="text-sm mt-1">Reset a slate to start fresh</p>
        </div>
      )}
    </div>
  );
}
