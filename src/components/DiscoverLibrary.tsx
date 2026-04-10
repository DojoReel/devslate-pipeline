import { useDevSlate } from '@/context/DevSlateContext';
import { ShowIdea, SLATE_CONFIGS, SlateId } from '@/types/devslate';
import { ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { UnsplashImage, preloadImage } from './UnsplashImage';
import { getGenrePillColor, extractWhyNow, getIdeaMeta } from '@/lib/idea-meta';

const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const EXIT_DURATION = 400;
const ENTER_DURATION = 350;

type ExitDir = 'left' | 'right' | null;
type Phase = 'idle' | 'exiting' | 'entering';

function SlateSection({
  label,
  ideas,
  onAdd,
  onPass,
}: {
  slateId: SlateId;
  label: string;
  ideas: ShowIdea[];
  onAdd: (idea: ShowIdea) => void;
  onPass: (idea: ShowIdea) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [exitDir, setExitDir] = useState<ExitDir>(null);
  const [imageReady, setImageReady] = useState(true);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const pendingIndexRef = useRef<number | null>(null);

  const isAnimating = phase !== 'idle';
  const safeDisplayIndex = Math.min(displayIndex, Math.max(0, ideas.length - 1));
  const idea = ideas[safeDisplayIndex];

  // Preload next card's image
  useEffect(() => {
    const nextIdx = currentIndex + 1;
    if (nextIdx < ideas.length) {
      preloadImage(ideas[nextIdx].title, ideas[nextIdx].genre);
    }
  }, [currentIndex, ideas]);

  const triggerTransition = useCallback((targetIndex: number, direction: ExitDir) => {
    if (isAnimating) return;
    pendingIndexRef.current = targetIndex;
    setExitDir(direction);
    setPhase('exiting');

    setTimeout(() => {
      setDisplayIndex(targetIndex);
      setCurrentIndex(targetIndex);
      setImageReady(false);
      setExitDir(null);
      setPhase('entering');

      setTimeout(() => {
        setPhase('idle');
        pendingIndexRef.current = null;
      }, ENTER_DURATION);
    }, EXIT_DURATION);
  }, [isAnimating]);

  const navigate = useCallback((dir: 'next' | 'prev') => {
    const newIndex = dir === 'next'
      ? Math.min(ideas.length - 1, currentIndex + 1)
      : Math.max(0, currentIndex - 1);
    if (newIndex === currentIndex) return;
    triggerTransition(newIndex, dir === 'next' ? 'left' : 'right');
  }, [currentIndex, ideas.length, triggerTransition]);

  const handleAdd = useCallback(() => {
    if (isAnimating) return;
    onAdd(idea);
  }, [idea, onAdd, isAnimating]);

  const handlePass = useCallback(() => {
    if (isAnimating) return;
    onPass(idea);
  }, [idea, onPass, isAnimating]);

  // Touch handlers
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
  }, [navigate, isAnimating]);

  if (!idea) return null;

  const whyNow = extractWhyNow(idea);
  const meta = getIdeaMeta(idea);

  // Card animation styles
  const getCardStyle = (): React.CSSProperties => {
    if (phase === 'exiting') {
      const tx = exitDir === 'left' ? '-120px' : exitDir === 'right' ? '120px' : '0px';
      const ty = exitDir === 'right' ? '-30px' : exitDir === 'left' ? '-30px' : '0px';
      return {
        transform: `translate(${tx}, ${ty})`,
        opacity: 0,
        transition: `transform ${EXIT_DURATION}ms ${EASING}, opacity ${EXIT_DURATION}ms ${EASING}`,
      };
    }
    if (phase === 'entering') {
      return {
        transform: 'translate(0, 0)',
        opacity: 1,
        transition: `transform ${ENTER_DURATION}ms ${EASING}, opacity ${ENTER_DURATION}ms ${EASING}`,
      };
    }
    return {
      transform: 'translate(0, 0)',
      opacity: 1,
      transition: `transform ${ENTER_DURATION}ms ${EASING}, opacity ${ENTER_DURATION}ms ${EASING}`,
    };
  };

  // Initial enter offset for entering phase
  const getCardInitialStyle = (): React.CSSProperties | undefined => {
    if (phase === 'entering') {
      // Slide in from opposite direction
      const fromRight = exitDir === 'left' || (pendingIndexRef.current !== null && pendingIndexRef.current > displayIndex);
      return undefined; // We handle this via the entering phase directly
    }
    return undefined;
  };

  return (
    <div>
      <h2 className="text-[24px] font-bold text-foreground mb-6">{label}</h2>

      <div
        className="relative rounded-2xl overflow-hidden shadow-lg bg-card border border-border"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={getCardStyle()} className="flex flex-col md:flex-row">
          {/* Image — left 60% */}
          <div className="relative w-full md:w-[60%] min-h-[300px] md:min-h-[500px] overflow-hidden">
            <UnsplashImage
              genre={idea.genre}
              keyword={idea.title}
              orientation="landscape"
              logline={idea.logline}
              className="w-full h-full object-cover"
              alt={idea.title}
              showLoadingState={true}
              onImageReady={() => setImageReady(true)}
            />

            {ideas.length > 1 && (
              <>
                <button
                  onClick={() => navigate('prev')}
                  disabled={currentIndex === 0 || isAnimating}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/70 backdrop-blur flex items-center justify-center text-foreground hover:bg-background/90 transition disabled:opacity-30 disabled:cursor-default"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('next')}
                  disabled={currentIndex === ideas.length - 1 || isAnimating}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/70 backdrop-blur flex items-center justify-center text-foreground hover:bg-background/90 transition disabled:opacity-30 disabled:cursor-default"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Info — right 40% */}
          <div className="w-full md:w-[40%] p-8 md:p-10 flex flex-col justify-between">
            <div>
              <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm mb-5 ${getGenrePillColor(idea.genre)}`}>
                {idea.genre}
              </span>

              <h3 className="text-[32px] font-extrabold text-foreground leading-tight mb-3">
                {idea.title}
              </h3>

              <p className="text-sm text-muted-foreground mb-4">
                {idea.format} · {idea.targetBroadcaster}
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {idea.logline}
              </p>

              {/* Stat grid — 2x2 */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Format', value: meta.format },
                  { label: 'Funding Path', value: meta.fundingPath },
                  { label: 'Comparable Shows', value: meta.comparables },
                  { label: 'Production Complexity', value: meta.complexity },
                ].map(stat => (
                  <div key={stat.label} className="bg-muted/40 rounded-lg p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-xs font-semibold text-foreground leading-snug">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Why Now */}
              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Why Now?</p>
                <p className="text-sm text-foreground leading-relaxed">{whyNow}</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleAdd}
                disabled={isAnimating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:pointer-events-none"
              >
                <ThumbsUp className="w-4 h-4" />
                Add to Pipeline
              </button>
              <button
                onClick={handlePass}
                disabled={isAnimating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted text-muted-foreground font-semibold text-sm border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                <ThumbsDown className="w-4 h-4" />
                Pass
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      {ideas.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {ideas.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (isAnimating || i === currentIndex) return;
                const dir = i > currentIndex ? 'left' : 'right';
                triggerTransition(i, dir);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentIndex ? 'bg-primary scale-125' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const DISCOVER_SLATES = SLATE_CONFIGS.filter(c => c.id !== 'custom');

export function DiscoverLibrary() {
  const { slates, swipeRight, swipeLeft } = useDevSlate();

  const handleAdd = (idea: ShowIdea) => swipeRight(idea.slateId, idea);
  const handlePass = (idea: ShowIdea) => swipeLeft(idea.slateId, idea);

  const allSlates = [...DISCOVER_SLATES, SLATE_CONFIGS.find(c => c.id === 'custom')!];

  return (
    <div className="animate-fade-in space-y-12">
      {allSlates.map(config => {
        const ideas = slates[config.id].deck;
        if (ideas.length === 0) return null;

        return (
          <SlateSection
            key={config.id}
            slateId={config.id}
            label={config.id === 'custom' ? 'Custom Ideas' : config.label}
            ideas={ideas}
            onAdd={handleAdd}
            onPass={handlePass}
          />
        );
      })}

      {allSlates.every(c => slates[c.id].deck.length === 0) && (
        <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
          <p className="text-lg font-semibold text-foreground">All ideas have been reviewed</p>
          <p className="text-sm mt-1">Reset a slate to start fresh</p>
        </div>
      )}
    </div>
  );
}
