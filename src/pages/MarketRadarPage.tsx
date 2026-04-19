import { useEffect, useState, useCallback } from 'react';
import { Radio, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

type Category = 'COMMISSION' | 'RATINGS' | 'FORMAT TREND' | 'INDUSTRY NEWS';

interface RadarItem {
  id: string;
  category: Category;
  headline: string;
  summary: string;
  broadcaster: string;
  published_date: string;
  source_url: string | null;
  created_at: string;
}

const CATEGORY_COLORS: Record<Category, string> = {
  'COMMISSION': 'bg-verdict-green text-primary-foreground',
  'RATINGS': 'bg-blue-500 text-primary-foreground',
  'FORMAT TREND': 'bg-purple-500 text-primary-foreground',
  'INDUSTRY NEWS': 'bg-muted-foreground text-primary-foreground',
};

const FILTER_OPTIONS: { label: string; value: Category | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Commissions', value: 'COMMISSION' },
  { label: 'Ratings', value: 'RATINGS' },
  { label: 'Format Trends', value: 'FORMAT TREND' },
  { label: 'Industry News', value: 'INDUSTRY NEWS' },
];

const SEARCH_FN_URL = 'https://bskhuacewntnrocedwkc.supabase.co/functions/v1/search-market-radar';

function formatAuDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MarketRadarPage() {
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL');
  const [items, setItems] = useState<RadarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = useCallback(async () => {
    setError(null);
    const { data, error: fetchErr } = await (supabase as any)
      .from('market_radar_items')
      .select('*')
      .order('published_date', { ascending: false })
      .limit(50);

    if (fetchErr) {
      setError(fetchErr.message);
      setItems([]);
    } else {
      setItems((data || []) as RadarItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(SEARCH_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      await res.text();
      await fetchItems();
    } catch (e: any) {
      setError(e?.message || 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = filter === 'ALL' ? items : items.filter(i => i.category === filter);

  const lastUpdated = items.length > 0
    ? formatAuDate(items[0].created_at)
    : '—';

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-2 gap-3">
        <div className="flex items-center gap-3">
          <Radio className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-extrabold text-foreground">Market Radar</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
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

      {/* Error state */}
      {error && !loading && (
        <div className="flex items-start gap-3 p-4 mb-6 bg-destructive/10 border border-destructive/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Couldn't load market intelligence</p>
            <p className="text-xs text-destructive/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-3 w-full mb-1.5" />
              <Skeleton className="h-3 w-5/6 mb-1.5" />
              <Skeleton className="h-3 w-2/3 mb-4" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center py-16 px-6 bg-card border border-border rounded-xl">
          <Radio className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm font-semibold text-foreground mb-1">No market intelligence yet</p>
          <p className="text-xs text-muted-foreground">Run a search to populate.</p>
        </div>
      )}

      {/* Cards grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS['INDUSTRY NEWS']}`}>
                  {item.category}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(item.published_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              {item.source_url ? (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-foreground leading-snug mb-2 hover:text-primary transition-colors"
                >
                  {item.headline}
                </a>
              ) : (
                <h3 className="text-sm font-bold text-foreground leading-snug mb-2">{item.headline}</h3>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.summary}</p>
              <div className="mt-4 pt-3 border-t border-border">
                <span className="text-[11px] font-semibold text-muted-foreground">{item.broadcaster}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
