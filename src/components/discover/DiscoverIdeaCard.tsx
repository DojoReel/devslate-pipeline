import { useState } from 'react';
import { ShowIdea } from '@/types/devslate';
import { getPicsumUrl } from '@/hooks/useUnsplashImage';

interface DiscoverIdeaCardProps {
  idea: ShowIdea;
  dragX?: number;
  isDragging?: boolean;
}

export function DiscoverIdeaCard({ idea, dragX = 0, isDragging = false }: DiscoverIdeaCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="w-full h-full cursor-pointer"
      style={{ perspective: '1200px' }}
      onClick={() => !isDragging && setFlipped(f => !f)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* FRONT */}
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
          <FrontFace idea={idea} dragX={dragX} />
        </div>

        {/* BACK */}
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <BackFace idea={idea} />
        </div>
      </div>
    </div>
  );
}

function FrontFace({ idea, dragX }: { idea: ShowIdea; dragX: number }) {
  const heroImage = getPicsumUrl(idea.title, 800, 1000);

  return (
    <>
      {/* Full bleed image */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        {heroImage && (
          <img src={heroImage} alt={idea.title} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Gradient scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-2xl" />

      {/* Genre tags top */}
      <div className="absolute top-4 left-4 flex gap-2">
        {idea.genre.split('×').map((g, i) => (
          <span key={i} className="rounded-full bg-foreground/20 backdrop-blur-sm px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
            {g.trim()}
          </span>
        ))}
      </div>

      {/* Flip hint */}
      <div className="absolute top-4 right-4">
        <span className="text-[11px] text-primary-foreground/60 font-medium">Tap for detail</span>
      </div>

      {/* Swipe indicators */}
      {dragX > 50 && (
        <div className="absolute top-1/2 right-6 -translate-y-1/2 rounded-full bg-emerald-500/80 px-4 py-2 text-sm font-black text-primary-foreground uppercase tracking-wider">
          PIPELINE →
        </div>
      )}
      {dragX < -50 && (
        <div className="absolute top-1/2 left-6 -translate-y-1/2 rounded-full bg-destructive/80 px-4 py-2 text-sm font-black text-primary-foreground uppercase tracking-wider">
          ← PASS
        </div>
      )}

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight">
          {idea.title}
        </h3>
        <p className="mt-2 text-sm text-primary-foreground/80 leading-relaxed line-clamp-3">
          {idea.hook}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs font-semibold text-primary-foreground/60">
            {idea.format}
          </span>
          <span className="text-xs font-semibold text-primary-foreground/60">
            {idea.targetBroadcaster}
          </span>
        </div>
      </div>
    </>
  );
}

function BackFace({ idea }: { idea: ShowIdea }) {
  return (
    <div className="w-full h-full overflow-y-auto rounded-2xl bg-card border border-border p-5 space-y-4">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">The Story</h4>
        <p className="text-sm text-foreground leading-relaxed">{idea.logline}</p>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Why Now</h4>
        <p className="text-sm text-foreground leading-relaxed">{idea.whyNow}</p>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">People & Access</h4>
        <p className="text-sm text-foreground leading-relaxed">{idea.peopleAccess}</p>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Archive</h4>
        <p className="text-sm text-foreground leading-relaxed">{idea.archiveStatus}</p>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Rights</h4>
        <p className="text-sm text-foreground leading-relaxed">{idea.rightsStatus}</p>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Comparables</h4>
        <p className="text-sm text-foreground leading-relaxed">{idea.comparables}</p>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Commission Check</h4>
        <p className="text-sm text-foreground leading-relaxed">{idea.commissionCheck}</p>
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">{idea.sources}</p>
      </div>
    </div>
  );
}
