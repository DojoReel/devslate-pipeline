import { useState } from 'react';
import { Radio } from 'lucide-react';

type Category = 'COMMISSION' | 'RATINGS' | 'FORMAT TREND' | 'INDUSTRY NEWS';

interface RadarItem {
  id: string;
  category: Category;
  headline: string;
  summary: string;
  broadcaster: string;
  date: string;
}

const CATEGORY_COLORS: Record<Category, string> = {
  'COMMISSION': 'bg-verdict-green text-primary-foreground',
  'RATINGS': 'bg-blue-500 text-primary-foreground',
  'FORMAT TREND': 'bg-purple-500 text-primary-foreground',
  'INDUSTRY NEWS': 'bg-muted-foreground text-primary-foreground',
};

const PLACEHOLDER_ITEMS: RadarItem[] = [
  {
    id: '1', category: 'COMMISSION', headline: 'ABC Greenlights Four-Part Indigenous Land Rights Doc',
    summary: 'ABC Factual has commissioned "Sovereign Ground", a four-part documentary series exploring contemporary Indigenous land rights battles across three states. Production begins Q3 2026 with Blackfella Films attached.',
    broadcaster: 'ABC', date: '2026-04-08',
  },
  {
    id: '2', category: 'COMMISSION', headline: 'SBS Orders Climate Migration Series from Matchbox',
    summary: 'SBS has greenlit "Rising Tides", a six-part observational series following Pacific Islander families relocating to regional Australia. The commission includes an international pre-sale to BBC Three.',
    broadcaster: 'SBS', date: '2026-04-05',
  },
  {
    id: '3', category: 'RATINGS', headline: 'ABC Documentary Slate Hits Five-Year Ratings High',
    summary: 'ABC\'s Tuesday documentary slot averaged 780,000 metro viewers across Q1 2026, the strongest quarter since 2021. "Outback ER" led the charge with 1.1M consolidated viewers for its premiere.',
    broadcaster: 'ABC', date: '2026-04-03',
  },
  {
    id: '4', category: 'RATINGS', headline: 'Stan Originals Struggle Against Netflix Unscripted Push',
    summary: 'Stan\'s unscripted originals saw a 12% decline in completion rates in Q1, while Netflix Australia\'s local commissions grew viewership by 23%. Industry analysts point to scheduling and marketing gaps.',
    broadcaster: 'Stan', date: '2026-03-30',
  },
  {
    id: '5', category: 'FORMAT TREND', headline: 'Social Experiment Formats Surge Across Australian FTA',
    summary: 'Social experiment formats now account for 18% of all new unscripted commissions in Australia, up from 9% in 2024. Networks cite strong 16-39 demo performance and social media talkability as key drivers.',
    broadcaster: 'Industry-wide', date: '2026-04-06',
  },
  {
    id: '6', category: 'FORMAT TREND', headline: 'Renovation Fatigue: Home Reno Formats See Third Consecutive Decline',
    summary: 'Home renovation formats dropped another 15% in average audience year-on-year. Network 10 has shelved two reno pilots while Nine has reduced "The Block" to a single annual season.',
    broadcaster: 'Network 10 / Nine', date: '2026-03-28',
  },
  {
    id: '7', category: 'INDUSTRY NEWS', headline: 'Screen Australia Announces $45M Documentary Fund for 2026-27',
    summary: 'Screen Australia has unveiled a record $45M allocation for documentary production across the 2026-27 financial year, with priority streams for First Nations, climate, and regional stories.',
    broadcaster: 'Screen Australia', date: '2026-04-01',
  },
  {
    id: '8', category: 'INDUSTRY NEWS', headline: 'MIPCOM 2026: Australian Factual Commands Record International Interest',
    summary: 'Early MIPCOM registrations suggest Australian factual content is the fastest-growing category in international format sales, driven by unique wildlife, Indigenous culture, and adventure content.',
    broadcaster: 'MIPCOM', date: '2026-03-25',
  },
  {
    id: '9', category: 'COMMISSION', headline: 'Fox Sports Commissions Behind-the-Scenes AFL Draft Series',
    summary: 'Fox Sports has ordered an eight-part observational series embedded with three AFL clubs during the 2026 draft period. The series will follow prospects, recruiters, and families through the selection process.',
    broadcaster: 'Fox Sports', date: '2026-04-07',
  },
  {
    id: '10', category: 'INDUSTRY NEWS', headline: 'NITV Expands Commissioning Budget by 30%',
    summary: 'NITV has announced a significant expansion of its commissioning budget for 2026-27, with a focus on language preservation documentaries and First Nations-led factual entertainment.',
    broadcaster: 'NITV / SBS', date: '2026-03-20',
  },
];

const FILTER_OPTIONS: { label: string; value: Category | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Commissions', value: 'COMMISSION' },
  { label: 'Ratings', value: 'RATINGS' },
  { label: 'Format Trends', value: 'FORMAT TREND' },
  { label: 'Industry News', value: 'INDUSTRY NEWS' },
];

export default function MarketRadarPage() {
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL');

  const filtered = filter === 'ALL' ? PLACEHOLDER_ITEMS : PLACEHOLDER_ITEMS.filter(i => i.category === filter);

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <Radio className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-extrabold text-foreground">Market Radar</h1>
        </div>
        <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>
      <p className="text-sm text-muted-foreground mb-6">What's getting made right now in Australian unscripted television</p>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === opt.value
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(item => (
          <div key={item.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[item.category]}`}>
                {item.category}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {new Date(item.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <h3 className="text-sm font-bold text-foreground leading-snug mb-2">{item.headline}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.summary}</p>
            <div className="mt-4 pt-3 border-t border-border">
              <span className="text-[11px] font-semibold text-muted-foreground">{item.broadcaster}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
