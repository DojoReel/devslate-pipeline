import { useState, useRef } from 'react';
import { ShowIdea, SlateId } from '@/types/devslate';
import { useDevSlate } from '@/context/DevSlateContext';
import { Check, X } from 'lucide-react';

interface SwipeDeckProps {
  ideas: ShowIdea[];
  slateId: SlateId;
}

const GENRE_COLORS: Record<string, string> = {
  'Documentary': 'bg-primary text-primary-foreground',
  'Sport': 'bg-slate_accent-sport text-primary-foreground',
  'Drama': 'bg-slate_accent-stan text-primary-foreground',
  'International': 'bg-slate_accent-international text-primary-foreground',
};

// SwipeDeck uses UnsplashImage component directly — no local image helper needed

export function SwipeDeck({ ideas, slateId }: SwipeDeckProps) {
  const { swipeRight, swipeLeft } = useDevSlate();
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const currentIdea = ideas[0];
  const heroImage = currentIdea ? usePicsumImage(currentIdea.title) : null;

  if (!currentIdea) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold text-foreground">Deck complete</p>
        <p className="text-sm mt-1">All ideas reviewed for this slate</p>
      </div>
    );
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    setTimeout(() => {
      if (direction === 'right') swipeRight(slateId, currentIdea);
      else swipeLeft(slateId, currentIdea);
      setSwipeDirection(null);
      setDragX(0);
    }, 350);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - startX.current);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX > 100) handleSwipe('right');
    else if (dragX < -100) handleSwipe('left');
    else setDragX(0);
  };

  const rotation = isDragging ? dragX * 0.04 : 0;
  const opacity = isDragging ? Math.max(0.6, 1 - Math.abs(dragX) / 400) : 1;
  const genreStyle = GENRE_COLORS[currentIdea.genre] || 'bg-primary text-primary-foreground';

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Card stack */}
      <div className="relative w-full max-w-sm h-[520px]">
        {/* Background cards */}
        {ideas.slice(1, 3).map((idea, i) => (
          <div
            key={idea.id}
            className="absolute inset-0 rounded-2xl bg-card border border-border"
            style={{
              transform: `scale(${0.95 - i * 0.03}) translateY(${(i + 1) * 10}px)`,
              zIndex: 2 - i,
              opacity: 0.3 - i * 0.1,
            }}
          />
        ))}

        {/* Active card — tall magazine cover */}
        <div
          className={`absolute inset-0 rounded-2xl overflow-hidden card-shadow-lg cursor-grab active:cursor-grabbing select-none touch-none ${
            swipeDirection === 'right' ? 'animate-card-swipe-right' :
            swipeDirection === 'left' ? 'animate-card-swipe-left' :
            'animate-card-enter'
          }`}
          style={{
            zIndex: 10,
            transform: isDragging ? `translateX(${dragX}px) rotate(${rotation}deg)` : undefined,
            opacity,
            transition: isDragging ? 'none' : undefined,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Full bleed hero image */}
          <div className="absolute inset-0 bg-muted">
            {heroImage && (
              <img src={heroImage} alt={currentIdea.title} className="w-full h-full object-cover" loading="eager" />
            )}
          </div>

          {/* Gradient scrim */}
          <div className="absolute inset-0 gradient-scrim" />

          {/* Genre pill top-left */}
          <div className="absolute top-5 left-5">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${genreStyle}`}>
              {currentIdea.genre}
            </span>
          </div>

          {/* Swipe indicators */}
          {dragX > 50 && (
            <div className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-verdict-green/20 border-2 border-verdict-green/60 text-verdict-green text-sm font-bold tracking-wide rotate-12 backdrop-blur-sm">
              PIPELINE →
            </div>
          )}
          {dragX < -50 && (
            <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-verdict-red/20 border-2 border-verdict-red/60 text-verdict-red text-sm font-bold tracking-wide -rotate-12 backdrop-blur-sm">
              ← PASS
            </div>
          )}

          {/* Card content overlay — bottom */}
          <div className="absolute inset-x-0 bottom-0 p-6">
            <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight drop-shadow-lg">
              {currentIdea.title}
            </h2>
            <p className="text-sm text-white/80 leading-relaxed line-clamp-3 mb-4">
              {currentIdea.logline}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-sm text-white/90 font-medium">
                {currentIdea.format}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-sm text-white/90 font-medium">
                {currentIdea.targetBroadcaster}
              </span>
              <span className="ml-auto text-white/50">{ideas.length} remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleSwipe('left')}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-card border border-border text-muted-foreground hover:text-verdict-red hover:border-verdict-red/40 transition-all card-shadow"
        >
          <X className="w-5 h-5" />
          <span className="text-sm font-semibold">Pass</span>
        </button>

        <button
          onClick={() => handleSwipe('right')}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-all card-shadow"
        >
          <span className="text-sm font-semibold">Pipeline</span>
          <Check className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Drag card or use buttons · Right = Pipeline · Left = Pass
      </p>
    </div>
  );
}
