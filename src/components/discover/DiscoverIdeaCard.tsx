import { ShowIdea } from '@/types/devslate';
import { ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { UnsplashImage } from '@/components/UnsplashImage';
import { extractWhyNow, getGenrePillColor, getIdeaMeta } from '@/lib/idea-meta';

interface DiscoverIdeaCardProps {
  idea: ShowIdea;
  canGoPrev: boolean;
  canGoNext: boolean;
  isAnimating: boolean;
  onPrev: () => void;
  onNext: () => void;
  onAdd: () => void;
  onPass: () => void;
  showNavigation: boolean;
}

export function DiscoverIdeaCard({
  idea,
  canGoPrev,
  canGoNext,
  isAnimating,
  onPrev,
  onNext,
  onAdd,
  onPass,
  showNavigation,
}: DiscoverIdeaCardProps) {
  const whyNow = extractWhyNow(idea);
  const meta = getIdeaMeta(idea);

  return (
    <div className="flex h-full flex-col bg-card md:flex-row">
      <div className="relative h-[320px] w-full overflow-hidden md:h-full md:w-[60%]">
        <UnsplashImage
          genre={idea.genre}
          keyword={idea.title}
          orientation="landscape"
          logline={idea.logline}
          className="h-full w-full object-cover"
          alt={idea.title}
          showLoadingState={true}
        />

        {showNavigation && (
          <>
            <button
              onClick={onPrev}
              disabled={!canGoPrev || isAnimating}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition hover:bg-background/90 disabled:cursor-default disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={onNext}
              disabled={!canGoNext || isAnimating}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition hover:bg-background/90 disabled:cursor-default disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <div className="flex h-full w-full flex-col justify-between p-8 md:w-[40%] md:p-10">
        <div>
          <span className={`mb-5 inline-block rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm ${getGenrePillColor(idea.genre)}`}>
            {idea.genre}
          </span>

          <h3 className="mb-3 text-[32px] font-extrabold leading-tight text-foreground">
            {idea.title}
          </h3>

          <p className="mb-4 text-sm text-muted-foreground">
            {idea.format} · {idea.targetBroadcaster}
          </p>

          <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
            {idea.logline}
          </p>

          <div className="mb-5 grid grid-cols-2 gap-3">
            {[
              { label: 'Format', value: meta.format },
              { label: 'Funding Path', value: meta.fundingPath },
              { label: 'Comparable Shows', value: meta.comparables },
              { label: 'Production Complexity', value: meta.complexity },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-muted/40 p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="text-xs font-semibold leading-snug text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-muted/50 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Why Now?</p>
            <p className="text-sm leading-relaxed text-foreground">{whyNow}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={onAdd}
            disabled={isAnimating}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-50"
          >
            <ThumbsUp className="h-4 w-4" />
            Add to Pipeline
          </button>
          <button
            onClick={onPass}
            disabled={isAnimating}
            className="flex items-center gap-2 rounded-full border border-border bg-muted px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <ThumbsDown className="h-4 w-4" />
            Pass
          </button>
        </div>
      </div>
    </div>
  );
}