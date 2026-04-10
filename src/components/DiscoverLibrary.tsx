import { useDevSlate } from '@/context/DevSlateContext';
import { ShowIdea, SLATE_CONFIGS, SlateId } from '@/types/devslate';
import { ThumbsUp, ThumbsDown, Telescope, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useState, useCallback } from 'react';
import { UnsplashImage } from './UnsplashImage';

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

function extractBullets(idea: ShowIdea): string[] {
  const bullets: string[] = [];
  bullets.push(idea.format);
  bullets.push(`Target: ${idea.targetBroadcaster}`);
  const logWords = idea.logline.split(/[,.]/).filter(s => s.trim().length > 10);
  if (logWords.length > 1) {
    bullets.push(logWords[logWords.length - 1].trim());
  }
  return bullets;
}

/* ─── Single Slate Section with carousel ─── */
function SlateSection({
  slateId,
  label,
  ideas,
  onAdd,
  onPass,
  featured,
}: {
  slateId: SlateId;
  label: string;
  ideas: ShowIdea[];
  onAdd: (idea: ShowIdea) => void;
  onPass: (idea: ShowIdea) => void;
  featured: boolean;
}) {
  const [index, setIndex] = useState(0);

  const safeIndex = Math.min(index, ideas.length - 1);
  const idea = ideas[safeIndex];

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex(i => Math.min(ideas.length - 1, i + 1)), [ideas.length]);

  const handlePass = useCallback(() => {
    onPass(idea);
    // After pass, the idea is removed from deck so index stays or wraps
    // Don't change index — the next idea slides into this position
  }, [idea, onPass]);

  if (!idea) return null;

  const bullets = extractBullets(idea);

  return (
    <div>
      {/* Section label */}
      <h2 className="text-[24px] font-bold text-foreground mb-6">{label}</h2>

      {/* Card */}
      <div className={`relative flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-lg bg-card border border-border ${featured ? 'ring-2 ring-primary/30' : ''}`}>
        {/* Image — left 60% */}
        <div className="relative w-full md:w-[60%] min-h-[280px] md:min-h-[400px]">
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

          {/* Left/Right arrows on image */}
          {ideas.length > 1 && (
            <>
              <button
                onClick={prev}
                disabled={safeIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/70 backdrop-blur flex items-center justify-center text-foreground hover:bg-background/90 transition disabled:opacity-30 disabled:cursor-default"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                disabled={safeIndex === ideas.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/70 backdrop-blur flex items-center justify-center text-foreground hover:bg-background/90 transition disabled:opacity-30 disabled:cursor-default"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Info — right 40% */}
        <div className="w-full md:w-[40%] p-6 md:p-8 flex flex-col justify-between">
          <div>
            <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm mb-4 ${getGenrePillColor(idea.genre)}`}>
              {idea.genre}
            </span>

            <h3 className="text-2xl md:text-[28px] font-extrabold text-foreground leading-tight mb-2">
              {idea.title}
            </h3>

            <p className="text-sm text-muted-foreground mb-4">
              {idea.format} · {idea.targetBroadcaster}
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {idea.logline}
            </p>

            <ul className="space-y-1.5 mb-6">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onAdd(idea)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:scale-105 transition-transform"
            >
              <ThumbsUp className="w-4 h-4" />
              Add to Pipeline
            </button>
            <button
              onClick={handlePass}
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

      {/* Dot indicators */}
      {ideas.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {ideas.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === safeIndex ? 'bg-primary scale-125' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Library ─── */
export function DiscoverLibrary() {
  const { slates, swipeRight, swipeLeft } = useDevSlate();

  const handleAdd = (idea: ShowIdea) => swipeRight(idea.slateId, idea);
  const handlePass = (idea: ShowIdea) => swipeLeft(idea.slateId, idea);

  let isFirst = true;

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto space-y-12">
      {SLATE_CONFIGS.map(config => {
        const ideas = slates[config.id].deck;
        if (ideas.length === 0) return null;

        const featured = isFirst;
        if (isFirst) isFirst = false;

        return (
          <SlateSection
            key={config.id}
            slateId={config.id}
            label={config.label}
            ideas={ideas}
            onAdd={handleAdd}
            onPass={handlePass}
            featured={featured}
          />
        );
      })}

      {SLATE_CONFIGS.every(c => slates[c.id].deck.length === 0) && (
        <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
          <Telescope className="w-12 h-12 mb-4 opacity-40" />
          <p className="text-lg font-semibold text-foreground">All ideas have been reviewed</p>
          <p className="text-sm mt-1">Reset a slate to start fresh</p>
        </div>
      )}
    </div>
  );
}
