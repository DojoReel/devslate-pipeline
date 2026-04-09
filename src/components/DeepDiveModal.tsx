import { PipelineIdea, DeepDiveReport } from '@/types/devslate';
import { X, Globe, Users, Sparkles, UserCheck } from 'lucide-react';

interface DeepDiveModalProps {
  idea: PipelineIdea;
  report: DeepDiveReport;
  onClose: () => void;
}

const SECTION_ICONS = {
  'Competitive Landscape': Globe,
  'Commissioner Fit': Sparkles,
  'Target Audience': Users,
  'Talent & Access': UserCheck,
};

export function DeepDiveModal({ idea, report, onClose }: DeepDiveModalProps) {
  const verdictConfig: Record<string, { bg: string; label: string }> = {
    'GREENLIGHT': { bg: 'bg-verdict-green', label: 'GREENLIGHT' },
    'DEVELOP FURTHER': { bg: 'bg-verdict-amber', label: 'DEVELOP FURTHER' },
    'PASS': { bg: 'bg-verdict-red', label: 'PASS' },
  };

  const verdict = verdictConfig[report.verdict] || verdictConfig['PASS'];

  const sections = [
    { title: 'Competitive Landscape', content: report.competitiveLandscape, icon: Globe },
    { title: 'Commissioner Fit', content: report.commissionerFit, icon: Sparkles },
    { title: 'Target Audience', content: report.audience, icon: Users },
    { title: 'Talent & Access', content: report.talentAccess, icon: UserCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-fade-in card-shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Verdict banner — full width, bold */}
        <div className={`${verdict.bg} px-8 py-8 rounded-t-2xl relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <p className="text-white/70 text-sm font-medium mb-1">{idea.title}</p>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">{verdict.label}</h2>
          <p className="text-white/80 text-sm mt-3 leading-relaxed max-w-lg">{report.verdictRationale}</p>
        </div>

        {/* Section cards */}
        <div className="p-6 grid gap-4">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="p-5 rounded-xl bg-background border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{section.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            );
          })}

          <p className="text-xs text-muted-foreground pt-2 text-center">
            Generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
