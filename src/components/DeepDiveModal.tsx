import { PipelineIdea, DeepDiveReport } from '@/types/devslate';
import { X, Globe, Users, Sparkles, UserCheck } from 'lucide-react';
import { UnsplashImage } from './UnsplashImage';

interface DeepDiveModalProps {
  idea: PipelineIdea;
  report: DeepDiveReport;
  onClose: () => void;
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="relative w-full h-52 overflow-hidden rounded-t-2xl">
          <UnsplashImage genre={idea.genre} keyword={idea.title} orientation="landscape" className="w-full h-full object-cover" alt={idea.title} />
          <div className="absolute inset-0 gradient-scrim" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-foreground/20 hover:bg-foreground/40 text-primary-foreground transition-colors backdrop-blur-sm">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-6 right-6">
            <p className="text-primary-foreground/70 text-sm font-medium">{idea.format} · {idea.targetBroadcaster}</p>
            <h2 className="text-2xl font-extrabold text-primary-foreground mt-1">{idea.title}</h2>
          </div>
        </div>
        <div className={`${verdict.bg} px-8 py-8`}>
          <h3 className="text-4xl md:text-5xl font-black text-primary-foreground tracking-tight">{verdict.label}</h3>
          <p className="text-primary-foreground/80 text-sm mt-3 leading-relaxed max-w-lg">{report.verdictRationale}</p>
        </div>
        <div className="p-6 grid gap-4">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="p-6 rounded-xl bg-background border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">{section.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground pt-2 text-center">Generated {new Date(report.generatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
