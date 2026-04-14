import { useState, useRef, useCallback } from 'react';
import { FlaskConical, Play, Loader2, CheckCircle2, Circle } from 'lucide-react';

const SLATES = [
  { slateId: 'crime', genre: 'Crime & Justice' },
  { slateId: 'environment', genre: 'Environment' },
  { slateId: 'sport', genre: 'Sport' },
  { slateId: 'culture', genre: 'Culture & Identity' },
  { slateId: 'character', genre: 'Character & Community' },
  { slateId: 'political', genre: 'Political & Power' },
  { slateId: 'history', genre: 'History & Archive' },
  { slateId: 'science', genre: 'Science & Technology' },
  { slateId: 'social', genre: 'Social Issues' },
  { slateId: 'firstnations', genre: 'First Nations' },
] as const;

type SlateStatus = 'idle' | 'running' | 'complete' | 'error';

interface SlateResult {
  status: SlateStatus;
  count: number | null;
  elapsed: number; // seconds
  error?: string;
}

const ENDPOINT = 'https://bskhuacewntnrocedwkc.supabase.co/functions/v1/research';

export default function ResearchAgentPage() {
  const [results, setResults] = useState<Record<string, SlateResult>>(() => {
    const init: Record<string, SlateResult> = {};
    SLATES.forEach(s => { init[s.slateId] = { status: 'idle', count: null, elapsed: 0 }; });
    return init;
  });
  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const runSlate = useCallback(async (slateId: string, genre: string) => {
    // Start timer
    setResults(prev => ({ ...prev, [slateId]: { status: 'running', count: null, elapsed: 0 } }));
    const start = Date.now();
    timers.current[slateId] = setInterval(() => {
      setResults(prev => ({
        ...prev,
        [slateId]: { ...prev[slateId], elapsed: Math.floor((Date.now() - start) / 1000) },
      }));
    }, 1000);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slateId, genre }),
      });
      const data = await res.json();
      clearInterval(timers.current[slateId]);
      const elapsed = Math.floor((Date.now() - start) / 1000);
      if (data.success) {
        setResults(prev => ({ ...prev, [slateId]: { status: 'complete', count: data.count ?? data.ideas?.length ?? 0, elapsed } }));
      } else {
        setResults(prev => ({ ...prev, [slateId]: { status: 'error', count: null, elapsed, error: data.error || 'Unknown error' } }));
      }
    } catch (err: any) {
      clearInterval(timers.current[slateId]);
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setResults(prev => ({ ...prev, [slateId]: { status: 'error', count: null, elapsed, error: err.message } }));
    }
  }, []);

  const researchAll = useCallback(() => {
    SLATES.forEach(s => {
      if (results[s.slateId].status !== 'running') {
        runSlate(s.slateId, s.genre);
      }
    });
  }, [results, runSlate]);

  const anyRunning = SLATES.some(s => results[s.slateId].status === 'running');
  const completedCount = SLATES.filter(s => results[s.slateId].status === 'complete').length;
  const totalFound = SLATES.reduce((sum, s) => sum + (results[s.slateId].count ?? 0), 0);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="px-4 py-6 md:px-10 md:py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-1">
        <FlaskConical className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Research Agent</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Run AI research across your slates to discover new ideas</p>

      {/* Research All + Status */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={researchAll}
          disabled={anyRunning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {anyRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Research All Slates
        </button>
        {(anyRunning || completedCount > 0) && (
          <span className="text-sm text-muted-foreground">
            {completedCount}/{SLATES.length} complete
            {totalFound > 0 && <span className="text-emerald-500 font-semibold ml-2">· {totalFound} ideas found</span>}
          </span>
        )}
      </div>

      {/* Slate Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SLATES.map(slate => {
          const r = results[slate.slateId];
          return (
            <div
              key={slate.slateId}
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center gap-3 min-w-0">
                {r.status === 'running' && <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />}
                {r.status === 'complete' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                {(r.status === 'idle' || r.status === 'error') && <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{slate.genre}</p>
                  {r.status === 'running' && (
                    <p className="text-xs text-muted-foreground">Running… {formatTime(r.elapsed)}</p>
                  )}
                  {r.status === 'complete' && r.count != null && r.count > 0 && (
                    <p className="text-xs text-emerald-500 font-medium">{r.count} new ideas found</p>
                  )}
                  {r.status === 'complete' && (r.count === 0 || r.count === null) && (
                    <p className="text-xs text-muted-foreground">0 new ideas</p>
                  )}
                  {r.status === 'error' && (
                    <p className="text-xs text-destructive">{r.error || 'Error'}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => runSlate(slate.slateId, slate.genre)}
                disabled={r.status === 'running'}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {r.status === 'running' ? formatTime(r.elapsed) : 'Research'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
