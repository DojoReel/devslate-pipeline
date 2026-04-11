import { useDevSlate } from '@/context/DevSlateContext';
import { ShowIdea, SLATE_CONFIGS } from '@/types/devslate';
import { useCallback, useEffect, useRef, useState } from 'react';
import { preloadImage } from './UnsplashImage';
import { DiscoverIdeaCard } from './discover/DiscoverIdeaCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { CheckCircle, XCircle } from 'lucide-react';

const EASING_SLIDE = 'ease-in-out';
const EASING_PASS = 'ease-in';

type ActionType = 'add' | 'pass';

type AnimationPhase =
  | null
  | { type: 'slide'; direction: 'next' | 'prev'; targetIndex: number }
  | { type: 'action-exit'; action: ActionType; ideaId: string }
  | { type: 'action-enter'; action: ActionType; nextIndex: number };

interface PendingMutation {
  nextIndex: number;
  removedIdeaId: string;
}

// Non-custom slates only for Discover
const DISCOVER_SLATES = SLATE_CONFIGS.filter((config) => config.id !== 'custom');

function SlateSection({
  label,
  ideas,
  onAdd,
  onPass,
  isMobile,
}: {
  label: string;
  ideas: ShowIdea[];
  onAdd: (idea: ShowIdea) => void;
  onPass: (idea: ShowIdea) => void;
  isMobile: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [phase, setPhase] = useState<AnimationPhase>(null);
  const [showFlash, setShowFlash] = useState<'add' | 'pass' | null>(null);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const frameRefs = useRef<number[]>([]);
  const pendingMutationRef = useRef<PendingMutation | null>(null);

  const clearHandles = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    frameRefs.current.forEach((id) => window.cancelAnimationFrame(id));
    frameRefs.current = [];
  }, []);

  useEffect(() => () => clearHandles(), [clearHandles]);

  // Clamp index when ideas shrink
  useEffect(() => {
    if (pendingMutationRef.current) return;
    setCurrentIndex((prev) => Math.min(prev, Math.max(ideas.length - 1, 0)));
  }, [ideas.length]);

  // Preload next image
  useEffect(() => {
    const next = ideas[currentIndex + 1];
    if (next) preloadImage(next.title, next.genre);
  }, [currentIndex, ideas]);

  // Handle pending mutation (after idea removed from array)
  useEffect(() => {
    const pm = pendingMutationRef.current;
    if (!pm) return;
    if (ideas.some((i) => i.id === pm.removedIdeaId)) return;

    pendingMutationRef.current = null;
    const nextIdx = Math.min(pm.nextIndex, Math.max(ideas.length - 1, 0));
    setCurrentIndex(nextIdx);
    setPhase(null);
    setIsAnimating(false);
  }, [ideas]);

  // Arrow/dot navigation — simple track slide
  const navigateTo = useCallback((targetIndex: number) => {
    if (isAnimating) return;
    if (targetIndex < 0 || targetIndex >= ideas.length || targetIndex === currentIndex) return;

    setIsAnimating(true);
    setPhase({ type: 'slide', direction: targetIndex > currentIndex ? 'next' : 'prev', targetIndex });
    setCurrentIndex(targetIndex);

    clearHandles();
    timeoutRef.current = window.setTimeout(() => {
      setPhase(null);
      setIsAnimating(false);
    }, 320);
  }, [clearHandles, currentIndex, ideas.length, isAnimating]);

  const navigate = useCallback((dir: 'next' | 'prev') => {
    navigateTo(dir === 'next' ? currentIndex + 1 : currentIndex - 1);
  }, [currentIndex, navigateTo]);

  // Add/Pass actions — distinct exit animations
  const handleAction = useCallback((action: ActionType) => {
    if (isAnimating) return;
    const currentIdea = ideas[currentIndex];
    if (!currentIdea) return;

    const nextIdea = ideas[currentIndex + 1];
    const nextIndex = nextIdea ? currentIndex : Math.max(0, currentIndex - 1);

    clearHandles();
    setIsAnimating(true);

    setPhase({ type: 'action-exit', action, ideaId: currentIdea.id });
    setShowFlash(action);

    const exitDuration = 380;

    timeoutRef.current = window.setTimeout(() => {
      setShowFlash(null);
      pendingMutationRef.current = { nextIndex, removedIdeaId: currentIdea.id };
      if (action === 'add') onAdd(currentIdea);
      else onPass(currentIdea);
    }, exitDuration);
  }, [clearHandles, currentIndex, ideas, isAnimating, onAdd, onPass]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || isAnimating) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) navigate('next');
    else navigate('prev');
  }, [isAnimating, navigate]);

  if (ideas.length === 0) return null;

  // Compute exit style for the current card during action-exit
  const getExitStyle = (): React.CSSProperties => {
    if (!phase || phase.type !== 'action-exit') return {};

    if (phase.action === 'add') {
      return {
        transform: 'translateX(110%) translateY(-20px) rotate(8deg)',
        opacity: 0,
        transition: `transform 380ms ${EASING_PASS}, opacity 380ms ${EASING_PASS}`,
      };
    } else {
      return {
        transform: 'translateX(-110%) translateY(20px) rotate(-8deg)',
        opacity: 0,
        transition: `transform 380ms ${EASING_PASS}, opacity 380ms ${EASING_PASS}`,
      };
    }
  };

  // Track-based carousel rendering
  const trackStyle: React.CSSProperties = {
    transform: `translateX(-${currentIndex * 100}%)`,
    transition: phase?.type === 'slide'
      ? `transform 320ms ${EASING_SLIDE}`
      : 'none',
    willChange: 'transform',
  };

  const renderCards = () => (
    <div className="flex" style={trackStyle}>
      {ideas.map((idea, index) => {
        const isExiting = phase?.type === 'action-exit' && index === currentIndex;
        return (
          <div
            key={idea.id}
            className="w-full shrink-0 relative"
            style={isExiting ? getExitStyle() : undefined}
          >
            {/* Flash overlay */}
            {isExiting && showFlash && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                {showFlash === 'add' ? (
                  <CheckCircle className="w-20 h-20 text-green-400 animate-scale-in" style={{ opacity: 0.8 }} />
                ) : (
                  <XCircle className="w-20 h-20 text-muted-foreground animate-scale-in" style={{ opacity: 0.6 }} />
                )}
              </div>
            )}
            <DiscoverIdeaCard
              idea={idea}
              canGoPrev={index > 0}
              canGoNext={index < ideas.length - 1}
              isAnimating={isAnimating}
              onPrev={() => navigate('prev')}
              onNext={() => navigate('next')}
              onAdd={() => handleAction('add')}
              onPass={() => handleAction('pass')}
              showNavigation={!isMobile && ideas.length > 1}
              isMobile={isMobile}
            />
          </div>
        );
      })}
    </div>
  );

  const dotIndicators = ideas.length > 1 && (
    <div className="flex items-center justify-center gap-2 py-3">
      {ideas.map((idea, index) => (
        <button
          key={idea.id}
          onClick={() => navigateTo(index)}
          disabled={isAnimating}
          className={`h-2.5 w-2.5 rounded-full transition-all ${
            index === currentIndex ? 'scale-125 bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
          } disabled:pointer-events-none`}
        />
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-3">{label}</h2>
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {renderCards()}
        </div>
        {dotIndicators}
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-[24px] font-bold text-foreground">{label}</h2>
      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg w-[75%]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {renderCards()}
      </div>
      {ideas.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {ideas.map((idea, index) => (
            <button
              key={idea.id}
              onClick={() => navigateTo(index)}
              disabled={isAnimating}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                index === currentIndex ? 'scale-125 bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              } disabled:pointer-events-none`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DiscoverLibrary() {
  const { slates, swipeRight, swipeLeft } = useDevSlate();
  const isMobile = useIsMobile();

  const handleAdd = (idea: ShowIdea) => swipeRight(idea.slateId, idea);
  const handlePass = (idea: ShowIdea) => swipeLeft(idea.slateId, idea);

  return (
    <div className="animate-fade-in space-y-6 md:space-y-12">
      {DISCOVER_SLATES.map((config) => {
        const ideas = slates[config.id].deck;
        if (ideas.length === 0) return null;

        return (
          <SlateSection
            key={config.id}
            label={config.label}
            ideas={ideas}
            onAdd={handleAdd}
            onPass={handlePass}
            isMobile={isMobile}
          />
        );
      })}

      {DISCOVER_SLATES.every((config) => slates[config.id].deck.length === 0) && (
        <div className="flex h-80 flex-col items-center justify-center text-muted-foreground">
          <p className="text-lg font-semibold text-foreground">All ideas have been reviewed</p>
          <p className="mt-1 text-sm">Reset a slate to start fresh</p>
        </div>
      )}
    </div>
  );
}
