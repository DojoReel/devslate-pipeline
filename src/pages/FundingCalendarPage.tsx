import { useState, useMemo } from 'react';
import { CalendarDays, ExternalLink } from 'lucide-react';

type FundingCategory = 'SCREEN AGENCY' | 'BROADCASTER' | 'INTERNATIONAL' | 'CO-PRODUCTION';

interface Deadline {
  id: string;
  funder: string;
  program: string;
  amount: string;
  deadline: string;
  category: FundingCategory;
  link?: string;
}

const CATEGORY_COLORS: Record<FundingCategory, string> = {
  'SCREEN AGENCY': 'bg-blue-500 text-primary-foreground',
  'BROADCASTER': 'bg-verdict-green text-primary-foreground',
  'INTERNATIONAL': 'bg-purple-500 text-primary-foreground',
  'CO-PRODUCTION': 'bg-verdict-amber text-primary-foreground',
};

const DEADLINES: Deadline[] = [
  { id: '1', funder: 'Screen Australia', program: 'Documentary Development', amount: '$30,000–$80,000', deadline: '2026-05-15', category: 'SCREEN AGENCY' },
  { id: '2', funder: 'Screen Australia', program: 'Producer Equity Program', amount: '$100,000–$500,000', deadline: '2026-06-30', category: 'SCREEN AGENCY' },
  { id: '3', funder: 'Screen Queensland', program: 'Documentary Funding Program', amount: '$50,000–$200,000', deadline: '2026-05-01', category: 'SCREEN AGENCY' },
  { id: '4', funder: 'VicScreen', program: 'Documentary Investment Stream', amount: '$50,000–$300,000', deadline: '2026-07-15', category: 'SCREEN AGENCY' },
  { id: '5', funder: 'SAFC', program: 'Documentary Production Fund', amount: '$40,000–$150,000', deadline: '2026-08-01', category: 'SCREEN AGENCY' },
  { id: '6', funder: 'Screenwest', program: 'WA Documentary Fund', amount: '$30,000–$120,000', deadline: '2026-06-15', category: 'SCREEN AGENCY' },
  { id: '7', funder: 'ABC', program: 'Factual Commissioning Round 2', amount: 'Licence fee negotiable', deadline: '2026-05-30', category: 'BROADCASTER' },
  { id: '8', funder: 'SBS', program: 'Documentary Commissioning Window', amount: 'Licence fee negotiable', deadline: '2026-06-01', category: 'BROADCASTER' },
  { id: '9', funder: 'NITV', program: 'First Nations Content Fund', amount: '$50,000–$250,000', deadline: '2026-07-01', category: 'BROADCASTER' },
  { id: '10', funder: 'MIPCOM', program: 'MIPCOM Cannes - October 2026', amount: 'Market event', deadline: '2026-10-12', category: 'INTERNATIONAL' },
  { id: '11', funder: 'Series Mania', program: 'Series Mania Forum - March 2027', amount: 'Market event', deadline: '2027-03-15', category: 'INTERNATIONAL' },
  { id: '12', funder: 'Screen Australia', program: 'International Co-Production Fund', amount: '$100,000–$400,000', deadline: '2026-09-01', category: 'CO-PRODUCTION' },
];

const FILTER_OPTIONS: { label: string; value: FundingCategory | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Screen Agencies', value: 'SCREEN AGENCY' },
  { label: 'Broadcasters', value: 'BROADCASTER' },
  { label: 'International', value: 'INTERNATIONAL' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function FundingCalendarPage() {
  const [filter, setFilter] = useState<FundingCategory | 'ALL'>('ALL');
  const [calMonth, setCalMonth] = useState(3); // April (0-indexed)
  const [calYear] = useState(2026);

  const filtered = useMemo(() => {
    const items = filter === 'ALL' ? DEADLINES : DEADLINES.filter(d => d.category === filter);
    return items.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [filter]);

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const deadlineDates = useMemo(() => {
    const map = new Map<string, FundingCategory>();
    DEADLINES.forEach(d => {
      const date = new Date(d.deadline);
      if (date.getMonth() === calMonth && date.getFullYear() === calYear) {
        map.set(String(date.getDate()), d.category);
      }
    });
    return map;
  }, [calMonth, calYear]);

  const totalDays = daysInMonth(calYear, calMonth);
  const startDay = firstDayOfMonth(calYear, calMonth);
  const calCells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) calCells.push(null);
  for (let d = 1; d <= totalDays; d++) calCells.push(d);

  const DOT_COLORS: Record<FundingCategory, string> = {
    'SCREEN AGENCY': 'bg-blue-500',
    'BROADCASTER': 'bg-verdict-green',
    'INTERNATIONAL': 'bg-purple-500',
    'CO-PRODUCTION': 'bg-verdict-amber',
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <CalendarDays className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-extrabold text-foreground">Funding Calendar</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Calendar — left */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm self-start">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCalMonth(m => Math.max(0, m - 1))} className="text-muted-foreground hover:text-foreground text-sm font-bold px-2">←</button>
            <h3 className="text-sm font-bold text-foreground">{MONTHS[calMonth]} {calYear}</h3>
            <button onClick={() => setCalMonth(m => Math.min(11, m + 1))} className="text-muted-foreground hover:text-foreground text-sm font-bold px-2">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-[10px] font-bold text-muted-foreground uppercase py-1">{d}</div>
            ))}
            {calCells.map((day, i) => {
              const cat = day ? deadlineDates.get(String(day)) : null;
              return (
                <div key={i} className={`relative flex flex-col items-center justify-center py-1.5 rounded-md text-xs ${
                  day ? 'text-foreground' : ''
                }`}>
                  {day && <span className="font-medium">{day}</span>}
                  {cat && <span className={`mt-0.5 w-1.5 h-1.5 rounded-full ${DOT_COLORS[cat]}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Deadline list — right */}
        <div className="lg:col-span-3 space-y-3">
          {filtered.map(item => {
            const deadlineDate = new Date(item.deadline);
            const isUrgent = deadlineDate <= thirtyDaysFromNow && deadlineDate >= now;
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
                  <button className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                    More Info <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
