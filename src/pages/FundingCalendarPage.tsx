import { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarDays, ExternalLink, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

type FundingCategory = 'SCREEN AGENCY' | 'BROADCASTER' | 'INTERNATIONAL' | 'CO-PRODUCTION';

interface Deadline {
  id: string;
  funder: string;
  program: string;
  amount: string;
  deadline: string;
  category: FundingCategory;
  link?: string | null;
}

const CATEGORY_COLORS: Record<FundingCategory, string> = {
  'SCREEN AGENCY': 'bg-blue-500 text-primary-foreground',
  'BROADCASTER': 'bg-verdict-green text-primary-foreground',
  'INTERNATIONAL': 'bg-purple-500 text-primary-foreground',
  'CO-PRODUCTION': 'bg-verdict-amber text-primary-foreground',
};

const DOT_COLORS: Record<FundingCategory, string> = {
  'SCREEN AGENCY': 'bg-blue-500',
  'BROADCASTER': 'bg-verdict-green',
  'INTERNATIONAL': 'bg-purple-500',
  'CO-PRODUCTION': 'bg-verdict-amber',
};

const FILTER_OPTIONS: { label: string; value: FundingCategory | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Screen Agencies', value: 'SCREEN AGENCY' },
  { label: 'Broadcasters', value: 'BROADCASTER' },
  { label: 'International', value: 'INTERNATIONAL' },
  { label: 'Co-Production', value: 'CO-PRODUCTION' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SEARCH_FN_URL = 'https://bskhuacewntnrocedwkc.supabase.co/functions/v1/search-funding-calendar';

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function FundingCalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [filter, setFilter] = useState<FundingCategory | 'ALL'>('ALL');
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [items, setItems] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = useCallback(async (): Promise<Deadline[]> => {
    setError(null);
    const { data, error: fetchErr } = await (supabase as any)
      .from('funding_calendar_items')
      .select('*')
      .gte('deadline', todayIso())
      .order('deadline', { ascending: true });

    if (fetchErr) {
      setError(fetchErr.message);
      setItems([]);
      setLoading(false);
      return [];
    }
    const rows = (data || []) as Deadline[];
    setItems(rows);
    setLoading(false);
    return rows;
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    const baselineCount = items.length;
    try {
      const res = await fetch(SEARCH_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok && res.status !== 202) throw new Error(`Search failed (${res.status})`);
      await res.text();

      const start = Date.now();
      let latest: Deadline[] = items;
      while (Date.now() - start < 25000) {
        await new Promise((r) => setTimeout(r, 3000));
        const rows = await fetchItems();
        if (rows.length !== baselineCount) {
          latest = rows;
          break;
        }
      }
      const diff = Math.max(0, latest.length - baselineCount);
      toast.success(diff > 0 ? `Found ${diff} new deadline${diff === 1 ? '' : 's'}` : 'Search complete');
    } catch (e: any) {
      const msg = e?.message || 'Failed to refresh';
      setError(msg);
      toast.error('Refresh failed', { description: msg });
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = useMemo(() => {
    return filter === 'ALL' ? items : items.filter(d => d.category === filter);
  }, [filter, items]);

  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const deadlineDates = useMemo(() => {
    const map = new Map<string, FundingCategory>();
    items.forEach(d => {
      const date = new Date(d.deadline);
      if (date.getMonth() === calMonth && date.getFullYear() === calYear) {
        map.set(String(date.getDate()), d.category);
      }
    });
    return map;
  }, [items, calMonth, calYear]);

  const totalDays = daysInMonth(calYear, calMonth);
  const startDay = firstDayOfMonth(calYear, calMonth);
  const calCells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) calCells.push(null);
  for (let d = 1; d <= totalDays; d++) calCells.push(d);

  const goPrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const goNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-2 gap-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-extrabold text-foreground">Funding Calendar</h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Grant deadlines and broadcaster pitch windows — never miss an opportunity</p>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {FILTER_OPTIONS.map(opt => (
          <button key={opt.value} onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === opt.value ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}>{opt.label}</button>
        ))}
      </div>

      {error && !loading && (
        <div className="flex items-start gap-3 p-4 mb-6 bg-destructive/10 border border-destructive/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Couldn't load funding deadlines</p>
            <p className="text-xs text-destructive/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Calendar — left */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm self-start">
          <div className="flex items-center justify-between mb-4">
            <button onClick={goPrevMonth} className="text-muted-foreground hover:text-foreground text-sm font-bold px-2">←</button>
            <h3 className="text-sm font-bold text-foreground">{MONTHS[calMonth]} {calYear}</h3>
            <button onClick={goNextMonth} className="text-muted-foreground hover:text-foreground text-sm font-bold px-2">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-[10px] font-bold text-muted-foreground uppercase py-1">{d}</div>
            ))}
            {calCells.map((day, i) => {
              const cat = day ? deadlineDates.get(String(day)) : null;
              return (
                <div key={i} className={`relative flex flex-col items-center justify-center py-1.5 rounded-md text-xs ${day ? 'text-foreground' : ''}`}>
                  {day && <span className="font-medium">{day}</span>}
                  {cat && <span className={`mt-0.5 w-1.5 h-1.5 rounded-full ${DOT_COLORS[cat]}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Deadline list — right */}
        <div className="lg:col-span-3 space-y-3">
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 px-6 bg-card border border-border rounded-xl">
              <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm font-semibold text-foreground mb-1">No funding deadlines found</p>
              <p className="text-xs text-muted-foreground">Click Refresh to search.</p>
            </div>
          )}

          {!loading && filtered.map(item => {
            const deadlineDate = new Date(item.deadline);
            const isUrgent = deadlineDate <= thirtyDaysFromNow && deadlineDate >= today;
            return (
              <div key={item.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[item.category]}`}>
                    {item.category}
                  </span>
                  <span className={`text-xs font-bold ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {deadlineDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {isUrgent && ' ⚠️'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground mb-0.5">{item.funder}</h3>
                <p className="text-xs text-muted-foreground mb-2">{item.program}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{item.amount}</span>
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                      More Info <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                      More Info <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
