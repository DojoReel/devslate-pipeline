import { PipelineIdea, DeepDiveReport } from '@/types/devslate';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
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
          <p className="mt-3 md:mt-4 text-primary-foreground/90 text-sm md:text-lg leading-relaxed font-medium">{report.verdictReason}</p>
        </div>

        {/* Report sections */}
        <div className="p-4 md:p-6 space-y-3 md:space-y-4">

          <Section title="The Story" verified={report.storyVerified}>
            <p className="text-sm text-foreground leading-relaxed">{report.fullStory}</p>
            {report.verifiedDetail && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">{report.verifiedDetail}</p>
            )}
          </Section>

          <Section title="People & Access">
            <p className="text-sm text-foreground leading-relaxed">{report.people}</p>
          </Section>

          <Section title="Archive & Rights">
            <p className="text-sm text-foreground leading-relaxed">{report.archive}</p>
            {report.rightsDetail && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">{report.rightsDetail}</p>
            )}
          </Section>

          <Section title="Commission Check">
            <p className="text-sm text-foreground leading-relaxed">{report.commissionCheck}</p>
          </Section>

          <Section title="Broadcaster Fit">
            <p className="text-sm text-foreground leading-relaxed">{report.broadcasterFit}</p>
          </Section>

          <Section title="Format Recommendation">
            <p className="text-sm text-foreground leading-relaxed">{report.formatRecommendation}</p>
          </Section>

          <Section title="Why Now">
            <p className="text-sm text-foreground leading-relaxed">{report.whyNow}</p>
          </Section>

          {report.redFlags && (
            <Section title="Red Flags">
              <p className="text-sm text-foreground leading-relaxed">{report.redFlags}</p>
            </Section>
          )}

          {report.sources && (
            <Section title="Sources">
              <p className="text-sm text-muted-foreground leading-relaxed">{report.sources}</p>
            </Section>
          )}

          <p className="text-xs text-muted-foreground pt-2 text-center">
            Generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, verified }: { title: string; children: React.ReactNode; verified?: boolean }) {
  return (
    <div className="rounded-xl bg-background border border-border shadow-sm overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs md:text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h4>
          {verified !== undefined && (
            <span className="flex items-center gap-1 text-xs">
              {verified
                ? <><CheckCircle className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-500">Verified</span></>
                : <><AlertCircle className="w-4 h-4 text-amber-500" /> <span className="text-amber-500">Unverified</span></>
              }
            </span>
          )}
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
