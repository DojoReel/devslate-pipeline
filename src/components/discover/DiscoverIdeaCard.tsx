import { useState } from 'react';
import { ShowIdea } from '@/types/devslate';
import { getPicsumUrl } from '@/hooks/useUnsplashImage';
import { Clock, Users, Archive, Globe, ShieldCheck, Tv } from 'lucide-react';

interface DiscoverIdeaCardProps {
  idea: ShowIdea;
  dragX?: number;
  isDragging?: boolean;
}

const DETAIL_TABS = [
  { key: 'whyNow', label: 'Why Now', icon: Clock },
  { key: 'peopleAccess', label: 'People', icon: Users },
  { key: 'archiveStatus', label: 'Archive', icon: Archive },
  { key: 'comparables', label: 'Comps', icon: Tv },
  { key: 'rightsStatus', label: 'Rights', icon: ShieldCheck },
  { key: 'commissionCheck', label: 'Commission', icon: Globe },
] as const;

type TabKey = typeof DETAIL_TABS[number]['key'];

export function DiscoverIdeaCard({ idea, dragX = 0, isDragging = false }: DiscoverIdeaCardProps) {
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const heroImage = getPicsumUrl(idea.title, 800, 1000);

  const handleTabClick = (e: React.MouseEvent, key: TabKey) => {
    e.stopPropagation();
    setActiveTab(prev => prev === key ? null : key);
  };

  const activeDetail = activeTab ? idea[activeTab] : null;

  return (
    <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden bg-card border border-border">

      {/* Hero image */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div className="absolute inset-0">
          {heroImage && (
            <img src={heroImage} alt={idea.title} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Genre tags top left */}
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

        {/* Title, hook, meta */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          {/* Active tab detail bubble */}
          {activeDetail && (
            <div className="mb-3 rounded-xl bg-card/95 backdrop-blur-sm border border-border p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {DETAIL_TABS.find(t => t.key === activeTab)?.label}
              </p>
              <p className="text-sm text-foreground leading-relaxed">{activeDetail}</p>
            </div>
          )}

          <h3 className="text-2xl font-extrabold text-primary-foreground leading-tight">{idea.title}</h3>
          <p className="mt-2 text-sm text-primary-foreground/80 leading-relaxed line-clamp-3">{idea.hook}</p>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary-foreground/60">
            <span>{idea.format}</span>
            <span>·</span>
            <span>{idea.targetBroadcaster}</span>
          </div>
        </div>
      </div>

      {/* Icon tab bar */}
      <div className="flex border-t border-border bg-card shrink-0">
        {DETAIL_TABS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={(e) => handleTabClick(e, key)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors border-r border-border last:border-r-0 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
