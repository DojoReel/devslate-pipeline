import { useState, useEffect, useCallback } from 'react';
import { Radio, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Category = 'COMMISSION' | 'RATINGS' | 'FORMAT TREND' | 'INDUSTRY NEWS';

interface RadarItem {
  id: string;
  category: Category;
  headline: string;
  summary: string;
  broadcaster: string;
  source_url: string | null;
  published_date: string;
  created_at: string;
}

const CATEGORY_COLORS: Record<Category, string> = {
  'COMMISSION': 'bg-green-500 text-white',
  'RATINGS': 'bg-blue-500 text-white',
  'FORMAT TREND': 'bg-purple-500 text-white',
  'INDUSTRY NEWS': 'bg-gray-500 text-white',
};

const FILTER_OPTIONS: { label: string; value: Category | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Commissions', value: 'COMMISSION' },
  { label: 'Ratings', value: 'RATINGS' },
  { label: 'Format Trends', value: 'FORMAT TREND' },
  { label: 'Industry News', value: 'INDUSTRY NEWS' },
];

const SEARCH_FN_URL = 'https://bskhuacewntnrocedwkc.supabase.co/functions/v1/search-market-radar';

export default function MarketRadarPage() {
  const [items, setItems] = useState<RadarItem[]>([]);
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const { data, error } = await (supabase as any)
      .from('market_radar_items')
      .select('*')
      .gte('published_date', sixMonthsAgo.toISOString().split('T')[0])
      .order('published_date', { ascending: false })
      .limit(60);
    if (error) {
      console.error('Supabase fetch error:', error);
    } else {
      setItems((data || []) as RadarItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(
        SEARCH_FN_URL,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );
      const result = await res.json();
      await fetchItems();
      toast({
        title: 'Market Radar updated',
        description: result.inserted > 0 ? `${result.inserted} new stories added` : 'Already up to date',
      });
    } catch (e) {
      console.error(e);
      toast({ title: 'Refresh failed', variant: 'destructive' });
    }
    setRefreshing(false);
  };

  const filtered = filter === 'ALL' ? items : items.filter(i => i.category === filter);

  const lastUpdated = items.length > 0
    ? new Date(items[0].created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-2 gap-3">
        <div className="flex items-center gap-3">
          <Radio className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-extrabold text-foreground">Market Radar</h1>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Searching...' : 'Refresh'}
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        What's getting made right now in Australian unscripted television
      </p>

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
        {!loading && (
          <span className="ml-2 text-xs font-semibold text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16 px-6 bg-card border border-border rounded-xl">
          <Radio className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm font-semibold text-foreground mb-1">No market intelligence yet</p>
          <p className="text-xs text-muted-foreground">
            Click Refresh to run your first search for real industry news.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    CATEGORY_COLORS[item.category] || CATEGORY_COLORS['INDUSTRY NEWS']
                  }`}
                >
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
