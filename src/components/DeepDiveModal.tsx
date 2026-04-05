import { PipelineIdea, DeepDiveReport } from '@/types/devslate';
import { X } from 'lucide-react';

interface DeepDiveModalProps {
  idea: PipelineIdea;
  report: DeepDiveReport;
  onClose: () => void;
}

export function DeepDiveModal({ idea, report, onClose }: DeepDiveModalProps) {
  const verdictColors: Record<string, string> = {
    'GREENLIGHT': 'text-green-400 bg-green-500/10 border-green-500/30',
    'DEVELOP FURTHER': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    'PASS': 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const sections = [
    { title: 'Competitive Landscape', content: report.competitiveLandscape },
    { title: 'Commissioner Fit', content: report.commissionerFit },
    { title: 'Target Audience', content: report.audience },
    { title: 'Talent & Access Requirements', content: report.talentAccess },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-surface-2 border border-border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface-2 border-b border-border p-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{idea.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{idea.format} · {idea.targetBroadcaster}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-3 text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Verdict */}
          <div className={`p-4 rounded-xl border ${verdictColors[report.verdict]}`}>
            <div className="text-lg font-bold">{report.verdict}</div>
            <p className="text-sm mt-1 opacity-80">{report.verdictRationale}</p>
          </div>

          {/* Report sections */}
          {sections.map(section => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <p className="text-secondary-foreground leading-relaxed text-sm">
                {section.content}
              </p>
            </div>
          ))}

          <div className="text-xs text-muted-foreground pt-4 border-t border-border">
            Generated {new Date(report.generatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
