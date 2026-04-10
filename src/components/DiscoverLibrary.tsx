import { useDevSlate } from '@/context/DevSlateContext';
import { ShowIdea, SLATE_CONFIGS } from '@/types/devslate';
import { useCallback, useEffect, useRef, useState } from 'react';
import { preloadImage } from './UnsplashImage';
import { DiscoverIdeaCard } from './discover/DiscoverIdeaCard';

const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const TRANSITION_DURATION = 350;

type ActionType = 'add' | 'pass';

interface ActionTransition {
  cards: ShowIdea[];
  transitionEnabled: boolean;
  translateX: number;
}

interface PendingMutation {
  nextIndex: number;
  removedIdeaId: string;
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
  const [trackTransitionEnabled, setTrackTransitionEnabled] = useState(false);
  const [actionTransition, setActionTransition] = useState<ActionTransition | null>(null);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const frameRefs = useRef<number[]>([]);
  const pendingMutationRef = useRef<PendingMutation | null>(null);

  const clearAnimationHandles = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    frameRefs.current.forEach((frameId) => window.cancelAnimationFrame(frameId));
    frameRefs.current = [];
  }, []);

  const queueAnimationStep = useCallback((callback: () => void) => {
    const firstFrame = window.requestAnimationFrame(() => {
      const secondFrame = window.requestAnimationFrame(callback);
      frameRefs.current.push(secondFrame);
    });

    frameRefs.current.push(firstFrame);
  }, []);

  useEffect(() => () => clearAnimationHandles(), [clearAnimationHandles]);

  useEffect(() => {
    if (pendingMutationRef.current) return;
    setCurrentIndex((prev) => Math.min(prev, Math.max(ideas.length - 1, 0)));
  }, [ideas.length]);

  useEffect(() => {
    const nextIdea = ideas[currentIndex + 1];
    if (nextIdea) {
      preloadImage(nextIdea.title, nextIdea.genre);
    }
  }, [currentIndex, ideas]);

  useEffect(() => {
    const pendingMutation = pendingMutationRef.current;
    if (!pendingMutation) return;
    if (ideas.some((idea) => idea.id === pendingMutation.removedIdeaId)) return;

    pendingMutationRef.current = null;
    setCurrentIndex(Math.min(pendingMutation.nextIndex, Math.max(ideas.length - 1, 0)));
    setActionTransition(null);
    setTrackTransitionEnabled(false);
    setIsAnimating(false);
  }, [ideas]);

  const finishTrackTransition = useCallback(() => {
    clearAnimationHandles();
    timeoutRef.current = window.setTimeout(() => {
      setTrackTransitionEnabled(false);
      setIsAnimating(false);
    }, TRANSITION_DURATION);
  }, [clearAnimationHandles]);

  const navigateTo = useCallback((targetIndex: number) => {
    if (actionTransition || isAnimating) return;
    if (targetIndex < 0 || targetIndex > ideas.length - 1 || targetIndex === currentIndex) return;

    setIsAnimating(true);
    setTrackTransitionEnabled(true);
    setCurrentIndex(targetIndex);
    finishTrackTransition();
  }, [actionTransition, currentIndex, finishTrackTransition, ideas.length, isAnimating]);

  const navigate = useCallback((dir: 'next' | 'prev') => {
    const targetIndex = dir === 'next'
      ? Math.min(ideas.length - 1, currentIndex + 1)
      : Math.max(0, currentIndex - 1);

    navigateTo(targetIndex);
  }, [currentIndex, ideas.length, navigateTo]);

  const handleAction = useCallback((action: ActionType) => {
    if (actionTransition || isAnimating) return;

    const currentIdea = ideas[currentIndex];
    if (!currentIdea) return;

    const nextIdea = ideas[currentIndex + 1];
    const previousIdea = ideas[currentIndex - 1];
    const targetIdea = nextIdea ?? previousIdea;
    const nextIndex = nextIdea ? currentIndex : Math.max(0, currentIndex - 1);

    const cards = targetIdea
      ? action === 'add'
        ? [targetIdea, currentIdea]
        : [currentIdea, targetIdea]
      : [currentIdea];

    const startTranslate = targetIdea ? (action === 'add' ? -100 : 0) : 0;
    const endTranslate = targetIdea ? (action === 'add' ? 0 : -100) : action === 'add' ? 100 : -100;

    clearAnimationHandles();
    setIsAnimating(true);
    setTrackTransitionEnabled(false);
    setActionTransition({
      cards,
      transitionEnabled: false,
      translateX: startTranslate,
    });

    queueAnimationStep(() => {
      setActionTransition((prev) => prev
        ? { ...prev, transitionEnabled: true, translateX: endTranslate }
        : prev);
    });

    timeoutRef.current = window.setTimeout(() => {
      pendingMutationRef.current = {
        nextIndex,
        removedIdeaId: currentIdea.id,
      };

      if (action === 'add') onAdd(currentIdea);
      else onPass(currentIdea);
    }, TRANSITION_DURATION);
  }, [actionTransition, clearAnimationHandles, currentIndex, ideas, isAnimating, onAdd, onPass, queueAnimationStep]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || isAnimating || actionTransition) return;

    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) navigate('next');
    else navigate('prev');
  }, [actionTransition, isAnimating, navigate]);

  if (ideas.length === 0) return null;

  return (
    <div>
      <h2 className="mb-6 text-[24px] font-bold text-foreground">{label}</h2>

      <div
        className="relative h-[860px] overflow-hidden rounded-2xl border border-border bg-card shadow-lg md:h-[560px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {actionTransition ? (
          <div
            className="flex h-full"
            style={{
              transform: `translateX(${actionTransition.translateX}%)`,
              transition: actionTransition.transitionEnabled
                ? `transform ${TRANSITION_DURATION}ms ${EASING}`
                : 'none',
              willChange: 'transform',
            }}
          >
            {actionTransition.cards.map((idea) => (
              <div key={`transition-${idea.id}`} className="h-full w-full shrink-0">
                <DiscoverIdeaCard
                  idea={idea}
                  canGoPrev={false}
                  canGoNext={false}
                  isAnimating={true}
                  onPrev={() => undefined}
                  onNext={() => undefined}
                  onAdd={() => undefined}
                  onPass={() => undefined}
                  showNavigation={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex h-full"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: trackTransitionEnabled
                ? `transform ${TRANSITION_DURATION}ms ${EASING}`
                : 'none',
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
        )}
      </div>

      {ideas.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {ideas.map((idea, index) => (
            <button
              key={idea.id}
              onClick={() => navigateTo(index)}
              disabled={isAnimating || !!actionTransition}
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
