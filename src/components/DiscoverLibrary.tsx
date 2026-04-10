import { useDevSlate } from '@/context/DevSlateContext';
import { ShowIdea, SLATE_CONFIGS } from '@/types/devslate';
import { useState, useCallback, useRef, useEffect } from 'react';
import { preloadImage } from './UnsplashImage';
import { DiscoverIdeaCard } from './discover/DiscoverIdeaCard';

const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const TRANSITION_DURATION = 350;

type SwipeDirection = 'left' | 'right';

interface PendingRemoval {
  entryOffset: number;
  ideaId: string;
  nextIndex: number;
}

interface ExitCardState {
  active: boolean;
  direction: SwipeDirection;
  idea: ShowIdea;
}

function SlateSection({
  label,
  ideas,
  onAdd,
  onPass,
}: {
  label: string;
  ideas: ShowIdea[];
  onAdd: (idea: ShowIdea) => void;
  onPass: (idea: ShowIdea) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [trackOffset, setTrackOffset] = useState(0);
  const [trackTransitionEnabled, setTrackTransitionEnabled] = useState(false);
  const [exitCard, setExitCard] = useState<ExitCardState | null>(null);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const animationTimeoutRef = useRef<number | null>(null);
  const animationFrameRefs = useRef<number[]>([]);
  const pendingRemovalRef = useRef<PendingRemoval | null>(null);

  const clearAnimationHandles = useCallback(() => {
    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    animationFrameRefs.current.forEach((frameId) => window.cancelAnimationFrame(frameId));
    animationFrameRefs.current = [];
  }, []);

  const queueAnimationStep = useCallback((callback: () => void) => {
    const firstFrame = window.requestAnimationFrame(() => {
      const secondFrame = window.requestAnimationFrame(callback);
      animationFrameRefs.current.push(secondFrame);
    });

    animationFrameRefs.current.push(firstFrame);
  }, []);

  const finishTrackAnimation = useCallback(() => {
    clearAnimationHandles();
    animationTimeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      setTrackTransitionEnabled(false);
    }, TRANSITION_DURATION);
  }, [clearAnimationHandles]);

  useEffect(() => () => clearAnimationHandles(), [clearAnimationHandles]);

  useEffect(() => {
    if (pendingRemovalRef.current) return;
    setCurrentIndex((prev) => Math.min(prev, Math.max(ideas.length - 1, 0)));
  }, [ideas.length]);

  useEffect(() => {
    const nextIdea = ideas[currentIndex + 1];
    if (nextIdea) {
      preloadImage(nextIdea.title, nextIdea.genre);
    }
  }, [currentIndex, ideas]);

  useEffect(() => {
    const pendingRemoval = pendingRemovalRef.current;
    if (!pendingRemoval) return;
    if (ideas.some((idea) => idea.id === pendingRemoval.ideaId)) return;

    if (ideas.length === 0) {
      pendingRemovalRef.current = null;
      setExitCard(null);
      setTrackOffset(0);
      setTrackTransitionEnabled(false);
      setIsAnimating(false);
      return;
    }

    clearAnimationHandles();
    setCurrentIndex(Math.min(pendingRemoval.nextIndex, ideas.length - 1));
    setTrackOffset(pendingRemoval.entryOffset);
    setTrackTransitionEnabled(false);
    setExitCard(null);

    queueAnimationStep(() => {
      setTrackTransitionEnabled(true);
      setTrackOffset(0);
      animationTimeoutRef.current = window.setTimeout(() => {
        pendingRemovalRef.current = null;
        setIsAnimating(false);
        setTrackTransitionEnabled(false);
      }, TRANSITION_DURATION);
    });
  }, [ideas, clearAnimationHandles, queueAnimationStep]);

  const navigateTo = useCallback((targetIndex: number) => {
    if (isAnimating || pendingRemovalRef.current) return;
    if (targetIndex < 0 || targetIndex > ideas.length - 1 || targetIndex === currentIndex) return;

    setIsAnimating(true);
    setTrackOffset(0);
    setTrackTransitionEnabled(true);
    setCurrentIndex(targetIndex);
    finishTrackAnimation();
  }, [currentIndex, finishTrackAnimation, ideas.length, isAnimating]);

  const navigate = useCallback((dir: 'next' | 'prev') => {
    const targetIndex = dir === 'next'
      ? Math.min(ideas.length - 1, currentIndex + 1)
      : Math.max(0, currentIndex - 1);

    navigateTo(targetIndex);
  }, [currentIndex, ideas.length, navigateTo]);

  const handleAction = useCallback((action: 'add' | 'pass') => {
    if (isAnimating || pendingRemovalRef.current) return;

    const currentIdea = ideas[currentIndex];
    if (!currentIdea) return;

    clearAnimationHandles();
    pendingRemovalRef.current = {
      entryOffset: action === 'add' ? -100 : 100,
      ideaId: currentIdea.id,
      nextIndex: currentIndex < ideas.length - 1 ? currentIndex : Math.max(0, currentIndex - 1),
    };

    setIsAnimating(true);
    setTrackTransitionEnabled(false);
    setExitCard({
      active: false,
      direction: action === 'add' ? 'right' : 'left',
      idea: currentIdea,
    });

    queueAnimationStep(() => {
      setExitCard((prev) => (prev ? { ...prev, active: true } : prev));
    });

    animationTimeoutRef.current = window.setTimeout(() => {
      if (action === 'add') onAdd(currentIdea);
      else onPass(currentIdea);
    }, TRANSITION_DURATION);
  }, [clearAnimationHandles, currentIndex, ideas, isAnimating, onAdd, onPass, queueAnimationStep]);

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

  const translateX = -(currentIndex * 100) + trackOffset;

  return (
    <div>
      <h2 className="mb-6 text-[24px] font-bold text-foreground">{label}</h2>

      <div
        className="relative h-[860px] overflow-hidden rounded-2xl border border-border bg-card shadow-lg md:h-[560px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {exitCard && (
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              opacity: exitCard.active ? 0 : 1,
              transform: `translateX(${exitCard.active ? (exitCard.direction === 'right' ? '100%' : '-100%') : '0%'})`,
              transition: `transform ${TRANSITION_DURATION}ms ${EASING}, opacity ${TRANSITION_DURATION}ms ${EASING}`,
              willChange: 'transform, opacity',
            }}
          >
            <DiscoverIdeaCard
              idea={exitCard.idea}
              canGoPrev={currentIndex > 0}
              canGoNext={currentIndex < ideas.length - 1}
              isAnimating={true}
              onPrev={() => undefined}
              onNext={() => undefined}
              onAdd={() => undefined}
              onPass={() => undefined}
              showNavigation={ideas.length > 1}
            />
          </div>
        )}

        <div
          className={`flex h-full ${exitCard ? 'opacity-0' : 'opacity-100'}`}
          style={{
            transform: `translateX(${translateX}%)`,
            transition: trackTransitionEnabled ? `transform ${TRANSITION_DURATION}ms ${EASING}` : 'none',
            willChange: 'transform',
          }}
        >
          {ideas.map((idea, index) => (
            <div key={idea.id} className="h-full w-full shrink-0">
              <DiscoverIdeaCard
                idea={idea}
                canGoPrev={index > 0}
                canGoNext={index < ideas.length - 1}
                isAnimating={isAnimating}
                onPrev={() => navigate('prev')}
                onNext={() => navigate('next')}
                onAdd={() => handleAction('add')}
                onPass={() => handleAction('pass')}
                showNavigation={ideas.length > 1}
              />
            </div>
          ))}
        </div>
      </div>

      {ideas.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {ideas.map((idea, index) => (
            <button
              key={idea.id}
              onClick={() => navigateTo(index)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                index === currentIndex ? 'scale-125 bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const DISCOVER_SLATES = SLATE_CONFIGS.filter((config) => config.id !== 'custom');

export function DiscoverLibrary() {
  const { slates, swipeRight, swipeLeft } = useDevSlate();

  const handleAdd = (idea: ShowIdea) => swipeRight(idea.slateId, idea);
  const handlePass = (idea: ShowIdea) => swipeLeft(idea.slateId, idea);

  const allSlates = [...DISCOVER_SLATES, SLATE_CONFIGS.find((config) => config.id === 'custom')!];

  return (
    <div className="animate-fade-in space-y-12">
      {allSlates.map((config) => {
        const ideas = slates[config.id].deck;
        if (ideas.length === 0) return null;

        return (
          <SlateSection
            key={config.id}
            label={config.id === 'custom' ? 'Custom Ideas' : config.label}
            ideas={ideas}
            onAdd={handleAdd}
            onPass={handlePass}
          />
        );
      })}

      {allSlates.every((config) => slates[config.id].deck.length === 0) && (
        <div className="flex h-80 flex-col items-center justify-center text-muted-foreground">
          <p className="text-lg font-semibold text-foreground">All ideas have been reviewed</p>
          <p className="mt-1 text-sm">Reset a slate to start fresh</p>
        </div>
      )}
    </div>
  );
}
