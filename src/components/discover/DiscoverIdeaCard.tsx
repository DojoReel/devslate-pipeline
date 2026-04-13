import { useState } from 'react';
import { ShowIdea } from '@/types/devslate';
import { getPicsumUrl } from '@/hooks/useUnsplashImage';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DiscoverIdeaCardProps {
  idea: ShowIdea;
  dragX?: number;
  isDragging?: boolean;
}

export function DiscoverIdeaCard({ idea, dragX = 0, isDragging = false }: DiscoverIdeaCardProps) {
  const [expanded, setExpanded] = useState(false);
  const heroImage = getPicsumUrl(idea.title, 800, 1000);

  return (
    <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden bg-card border border-border">

      {/* Hero image — fixed height */}
      <div className="relative w-full" style={{ height: '340px', flexShrink: 0 }}>
        <div className="absolute inset-0 overflow-hidden">
          {heroImage && (
            <img src={heroImage} alt={idea.title} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Genre tags */}
        <div className="absolute top-4 left-4 flex gap-2">
          {idea.genre.split('×').map((g, i) => (
            <span key={i} className="rounded-full bg-foreground/20 backdrop-blur-sm px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
              {g.trim()}
            </span>
          ))}
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

        {/* Title and hook */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="text-2xl font-extrabold text-primary-foreground leading-tight">{idea.title}</h3>
          <p className="mt-2 text-sm text-primary-foreground/80 leading-relaxed line-clamp-3">{idea.hook}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs font-semibold text-primary-foreground/60">{idea.format}</span>
            <span className="text-xs font-semibold text-primary-foreground/60">{idea.targetBroadcaster}</span>
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
        className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors border-t border-border bg-card"
      >
        {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Less detail</> : <><ChevronDown className="w-3.5 h-3.5" /> More detail</>}
      </button>

      {/* Expandable detail */}
      {expanded && (
        <div className="overflow-y-auto p-5 space-y-3 border-t border-border bg-card">
          <DetailRow label="The Story" value={idea.logline} />
          <DetailRow label="Why Now" value={idea.whyNow} />
          <DetailRow label="People & Access" value={idea.peopleAccess} />
          <DetailRow label="Archive" value={idea.archiveStatus} />
          <DetailRow label="Rights" value={idea.rightsStatus} />
          <DetailRow label="Comparables" value={idea.comparables} />
          <DetailRow label="Commission Check" value={idea.commissionCheck} />
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed italic">{idea.sources}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-0.5">{label}</h4>
      <p className={`text-sm text-foreground leading-relaxed ${italic ? 'italic' : ''}`}>{value}</p>
    </div>
  );
}
