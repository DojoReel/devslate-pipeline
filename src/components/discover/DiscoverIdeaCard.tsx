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
  isMobile: boolean;
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
  isMobile,
}: DiscoverIdeaCardProps) {
  const whyNow = extractWhyNow(idea);
  const meta = getIdeaMeta(idea);

  if (isMobile) {
    return (
      <div className="flex flex-col bg-card rounded-2xl border border-border overflow-hidden">
        {/* Image with genre + title overlay — scrolls naturally */}
        <div className="relative w-full overflow-hidden rounded-t-2xl" style={{ height: '45vw' }}>
          <UnsplashImage
            genre={idea.genre}
            keyword={idea.title}
            orientation="landscape"
            logline={idea.logline}
            className="absolute inset-0 h-full w-full object-cover"
            alt={idea.title}
            showLoadingState={true}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          {/* Genre + Title on image */}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground ${getGenrePillColor(idea.genre)}`}>
              {idea.genre}
            </span>
            <h3 className="text-2xl font-extrabold leading-tight text-white mt-1.5">
              {idea.title}
            </h3>
          </div>
        </div>

        {/* Info panel — continuous scroll */}
        <div className="flex flex-col p-4 overflow-hidden">
          <p className="text-[13px] text-muted-foreground">
            {idea.format} · {idea.targetBroadcaster}
          </p>

          {/* Full concept summary — no truncation */}
          <p className="text-[13px] leading-relaxed text-muted-foreground mt-2">
            {idea.hook}
          </p>

          {/* Stat grid: 2×2 compact */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { label: 'Why Now', value: idea.whyNow },
              { label: 'People & Access', value: idea.peopleAccess },
              { label: 'Archive', value: idea.archiveStatus },
              { label: 'Comparable Shows', value: idea.comparables },
              { label: 'Commission Check', value: idea.commissionCheck },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-muted/40 p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{stat.label}</p>
                <p className="text-xs font-semibold leading-snug text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Why Now: full text */}
          <div className="flex items-start gap-2 mt-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 shrink-0 pt-0.5">Why Now?</span>
            <p className="text-[13px] leading-snug text-foreground">{whyNow}</p>
          </div>

          {/* Buttons: side by side — Pass 40%, Add 60% */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={onPass}
              disabled={isAnimating}
              className="flex items-center justify-center gap-2 rounded-full border border-border bg-muted min-h-[48px] px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:pointer-events-none disabled:opacity-50"
              style={{ width: '40%' }}
            >
              <ThumbsDown className="h-4 w-4" />
              Pass
            </button>
            <button
              onClick={onAdd}
              disabled={isAnimating}
              className="flex items-center justify-center gap-2 rounded-full bg-primary min-h-[48px] px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-50"
              style={{ width: '60%' }}
            >
              <ThumbsUp className="h-4 w-4" />
              Add to Pipeline
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="relative flex w-full bg-card">
      <div className="relative w-[45%] shrink-0 overflow-hidden">
        <UnsplashImage
          genre={idea.genre}
          keyword={idea.title}
          orientation="landscape"
          logline={idea.logline}
          className="absolute inset-0 h-full w-full object-cover"
          alt={idea.title}
          showLoadingState={true}
        />
      </div>

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

      <div className="flex w-[55%] flex-col justify-between p-8">
        <div>
          <span className={`mb-4 inline-block rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm ${getGenrePillColor(idea.genre)}`}>
            {idea.genre}
          </span>

          <h3 className="mb-3 text-[32px] font-extrabold leading-tight text-foreground">
            {idea.title}
          </h3>

          <p className="mb-4 text-sm text-muted-foreground">
            {idea.format} · {idea.targetBroadcaster}
          </p>

          <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
            {idea.hook}
          </p>

          <div className="mb-5 grid grid-cols-2 gap-3">
            {[
              { label: 'Why Now', value: idea.whyNow },
              { label: 'People & Access', value: idea.peopleAccess },
              { label: 'Archive', value: idea.archiveStatus },
              { label: 'Comparable Shows', value: idea.comparables },
              { label: 'Commission Check', value: idea.commissionCheck },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-muted/40 p-3">
                <p className="mb-1 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="text-[13px] font-semibold leading-snug text-foreground">{stat.value}</p>
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
            onClick={onPass}
            disabled={isAnimating}
            className="flex items-center gap-2 rounded-full border border-border bg-muted px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <ThumbsDown className="h-4 w-4" />
            Pass
          </button>
          <button
            onClick={onAdd}
            disabled={isAnimating}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-50"
          >
            <ThumbsUp className="h-4 w-4" />
            Add to Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}
