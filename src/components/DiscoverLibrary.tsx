import { useDevSlate } from '@/context/DevSlateContext';
import { ShowIdea, SLATE_CONFIGS, SlateId } from '@/types/devslate';
import { Search, ChevronLeft, ChevronRight, Telescope, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
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

/* ─── Show Card (400px tall, portrait, full-bleed) ─── */
function ShowCard({ idea, onAdd, onPass }: { idea: ShowIdea; onAdd: (idea: ShowIdea) => void; onPass: (idea: ShowIdea) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative flex-shrink-0 w-[280px] cursor-pointer snap-start"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <UnsplashImage
          genre={idea.genre}
          keyword={idea.title}
          orientation="portrait"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          alt={idea.title}
        />

        {/* Genre pill — top left */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-md ${getGenrePillColor(idea.genre)}`}>
            {idea.genre}
          </span>
        </div>

        {/* Dark gradient scrim — bottom 40% */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Text overlay — bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">{idea.title}</h3>
          <p className="text-xs text-white/60 mt-1 line-clamp-2">{idea.logline}</p>
          <p className="text-[11px] text-white/40 mt-1">{idea.format}</p>
        </div>

        {/* Hover overlay with thumbs */}
        <div className={`absolute inset-0 z-20 bg-black/50 backdrop-blur-[2px] flex items-center justify-center gap-6 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button
            onClick={(e) => { e.stopPropagation(); onPass(idea); }}
            className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-verdict-red hover:border-transparent hover:scale-110 transition-all"
            title="Pass"
          >
            <ThumbsDown className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(idea); }}
            className="w-14 h-14 rounded-full bg-primary border border-primary flex items-center justify-center text-primary-foreground hover:scale-110 transition-all shadow-xl"
            title="Add to Pipeline"
          >
            <ThumbsUp className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero Banner with rotation ─── */
function HeroBanner({ ideas, onAdd, onPass }: { ideas: ShowIdea[]; onAdd: (idea: ShowIdea) => void; onPass: (idea: ShowIdea) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (ideas.length <= 1) return;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % ideas.length);
        setFading(false);
      }, 500);
    }, 8000);
    return () => clearInterval(timer);
  }, [ideas.length]);

  const idea = ideas[currentIndex];
  if (!idea) return null;

  return (
    <div className="relative w-full h-[460px] rounded-2xl overflow-hidden mb-12 shadow-2xl">
      <div className={`absolute inset-0 transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        <UnsplashImage
          genre={idea.genre}
          keyword={idea.title}
          orientation="landscape"
          className="w-full h-full object-cover"
          alt={idea.title}
        />
      </div>
      <div className="absolute inset-0 gradient-scrim" />
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <div className={`transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md ${getGenrePillColor(idea.genre)}`}>
              {idea.genre}
            </span>
            <span className="text-sm text-white/60">{idea.format} · {idea.targetBroadcaster}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-2xl drop-shadow-lg">{idea.title}</h2>
          <p className="text-base text-white/80 mt-3 max-w-xl leading-relaxed">{idea.logline}</p>
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => onAdd(idea)}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-xl hover:scale-105 transition-transform"
            >
              <ThumbsUp className="w-4 h-4" />
              Add to Pipeline
            </button>
            <button
              onClick={() => onPass(idea)}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/15 backdrop-blur-sm text-white font-bold text-sm border border-white/20 hover:bg-verdict-red hover:border-transparent transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              Pass
            </button>
            <button
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/15 backdrop-blur-sm text-white font-bold text-sm border border-white/20 hover:bg-white/25 transition-colors"
            >
              <Telescope className="w-4 h-4" />
              Deep Dive
            </button>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      {ideas.length > 1 && (
        <div className="absolute bottom-4 right-6 flex gap-1.5">
          {ideas.slice(0, Math.min(ideas.length, 5)).map((_, i) => (
            <button
              key={i}
              onClick={() => { setFading(true); setTimeout(() => { setCurrentIndex(i); setFading(false); }, 300); }}
              className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-6' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Carousel Row ─── */
function SlateRow({ label, ideas, onAdd, onPass }: { slateId: SlateId; label: string; ideas: ShowIdea[]; onAdd: (idea: ShowIdea) => void; onPass: (idea: ShowIdea) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    setTimeout(checkScroll, 400);
  };

  if (ideas.length === 0) return null;

  return (
    <div className="mb-12 group/row relative">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-2xl font-bold text-foreground">{label}</h3>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-card transition-colors opacity-0 group-hover/row:opacity-100 max-md:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canScrollRight && (
          <button onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-card transition-colors opacity-0 group-hover/row:opacity-100 max-md:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <div ref={scrollRef} onScroll={checkScroll}
          className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-pl-2"
        >
          {ideas.map(idea => (
            <ShowCard key={idea.id} idea={idea} onAdd={onAdd} onPass={onPass} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Library ─── */
export function DiscoverLibrary() {
  const { slates, swipeRight, swipeLeft } = useDevSlate();
  const [activeFilter, setActiveFilter] = useState<SlateId | 'all'>('all');

  const allIdeas = useMemo(() => {
    const ideas: ShowIdea[] = [];
    for (const config of SLATE_CONFIGS) {
      ideas.push(...slates[config.id].deck);
    }
    return ideas;
  }, [slates]);

  // Pick first 5 for hero rotation
  const heroIdeas = allIdeas.slice(0, 5);

  const handleAdd = (idea: ShowIdea) => {
    swipeRight(idea.slateId, idea);
  };
  const handlePass = (idea: ShowIdea) => {
    swipeLeft(idea.slateId, idea);
  };

  const filteredConfigs = activeFilter === 'all'
    ? SLATE_CONFIGS
    : SLATE_CONFIGS.filter(c => c.id === activeFilter);

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

      {/* Hero banner */}
      {heroIdeas.length > 0 && <HeroBanner ideas={heroIdeas} onAdd={handleAdd} onPass={handlePass} />}

      {/* Slate rows */}
      {filteredConfigs.map(config => (
        <SlateRow
          key={config.id}
          slateId={config.id}
          label={config.label}
          ideas={slates[config.id].deck}
          onAdd={handleAdd}
          onPass={handlePass}
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
