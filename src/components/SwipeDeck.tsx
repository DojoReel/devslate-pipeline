import { useState, useRef } from 'react';
import { ShowIdea, SlateId } from '@/types/devslate';
import { useDevSlate } from '@/context/DevSlateContext';
import { Check, X, ArrowRight, ArrowLeft } from 'lucide-react';

interface SwipeDeckProps {
  ideas: ShowIdea[];
  slateId: SlateId;
}

export function SwipeDeck({ ideas, slateId }: SwipeDeckProps) {
  const { swipeRight, swipeLeft } = useDevSlate();
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const currentIdea = ideas[0];

  const accentClasses: Record<string, string> = {
    abc: 'border-slate_accent-abc/30',
    stan: 'border-slate_accent-stan/30',
    sport: 'border-slate_accent-sport/30',
    international: 'border-slate_accent-international/30',
    custom: 'border-slate_accent-custom/30',
  };

  const accentBgClasses: Record<string, string> = {
    abc: 'bg-slate_accent-abc',
    stan: 'bg-slate_accent-stan',
    sport: 'bg-slate_accent-sport',
    international: 'bg-slate_accent-international',
    custom: 'bg-slate_accent-custom',
  };

  if (!currentIdea) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground animate-fade-in">
        <div className="text-6xl mb-4">✓</div>
        <p className="text-lg font-medium">Deck complete</p>
        <p className="text-sm mt-1">All ideas have been reviewed for this slate</p>
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

  const rotation = isDragging ? dragX * 0.05 : 0;
  const opacity = isDragging ? Math.max(0.5, 1 - Math.abs(dragX) / 400) : 1;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card stack */}
      <div className="relative w-full max-w-md h-[420px]">
        {/* Background cards */}
        {ideas.slice(1, 3).map((idea, i) => (
          <div
            key={idea.id}
            className="absolute inset-0 rounded-xl bg-surface-2 border border-border"
            style={{
              transform: `scale(${0.95 - i * 0.03}) translateY(${(i + 1) * 8}px)`,
              zIndex: 2 - i,
              opacity: 0.5 - i * 0.2,
            }}
          />
        ))}

        {/* Active card */}
        <div
          className={`absolute inset-0 rounded-xl bg-surface-2 border-2 ${accentClasses[slateId]} p-6 cursor-grab active:cursor-grabbing select-none touch-none ${
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
          {/* Swipe indicators */}
          {dragX > 50 && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50 text-green-400 text-sm font-bold rotate-12">
              PIPELINE →
            </div>
          )}
          {dragX < -50 && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-bold -rotate-12">
              ← PASS
            </div>
          )}

          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${accentBgClasses[slateId]} text-primary-foreground`}>
                  {currentIdea.genre}
                </span>
                <span className="text-xs text-muted-foreground">
                  {currentIdea.format}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-3">
                {currentIdea.title}
              </h2>

              <p className="text-base text-secondary-foreground leading-relaxed">
                {currentIdea.logline}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
              <span>Target: {currentIdea.targetBroadcaster}</span>
              <span>{ideas.length} remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleSwipe('left')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-2 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <X className="w-5 h-5" />
          <span className="text-sm font-medium">Pass</span>
        </button>

        <button
          onClick={() => handleSwipe('right')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-2 border border-border text-muted-foreground hover:text-green-400 hover:border-green-500/30 transition-all"
        >
          <span className="text-sm font-medium">Pipeline</span>
          <Check className="w-5 h-5" />
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Drag card or use buttons · Right = Pipeline · Left = Pass
      </p>
    </div>
  );
}
