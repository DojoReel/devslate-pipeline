import { PipelineIdea, DeepDiveReport } from '@/types/devslate';
import { X, Globe, Users, Sparkles, UserCheck } from 'lucide-react';
import { UnsplashImage } from './UnsplashImage';

interface DeepDiveModalProps {
  idea: PipelineIdea;
  report: DeepDiveReport;
  onClose: () => void;
}

function extractBullets(content: string): string[] {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const bullets: string[] = [];

  for (const line of lines) {
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+[\.\)]/.test(line)) {
      bullets.push(line.replace(/^[•\-\*]\s*/, '').replace(/^\d+[\.\)]\s*/, ''));
    }
  }

  if (bullets.length === 0) {
    const sentences = content.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 4);
  }

  return bullets.slice(0, 4);
}

function extractRationaleBullets(text: string): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 5);
  return sentences.slice(0, 3);
}

export function DeepDiveModal({ idea, report, onClose }: DeepDiveModalProps) {
  const verdictConfig: Record<string, { bg: string; label: string }> = {
    'GREENLIGHT': { bg: 'bg-verdict-green', label: 'GREENLIGHT' },
    'DEVELOP FURTHER': { bg: 'bg-verdict-amber', label: 'DEVELOP FURTHER' },
    'PASS': { bg: 'bg-verdict-red', label: 'PASS' },
  };
  const verdict = verdictConfig[report.verdict] || verdictConfig['PASS'];
  const rationaleBullets = extractRationaleBullets(report.verdictRationale);

  const sections = [
    { title: 'Competitive Landscape', content: report.competitiveLandscape, icon: Globe, color: 'text-blue-500', dotColor: 'bg-blue-500', borderColor: 'border-t-blue-500' },
    { title: 'Commissioner Fit', content: report.commissionerFit, icon: Sparkles, color: 'text-amber-500', dotColor: 'bg-amber-500', borderColor: 'border-t-amber-500' },
    { title: 'Target Audience', content: report.audience, icon: Users, color: 'text-emerald-500', dotColor: 'bg-emerald-500', borderColor: 'border-t-emerald-500' },
    { title: 'Talent & Access', content: report.talentAccess, icon: UserCheck, color: 'text-purple-500', dotColor: 'bg-purple-500', borderColor: 'border-t-purple-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header image */}
        <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
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

        {/* Verdict banner */}
        <div className={`${verdict.bg} px-8 py-8`}>
          <h3 className="text-4xl md:text-5xl font-black text-primary-foreground tracking-tight">{verdict.label}</h3>
          <ul className="mt-4 space-y-2">
            {rationaleBullets.map((sentence, i) => (
              <li key={i} className="flex items-start gap-3 text-primary-foreground/90 text-base md:text-lg leading-relaxed font-medium">
                <span className="mt-2.5 w-2 h-2 rounded-full bg-primary-foreground/60 shrink-0" />
                {sentence}
              </li>
            ))}
          </ul>
        </div>

        {/* Research sections — pure information, no verdict language */}
        <div className="p-6 space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const bullets = extractBullets(section.content);
            return (
              <div key={section.title} className={`rounded-xl bg-background border border-border border-t-2 ${section.borderColor} shadow-sm overflow-hidden`}>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${section.color}`} />
                    </div>
                    <h4 className={`text-sm font-bold uppercase tracking-wide ${section.color}`}>{section.title}</h4>
                  </div>
                  <ul className="space-y-3">
                    {bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground leading-relaxed">
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${section.dotColor}`} />
                        <span dangerouslySetInnerHTML={{
                          __html: b.replace(/^([^:]+:)/, '<strong>$1</strong>')
                        }} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}

          <p className="text-xs text-muted-foreground pt-2 text-center">Generated {new Date(report.generatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
