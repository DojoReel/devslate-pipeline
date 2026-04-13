import { PipelineIdea, DeepDiveReport } from '@/types/devslate';
import { X, Globe, Users, Sparkles, UserCheck, ShieldAlert, FileText, Radio, AlertTriangle } from 'lucide-react';
import { UnsplashImage } from './UnsplashImage';

interface DeepDiveModalProps {
  idea: PipelineIdea;
  report: DeepDiveReport;
  onClose: () => void;
}

function extractBullets(content: string): string[] {
  if (!content) return [];
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

export function DeepDiveModal({ idea, report, onClose }: DeepDiveModalProps) {
  const verdictConfig: Record<string, { bg: string; label: string }> = {
    'GREENLIGHT': { bg: 'bg-verdict-green', label: 'GREENLIGHT' },
    'DEVELOP FURTHER': { bg: 'bg-verdict-amber', label: 'DEVELOP FURTHER' },
    'PASS': { bg: 'bg-verdict-red', label: 'PASS' },
  };
  const verdict = verdictConfig[report.verdict] || verdictConfig['PASS'];
  const reasonBullets = report.verdictReason ? report.verdictReason.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 5).slice(0, 3) : [];

  const sections = [
    { title: 'Story Verified', content: report.verifiedDetail || '', icon: ShieldAlert, color: 'text-emerald-500', dotColor: 'bg-emerald-500', borderColor: 'border-t-emerald-500' },
    { title: 'Full Story', content: report.fullStory || '', icon: FileText, color: 'text-blue-500', dotColor: 'bg-blue-500', borderColor: 'border-t-blue-500' },
    { title: 'People & Access', content: report.people || '', icon: Users, color: 'text-purple-500', dotColor: 'bg-purple-500', borderColor: 'border-t-purple-500' },
    { title: 'Archive & Rights', content: `${report.archive || ''}\n${report.rightsDetail || ''}`.trim(), icon: Globe, color: 'text-amber-500', dotColor: 'bg-amber-500', borderColor: 'border-t-amber-500' },
    { title: 'Broadcaster Fit', content: report.broadcasterFit || '', icon: Radio, color: 'text-cyan-500', dotColor: 'bg-cyan-500', borderColor: 'border-t-cyan-500' },
    { title: 'Commission Check', content: report.commissionCheck || '', icon: Sparkles, color: 'text-pink-500', dotColor: 'bg-pink-500', borderColor: 'border-t-pink-500' },
    { title: 'Format Recommendation', content: report.formatRecommendation || '', icon: UserCheck, color: 'text-indigo-500', dotColor: 'bg-indigo-500', borderColor: 'border-t-indigo-500' },
    { title: 'Red Flags', content: report.redFlags || '', icon: AlertTriangle, color: 'text-red-500', dotColor: 'bg-red-500', borderColor: 'border-t-red-500' },
  ].filter(s => s.content.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-foreground/50 backdrop-blur-sm md:p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-t-2xl md:rounded-2xl w-full md:max-w-3xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto animate-fade-in shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header image */}
        <div className="relative w-full h-36 md:h-48 overflow-hidden rounded-t-2xl">
          <UnsplashImage genre={idea.genre} keyword={idea.title} orientation="landscape" className="w-full h-full object-cover" alt={idea.title} />
          <div className="absolute inset-0 gradient-scrim" />
          <button onClick={onClose} className="absolute top-3 md:top-4 right-3 md:right-4 p-2 rounded-full bg-foreground/20 hover:bg-foreground/40 text-primary-foreground transition-colors backdrop-blur-sm min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 md:bottom-4 left-4 md:left-6 right-4 md:right-6">
            <p className="text-primary-foreground/70 text-xs md:text-sm font-medium">{idea.format} · {idea.targetBroadcaster}</p>
            <h2 className="text-xl md:text-2xl font-extrabold text-primary-foreground mt-1">{idea.title}</h2>
          </div>
        </div>

        {/* Verdict banner */}
        <div className={`${verdict.bg} px-4 md:px-8 py-6 md:py-8`}>
          <h3 className="text-3xl md:text-5xl font-black text-primary-foreground tracking-tight">{verdict.label}</h3>
          <ul className="mt-3 md:mt-4 space-y-2">
            {reasonBullets.map((sentence, i) => (
              <li key={i} className="flex items-start gap-2 md:gap-3 text-primary-foreground/90 text-sm md:text-lg leading-relaxed font-medium">
                <span className="mt-2 md:mt-2.5 w-2 h-2 rounded-full bg-primary-foreground/60 shrink-0" />
                {sentence}
              </li>
            ))}
          </ul>
        </div>

        {/* Why Now */}
        {report.whyNow && (
          <div className="px-4 md:px-6 pt-4">
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Why Now?</p>
              <p className="text-sm leading-relaxed text-foreground">{report.whyNow}</p>
            </div>
          </div>
        )}

        {/* Research sections */}
        <div className="p-4 md:p-6 space-y-3 md:space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const bullets = extractBullets(section.content);
            const showAsProse = bullets.length === 0;
            return (
              <div key={section.title} className={`rounded-xl bg-background border border-border border-t-2 ${section.borderColor} shadow-sm overflow-hidden`}>
                <div className="p-4 md:p-6">
                  <div className="flex items-center gap-2.5 md:gap-3 mb-3 md:mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className={`w-4 h-4 md:w-5 md:h-5 ${section.color}`} />
                    </div>
                    <h4 className={`text-xs md:text-sm font-bold uppercase tracking-wide ${section.color}`}>{section.title}</h4>
                  </div>
                  {showAsProse ? (
                    <p className="text-sm text-foreground leading-relaxed">{section.content}</p>
                  ) : (
                    <ul className="space-y-2.5 md:space-y-3">
                      {bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5 md:gap-3 text-sm text-foreground leading-relaxed">
                          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${section.dotColor}`} />
                          <span dangerouslySetInnerHTML={{ __html: b.replace(/^([^:]+:)/, '<strong>$1</strong>') }} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}

          {/* Sources */}
          {report.sources && (
            <div className="rounded-xl bg-muted/30 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Sources</p>
              <p className="text-sm text-foreground leading-relaxed">{report.sources}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground pt-2 text-center">Generated {new Date(report.generatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
