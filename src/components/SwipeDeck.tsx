import { useState, useRef, useEffect } from 'react';
import { ShowIdea, SlateId } from '@/types/devslate';
import { useDevSlate } from '@/context/DevSlateContext';
import { Check, X, ArrowRight, ArrowLeft } from 'lucide-react';

interface SwipeDeckProps {
  ideas: ShowIdea[];
  slateId: SlateId;
}

function useUnsplashImage(query: string) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    // Use Unsplash Source for a reliable random image based on keywords
    const encoded = encodeURIComponent(query);
    setUrl(`https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop&q=80`);
    
    // Try fetching a relevant image via Unsplash source redirect
    const img = new Image();
    const sourceUrl = `https://source.unsplash.com/800x600/?${encoded}`;
    img.onload = () => setUrl(sourceUrl);
    img.onerror = () => {}; // keep fallback
    img.src = sourceUrl;
  }, [query]);

  return url;
}

export function SwipeDeck({ ideas, slateId }: SwipeDeckProps) {
  const { swipeRight, swipeLeft } = useDevSlate();
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const currentIdea = ideas[0];
  const imageQuery = currentIdea ? `${currentIdea.genre} ${currentIdea.title} television` : '';
  const heroImage = useUnsplashImage(imageQuery);

  if (!currentIdea) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground animate-fade-in">
        <div className="text-6xl mb-4">✓</div>
        <p className="text-lg font-medium">Deck complete</p>
        <p className="text-sm mt-1 text-muted-foreground">All ideas have been reviewed for this slate</p>
      </div>
    );
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    setTimeout(() => {
      if (direction === 'right') {
        swipeRight(slateId, currentIdea);
      } else {
        swipeLeft(slateId, currentIdea);
      }
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
    if (dragX > 100) {
      handleSwipe('right');
    } else if (dragX < -100) {
      handleSwipe('left');
    } else {
      setDragX(0);
    }
  };

  const rotation = isDragging ? dragX * 0.04 : 0;
  const opacity = isDragging ? Math.max(0.6, 1 - Math.abs(dragX) / 400) : 1;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Card stack */}
      <div className="relative w-full max-w-md h-[480px]">
        {/* Background cards */}
        {ideas.slice(1, 3).map((idea, i) => (
          <div
            key={idea.id}
            className="absolute inset-0 rounded-2xl bg-surface-2 border border-border card-shadow"
            style={{
              transform: `scale(${0.95 - i * 0.03}) translateY(${(i + 1) * 10}px)`,
              zIndex: 2 - i,
              opacity: 0.4 - i * 0.15,
            }}
          />
        ))}

        {/* Active card */}
        <div
          className={`absolute inset-0 rounded-2xl overflow-hidden card-shadow cursor-grab active:cursor-grabbing select-none touch-none ${
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
          {/* Hero image background */}
          <div className="absolute inset-0 bg-surface-3">
            {heroImage && (
              <img
                src={heroImage}
                alt={currentIdea.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            )}
          </div>

          {/* Gradient scrim */}
          <div className="absolute inset-0 gradient-scrim" />

          {/* Swipe indicators */}
          {dragX > 50 && (
            <div className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-[hsl(var(--verdict-green))]/20 border-2 border-[hsl(var(--verdict-green))]/60 text-[hsl(var(--verdict-green))] text-sm font-bold tracking-wide rotate-12 backdrop-blur-sm">
              PIPELINE →
            </div>
          )}
          {dragX < -50 && (
            <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-destructive/20 border-2 border-destructive/60 text-destructive text-sm font-bold tracking-wide -rotate-12 backdrop-blur-sm">
              ← PASS
            </div>
          )}

          {/* Card content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-lg bg-primary/90 text-primary-foreground text-xs font-semibold tracking-wide uppercase">
                {currentIdea.genre}
              </span>
              <span className="px-3 py-1 rounded-lg bg-foreground/10 backdrop-blur-md text-foreground/90 text-xs font-medium">
                {currentIdea.format}
              </span>
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-2 leading-tight drop-shadow-lg">
              {currentIdea.title}
            </h2>

            <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3 mb-4">
              {currentIdea.logline}
            </p>

            <div className="flex items-center justify-between text-xs text-foreground/50 pt-3 border-t border-foreground/10">
              <span>{currentIdea.targetBroadcaster}</span>
              <span>{ideas.length} remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleSwipe('left')}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-surface-2 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-all card-shadow"
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
