import { useDevSlate } from '@/context/DevSlateContext';
import { ShowIdea, SLATE_CONFIGS } from '@/types/devslate';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  | { type: 'action-enter'; action: ActionType; nextIndex: number }
  | { type: 'slate-switch' };

interface PendingMutation {
  nextIndex: number;
  removedIdeaId: string;
}

// Non-custom slates only for Discover
const DISCOVER_SLATES = SLATE_CONFIGS.filter((config) => config.id !== 'custom');

const SWIPE_THRESHOLD = 60;

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

  // Mobile drag state
  const [dragX, setDragX] = useState(0);
  const isDraggingRef = useRef(false);

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

  // Handle pending mutation
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

  // Mobile touch handlers with drag
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isAnimating) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isDraggingRef.current = false;
    setDragX(0);
  }, [isAnimating]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || isAnimating) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    if (!isDraggingRef.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      isDraggingRef.current = true;
    }
    if (isDraggingRef.current) {
      e.preventDefault();
      setDragX(dx);
    }
  }, [isAnimating]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || isAnimating) return;
    const dx = dragX;
    touchStartRef.current = null;
    isDraggingRef.current = false;
    setDragX(0);

    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      if (dx > 0) {
        handleAction('add');
      } else {
        handleAction('pass');
      }
    }
  }, [isAnimating, dragX, handleAction]);

  if (ideas.length === 0) return null;

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

  // Mobile drag style
  const getMobileDragStyle = (): React.CSSProperties => {
    if (phase?.type === 'action-exit') return getExitStyle();
    if (dragX === 0) return {};
    const tilt = (dragX / 300) * 5;
    return {
      transform: `translateX(${dragX}px) rotate(${tilt}deg)`,
      transition: 'none',
    };
  };

  const trackStyle: React.CSSProperties = {
    transform: `translateX(-${currentIndex * 100}%)`,
    transition: phase?.type === 'slide'
      ? `transform 320ms ${EASING_SLIDE}`
      : 'none',
    willChange: 'transform',
  };

  const dotIndicators = ideas.length > 1 && (
    <div className="flex items-center justify-center gap-2 py-2">
      {ideas.map((idea, index) => (
        <button
          key={idea.id}
          onClick={() => navigateTo(index)}
          disabled={isAnimating}
          className={`h-2 w-2 rounded-full transition-all ${
            index === currentIndex ? 'scale-125 bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
          } disabled:pointer-events-none`}
        />
      ))}
    </div>
  );

  if (isMobile) {
    const currentIdea = ideas[currentIndex];
    if (!currentIdea) return null;

    const isExiting = phase?.type === 'action-exit';
    const showAddOverlay = dragX > SWIPE_THRESHOLD;
    const showPassOverlay = dragX < -SWIPE_THRESHOLD;

    return (
      <div className="flex flex-col">
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag overlays */}
          {dragX !== 0 && (
            <>
              {showAddOverlay && (
                <div className="absolute inset-y-0 right-0 w-1/3 z-20 bg-green-500/20 flex items-center justify-center pointer-events-none rounded-r-2xl">
                  <CheckCircle className="w-12 h-12 text-green-500" style={{ opacity: 0.7 }} />
                </div>
              )}
              {showPassOverlay && (
                <div className="absolute inset-y-0 left-0 w-1/3 z-20 bg-red-500/20 flex items-center justify-center pointer-events-none rounded-l-2xl">
                  <XCircle className="w-12 h-12 text-red-500" style={{ opacity: 0.7 }} />
                </div>
              )}
            </>
          )}

          <div style={getMobileDragStyle()}>
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
              idea={currentIdea}
              canGoPrev={currentIndex > 0}
              canGoNext={currentIndex < ideas.length - 1}
              isAnimating={isAnimating}
              onPrev={() => navigate('prev')}
              onNext={() => navigate('next')}
              onAdd={() => handleAction('add')}
              onPass={() => handleAction('pass')}
              showNavigation={false}
              isMobile={true}
            />
          </div>
        </div>
        {dotIndicators}
      </div>
    );
  }

  // Desktop
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
  const { slates, activeSlate, swipeRight, swipeLeft } = useDevSlate();
  const isMobile = useIsMobile();
  const [slateTransition, setSlateTransition] = useState(false);
  const prevSlateRef = useRef(activeSlate);

  // Slate switch animation on mobile
  useEffect(() => {
    if (isMobile && prevSlateRef.current !== activeSlate) {
      setSlateTransition(true);
      const timer = setTimeout(() => setSlateTransition(false), 250);
      prevSlateRef.current = activeSlate;
      return () => clearTimeout(timer);
    }
    prevSlateRef.current = activeSlate;
  }, [activeSlate, isMobile]);

  const handleAdd = (idea: ShowIdea) => swipeRight(idea.slateId, idea);
  const handlePass = (idea: ShowIdea) => swipeLeft(idea.slateId, idea);

  // "All" section: first idea from each non-custom slate, shuffled once
  // MUST be called before any conditional returns to keep hook order stable
  const allIdeas = useMemo(() => {
    const picks: ShowIdea[] = [];
    for (const config of DISCOVER_SLATES) {
      const deck = slates[config.id].deck;
      if (deck.length > 0) picks.push(deck[0]);
    }
    // Fisher-Yates shuffle
    for (let i = picks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [picks[i], picks[j]] = [picks[j], picks[i]];
    }
    return picks;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mobile: single slate, single card
  if (isMobile) {
    const ideas = slates[activeSlate].deck;

    if (ideas.length === 0) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground px-4">
          <p className="text-base font-semibold text-foreground">All ideas reviewed</p>
          <p className="mt-1 text-sm">Switch slates or reset to see more</p>
        </div>
      );
    }

    return (
      <div
        className={`flex-1 flex flex-col px-4 transition-all duration-250 ${
          slateTransition ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <SlateSection
          label=""
          ideas={ideas}
          onAdd={handleAdd}
          onPass={handlePass}
          isMobile={true}
        />
      </div>
    );
  }

  // Filter allIdeas to only include ideas still present in their slate decks
  const filteredAllIdeas = allIdeas.filter((idea) =>
    slates[idea.slateId].deck.some((d) => d.id === idea.id)
  );

  // Desktop: all slates stacked
  return (
    <div className="animate-fade-in space-y-12">
      {filteredAllIdeas.length > 0 && (
        <SlateSection
          key="all"
          label="All"
          ideas={filteredAllIdeas}
          onAdd={handleAdd}
          onPass={handlePass}
          isMobile={false}
        />
      )}
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
            isMobile={false}
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
