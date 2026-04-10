import { useDevSlate } from '@/context/DevSlateContext';
import { ShowIdea, SLATE_CONFIGS, SlateId } from '@/types/devslate';
import { ThumbsUp, ThumbsDown, Telescope, Star } from 'lucide-react';
import { useState, useMemo } from 'react';
import { UnsplashImage } from './UnsplashImage';
import { getGenreGradient } from '@/hooks/useUnsplashImage';

const GENRE_PILL_COLORS: Record<string, string> = {
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

function getGenrePillColor(genre: string) {
  return GENRE_PILL_COLORS[genre] || 'bg-primary';
}

/** Extract bullet points from logline */
function extractBullets(idea: ShowIdea): string[] {
  const bullets: string[] = [];
  bullets.push(`${idea.format}`);
  bullets.push(`Target: ${idea.targetBroadcaster}`);
  // Extract a "why now" from the logline
  const logWords = idea.logline.split(/[,.]/).filter(s => s.trim().length > 10);
  if (logWords.length > 1) {
    bullets.push(logWords[logWords.length - 1].trim());
  }
  return bullets;
}

/* ─── Editorial Card — full-width, image left / info right ─── */
function EditorialCard({
  idea,
  onAdd,
  onPass,
  featured = false,
}: {
  idea: ShowIdea;
  onAdd: (idea: ShowIdea) => void;
  onPass: (idea: ShowIdea) => void;
  featured?: boolean;
}) {
  const bullets = extractBullets(idea);

  return (
    <div className={`flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-card border border-border ${featured ? 'ring-2 ring-primary/30' : ''}`}>
      {/* Image — left 60% */}
      <div className="relative w-full md:w-[60%] min-h-[280px] md:min-h-[360px]">
        <UnsplashImage
          genre={idea.genre}
          keyword={idea.title}
          orientation="landscape"
          logline={idea.logline}
          className="w-full h-full object-cover"
          alt={idea.title}
        />
        {featured && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-md">
            <Star className="w-3.5 h-3.5" />
            Featured
          </div>
        )}
      </div>

      {/* Info — right 40% */}
      <div className="w-full md:w-[40%] p-6 md:p-8 flex flex-col justify-between">
        <div>
          {/* Genre pill */}
          <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm mb-4 ${getGenrePillColor(idea.genre)}`}>
            {idea.genre}
          </span>

          {/* Title */}
          <h3 className="text-2xl md:text-[28px] font-extrabold text-foreground leading-tight mb-2">
            {idea.title}
          </h3>

          {/* Format & broadcaster */}
          <p className="text-sm text-muted-foreground mb-4">
            {idea.format} · {idea.targetBroadcaster}
          </p>

          {/* Logline */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {idea.logline}
          </p>

          {/* Bullet points */}
          <ul className="space-y-1.5 mb-6">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onAdd(idea)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:scale-105 transition-transform"
          >
            <ThumbsUp className="w-4 h-4" />
            Add to Pipeline
          </button>
          <button
            onClick={() => onPass(idea)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted text-muted-foreground font-semibold text-sm border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <ThumbsDown className="w-4 h-4" />
            Pass
          </button>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Telescope className="w-4 h-4" />
            Deep Dive
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Library ─── */
export function DiscoverLibrary() {
  const { slates, swipeRight, swipeLeft } = useDevSlate();
  const [activeFilter, setActiveFilter] = useState<SlateId | 'all'>('all');

  const handleAdd = (idea: ShowIdea) => {
    swipeRight(idea.slateId, idea);
  };
  const handlePass = (idea: ShowIdea) => {
    swipeLeft(idea.slateId, idea);
  };

  const filteredConfigs = activeFilter === 'all'
    ? SLATE_CONFIGS
    : SLATE_CONFIGS.filter(c => c.id === activeFilter);

  // Track if first card overall (for "Featured" label)
  let isFirstCard = true;

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto">
      {/* Filter pills */}
      <div className="flex items-center gap-2.5 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setActiveFilter('all')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
            activeFilter === 'all' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card text-muted-foreground hover:text-foreground border border-border'
          }`}
        >All Slates</button>
        {SLATE_CONFIGS.map(config => (
          <button key={config.id} onClick={() => setActiveFilter(config.id)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              activeFilter === config.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card text-muted-foreground hover:text-foreground border border-border'
            }`}
          >{config.label}</button>
        ))}
      </div>

      {/* Slate sections — stacked vertically */}
      {filteredConfigs.map(config => {
        const ideas = slates[config.id].deck;
        if (ideas.length === 0) return null;

        return (
          <div key={config.id} className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">{config.label}</h2>
            <div className="space-y-8">
              {ideas.map(idea => {
                const featured = isFirstCard;
                if (isFirstCard) isFirstCard = false;
                return (
                  <EditorialCard
                    key={idea.id}
                    idea={idea}
                    onAdd={handleAdd}
                    onPass={handlePass}
                    featured={featured}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {filteredConfigs.every(c => slates[c.id].deck.length === 0) && (
        <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
          <Telescope className="w-12 h-12 mb-4 opacity-40" />
          <p className="text-lg font-semibold text-foreground">All ideas have been reviewed</p>
          <p className="text-sm mt-1">Reset a slate to start fresh</p>
        </div>
      )}
    </div>
  );
}
