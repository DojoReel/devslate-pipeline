import { useDevSlate } from '@/context/DevSlateContext';
import { ShowIdea, SLATE_CONFIGS, SlateId } from '@/types/devslate';
import { ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import { UnsplashImage } from './UnsplashImage';

const GENRE_PILL_COLORS: Record<string, string> = {
  'Documentary': 'bg-primary',
  'Political Documentary': 'bg-primary',
  'Natural History': 'bg-primary',
  'Factual Entertainment': 'bg-primary',
  'Human Interest': 'bg-primary',
  'Factual Drama': 'bg-primary',
  'True Crime': 'bg-primary',
  'Sports Documentary': 'bg-slate_accent-sport',
  'Sports Reality': 'bg-slate_accent-sport',
  'Adventure Sports': 'bg-slate_accent-sport',
  'Travel Food': 'bg-slate_accent-international',
  'Geopolitical Documentary': 'bg-slate_accent-international',
  'Current Affairs': 'bg-slate_accent-international',
  'Business Reality': 'bg-slate_accent-stan',
  'Competition Reality': 'bg-slate_accent-stan',
  'Behind the Scenes': 'bg-muted-foreground',
  'Custom': 'bg-muted-foreground',
};

function getGenrePillColor(genre: string) {
  return GENRE_PILL_COLORS[genre] || 'bg-primary';
}

function extractWhyNow(idea: ShowIdea): string {
  const whyNowMap: Record<string, string> = {
    'Outback Medics': 'Rural healthcare access is a growing national debate as climate events increase demand for remote medical services.',
    'First Languages': 'UNESCO has declared this the Decade of Indigenous Languages — time is running out for documentation.',
    'The Ballot': 'With record low trust in politicians, first-time voters are reshaping electoral engagement.',
    'Reef Patrol': 'Back-to-back mass bleaching events make reef conservation the defining environmental story of our era.',
    'New Roots': 'Australia\'s refugee intake is at its highest in a decade, transforming regional communities.',
    'Cold Cases Reloaded': 'Advances in forensic DNA and AI are solving cases that were impossible just five years ago.',
    'Hustle Sydney': 'The startup ecosystem is booming post-pandemic with record venture capital flowing into Australian founders.',
    'Underground Kings': 'Global opal prices have surged, drawing a new generation of miners to Coober Pedy.',
    'The Algorithm': 'Social media regulation is the hottest policy debate globally — audiences want to understand platform manipulation.',
    'Fight Camp': 'Boxing is experiencing a mainstream revival with crossover events drawing massive audiences.',
    'Grassroots': 'Community sport participation is rebounding post-COVID, but clubs face existential funding challenges.',
    'The Draft': 'The AFL draft has become a cultural event, with millions following prospect journeys on social media.',
    'Wave Hunters': 'Big wave surfing is gaining Olympic momentum and Southern Ocean conditions are producing record swells.',
    'Pacific Rising': 'COP climate conferences have put Pacific Island nations at the centre of global climate justice debates.',
    'Silk Road Kitchens': 'Central Asian cuisine is the next global food trend, driven by social media discovery.',
    'Border Towns': 'Geopolitical tensions are at their highest in decades — border communities are the human face of these conflicts.',
    'Pitch Lab': 'AI-assisted content development is transforming how producers create and pitch television concepts.',
  };
  return whyNowMap[idea.title] || 'This concept taps into current cultural conversations and audience demand for authentic, timely storytelling.';
}

interface IdeaMeta {
  format: string;
  fundingPath: string;
  comparables: string;
  complexity: string;
}

function getIdeaMeta(idea: ShowIdea): IdeaMeta {
  const metaMap: Record<string, IdeaMeta> = {
    'Outback Medics': { format: 'Observational Documentary', fundingPath: 'Screen Australia + ABC Commissioning', comparables: 'Ambulance (BBC), Australian Story (ABC)', complexity: 'High — remote location logistics' },
    'First Languages': { format: 'Authored Documentary', fundingPath: 'NITV + Screen Australia Indigenous Dept', comparables: 'First Australians (SBS), Language Matters (PBS)', complexity: 'Medium — community partnerships required' },
    'The Ballot': { format: 'Vérité Event Series', fundingPath: 'ABC + Documentary Australia Foundation', comparables: 'The Vote (Channel 4), Vote (Al Jazeera)', complexity: 'Medium — election cycle timing' },
    'Reef Patrol': { format: 'Natural History Hybrid', fundingPath: 'Screen Qld + ABC + Int\'l Pre-sales', comparables: 'Blue Planet (BBC), Reef Live (ABC)', complexity: 'High — underwater & aerial filming' },
    'New Roots': { format: 'Character-led Documentary', fundingPath: 'SBS Commissioning + Screen Australia', comparables: 'Go Back to Where You Came From (SBS)', complexity: 'Medium — sensitive access required' },
    'Cold Cases Reloaded': { format: 'True Crime Investigation', fundingPath: 'Stan Original + Screen NSW', comparables: 'The Night Caller (Stan), Underbelly', complexity: 'Medium — archival & legal clearance' },
    'Hustle Sydney': { format: 'Business Reality Series', fundingPath: 'Stan + Brand Partnerships', comparables: 'Shark Tank (Ten), Planet Startup', complexity: 'Low — studio + location hybrid' },
    'Underground Kings': { format: 'Factual Drama Hybrid', fundingPath: 'Stan + Screen SA + Int\'l', comparables: 'Outback Opal Hunters (Discovery)', complexity: 'High — underground filming' },
    'The Algorithm': { format: 'Competition Reality', fundingPath: 'Stan + Digital Platform Partnerships', comparables: 'The Circle (Netflix), Screentime (ABC)', complexity: 'Medium — tech integration' },
    'Fight Camp': { format: 'Sports Observational', fundingPath: 'Fox Sports + Screen NSW', comparables: 'Fighter (Stan), Last Chance U (Netflix)', complexity: 'Medium — gym & event access' },
    'Grassroots': { format: 'Sports Reality Series', fundingPath: 'Fox Sports Commissioning', comparables: 'Sunderland \'Til I Die (Netflix)', complexity: 'Low — season-long embed' },
    'The Draft': { format: 'Sports Documentary', fundingPath: 'Fox Footy + AFL Media Rights', comparables: 'Draft Day (film), Hard Knocks (HBO)', complexity: 'Medium — AFL access agreements' },
    'Wave Hunters': { format: 'Adventure Sports Doc', fundingPath: 'Fox Sports + Red Bull Media', comparables: '100 Foot Wave (HBO), Storm Surfers', complexity: 'High — ocean safety & drone crews' },
    'Pacific Rising': { format: 'Geopolitical Event Series', fundingPath: 'BBC Co-pro + Netflix + Screen Pacific', comparables: 'Chasing Coral (Netflix), Islands of Faith', complexity: 'High — multi-country shoots' },
    'Silk Road Kitchens': { format: 'Travel Food Series', fundingPath: 'Netflix + SBS Food + Tourism boards', comparables: 'Street Food (Netflix), Somebody Feed Phil', complexity: 'Medium — international travel' },
    'Border Towns': { format: 'Geopolitical Documentary', fundingPath: 'HBO Co-pro + BBC Storyville', comparables: 'Frontline (PBS), No Man\'s Land', complexity: 'High — conflict zone access' },
  };
  return metaMap[idea.title] || {
    format: idea.genre,
    fundingPath: 'Broadcaster License Fee + Screen Agency',
    comparables: 'TBD — market research pending',
    complexity: 'Medium — standard production',
  };
}

type TransitionDir = 'next' | 'prev' | null;

function SlateSection({
  label,
  ideas,
  onAdd,
  onPass,
  featured,
}: {
  slateId: SlateId;
  label: string;
  ideas: ShowIdea[];
  onAdd: (idea: ShowIdea) => void;
  onPass: (idea: ShowIdea) => void;
  featured: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [transitionDir, setTransitionDir] = useState<TransitionDir>(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const safeIndex = Math.min(index, Math.max(0, ideas.length - 1));
  const safeDisplayIndex = Math.min(displayIndex, Math.max(0, ideas.length - 1));
  const idea = ideas[safeDisplayIndex];

  const navigate = useCallback((dir: 'next' | 'prev') => {
    if (isAnimating) return;
    const newIndex = dir === 'next'
      ? Math.min(ideas.length - 1, safeIndex + 1)
      : Math.max(0, safeIndex - 1);
    if (newIndex === safeIndex) return;

    setIsAnimating(true);
    setTransitionDir(dir);

    // After exit animation, swap content and play enter
    setTimeout(() => {
      setDisplayIndex(newIndex);
      setIndex(newIndex);
      setTransitionDir(null);
      setTimeout(() => setIsAnimating(false), 350);
    }, 200);
  }, [isAnimating, safeIndex, ideas.length]);

  const prev = useCallback(() => navigate('prev'), [navigate]);
  const next = useCallback(() => navigate('next'), [navigate]);

  const handlePass = useCallback(() => {
    onPass(idea);
  }, [idea, onPass]);

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) next();
    else prev();
  }, [next, prev]);

  if (!idea) return null;

  const whyNow = extractWhyNow(idea);
  const meta = getIdeaMeta(idea);

  // Animation classes
  const getCardStyle = (): React.CSSProperties => {
    if (transitionDir === 'next') {
      return { transform: 'translateX(-80px)', opacity: 0, transition: 'transform 200ms cubic-bezier(0.4,0,0.2,1), opacity 200ms cubic-bezier(0.4,0,0.2,1)' };
    }
    if (transitionDir === 'prev') {
      return { transform: 'translateX(80px)', opacity: 0, transition: 'transform 200ms cubic-bezier(0.4,0,0.2,1), opacity 200ms cubic-bezier(0.4,0,0.2,1)' };
    }
    return { transform: 'translateX(0)', opacity: 1, transition: 'transform 350ms cubic-bezier(0.4,0,0.2,1), opacity 350ms cubic-bezier(0.4,0,0.2,1)' };
  };

  const getImageStyle = (): React.CSSProperties => {
    if (transitionDir) {
      return { transform: 'scale(1.05)', transition: 'transform 350ms cubic-bezier(0.4,0,0.2,1)' };
    }
    return { transform: 'scale(1)', transition: 'transform 500ms cubic-bezier(0.4,0,0.2,1)' };
  };

  return (
    <div>
      <h2 className="text-[24px] font-bold text-foreground mb-6">{label}</h2>

      <div
        className={`relative rounded-2xl overflow-hidden shadow-lg bg-card border border-border ${featured ? 'ring-2 ring-primary/30' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={getCardStyle()} className="flex flex-col md:flex-row">
          {/* Image — left 60% */}
          <div className="relative w-full md:w-[60%] min-h-[300px] md:min-h-[500px] overflow-hidden">
            <div style={getImageStyle()} className="w-full h-full">
              <UnsplashImage
                genre={idea.genre}
                keyword={idea.title}
                orientation="landscape"
                logline={idea.logline}
                className="w-full h-full object-cover"
                alt={idea.title}
              />
            </div>
            {featured && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-md">
                <Star className="w-3.5 h-3.5" />
                Featured
              </div>
            )}

            {ideas.length > 1 && (
              <>
                <button
                  onClick={prev}
                  disabled={safeIndex === 0 || isAnimating}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/70 backdrop-blur flex items-center justify-center text-foreground hover:bg-background/90 transition disabled:opacity-30 disabled:cursor-default"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  disabled={safeIndex === ideas.length - 1 || isAnimating}
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
                onClick={() => onAdd(idea)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:scale-105 transition-transform"
              >
                <ThumbsUp className="w-4 h-4" />
                Add to Pipeline
              </button>
              <button
                onClick={handlePass}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted text-muted-foreground font-semibold text-sm border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors"
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
                if (isAnimating || i === safeIndex) return;
                const dir = i > safeIndex ? 'next' : 'prev';
                setIsAnimating(true);
                setTransitionDir(dir);
                setTimeout(() => {
                  setDisplayIndex(i);
                  setIndex(i);
                  setTransitionDir(null);
                  setTimeout(() => setIsAnimating(false), 350);
                }, 200);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === safeIndex ? 'bg-primary scale-125' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
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

  let isFirst = true;

  return (
    <div className="animate-fade-in space-y-12">
      {DISCOVER_SLATES.map(config => {
        const ideas = slates[config.id].deck;
        if (ideas.length === 0) return null;

        const f = isFirst;
        if (isFirst) isFirst = false;

        return (
          <SlateSection
            key={config.id}
            slateId={config.id}
            label={config.label}
            ideas={ideas}
            onAdd={handleAdd}
            onPass={handlePass}
            featured={f}
          />
        );
      })}

      {DISCOVER_SLATES.every(c => slates[c.id].deck.length === 0) && (
        <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
          <p className="text-lg font-semibold text-foreground">All ideas have been reviewed</p>
          <p className="text-sm mt-1">Reset a slate to start fresh</p>
        </div>
      )}
    </div>
  );
}
