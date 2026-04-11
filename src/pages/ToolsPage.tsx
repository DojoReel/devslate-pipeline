import { useDevSlate } from '@/context/DevSlateContext';
import { Radio, CalendarDays } from 'lucide-react';

const tools = [
  {
    id: 'market-radar' as const,
    label: 'Market Radar',
    icon: Radio,
    description: 'Track what\'s trending across broadcasters and streamers',
  },
  {
    id: 'funding-calendar' as const,
    label: 'Funding Calendar',
    icon: CalendarDays,
    description: 'Upcoming funding rounds, deadlines and commissioner cycles',
  },
];

export default function ToolsPage() {
  const { setCurrentView } = useDevSlate();

  return (
    <div className="px-4 py-6 md:px-10 md:py-8">
      <h2 className="text-xl font-bold text-foreground mb-1">Tools</h2>
      <p className="text-sm text-muted-foreground mb-6">Resources to sharpen your slate</p>

      <div className="grid grid-cols-1 gap-3">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setCurrentView(tool.id)}
            className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border text-left transition-colors hover:bg-accent/50 min-h-[72px]"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0 mt-0.5">
              <tool.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{tool.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tool.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
