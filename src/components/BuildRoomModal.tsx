import { PipelineIdea, DeepDiveReport, BuildRoomDocument } from '@/types/devslate';
import { X, Loader2, FileText, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { getUnsplashUrl } from '@/hooks/useUnsplashImage';

interface BuildRoomModalProps {
  idea: PipelineIdea;
  report: DeepDiveReport;
  documents: BuildRoomDocument[];
  isGenerating: boolean;
  onClose: () => void;
}

export function BuildRoomModal({ idea, report, documents, isGenerating, onClose }: BuildRoomModalProps) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [copiedDoc, setCopiedDoc] = useState<string | null>(null);
  const imgUrl = getUnsplashUrl(idea.genre, idea.title, 1200, 400);

  const handleCopy = async (content: string, docType: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedDoc(docType);
    setTimeout(() => setCopiedDoc(null), 2000);
  };

  const completedCount = documents.filter(d => d.status === 'complete').length;
  const totalCount = documents.length;
  const verdictBg = report.verdict === 'GREENLIGHT' ? 'bg-verdict-green' : report.verdict === 'DEVELOP FURTHER' ? 'bg-verdict-amber' : 'bg-verdict-red';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative w-full h-44 overflow-hidden rounded-t-2xl">
          <img src={imgUrl} alt={idea.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-scrim" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-foreground/20 hover:bg-foreground/40 text-primary-foreground transition-colors backdrop-blur-sm">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider">Build Room</p>
              <h2 className="text-2xl font-extrabold text-primary-foreground mt-1">{idea.title}</h2>
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold text-primary-foreground ${verdictBg}`}>
              {report.verdict}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {isGenerating && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="text-sm font-bold text-foreground">Generating documents… {completedCount}/{totalCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Each document generated via separate AI call</p>
              </div>
            </div>
          )}

          {documents.map(doc => (
            <div key={doc.documentType} className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
              <button
                className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedDoc(expandedDoc === doc.documentType ? null : doc.documentType)}
                disabled={doc.status !== 'complete'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-bold text-foreground text-sm">{doc.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {doc.status === 'pending' && <span className="text-xs text-muted-foreground">Waiting…</span>}
                  {doc.status === 'generating' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {doc.status === 'error' && <span className="text-xs text-destructive font-medium">Failed</span>}
                  {doc.status === 'complete' && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(doc.content, doc.documentType); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedDoc === doc.documentType
                          ? <><Check className="w-3 h-3" /> Copied</>
                          : <><Copy className="w-3 h-3" /> Copy</>
                        }
                      </button>
                      {expandedDoc === doc.documentType
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      }
                    </>
                  )}
                </div>
              </button>

              {expandedDoc === doc.documentType && doc.status === 'complete' && (
                <div className="border-t border-border p-6 bg-background">
                  <div className="buildroom-prose prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-headings:font-bold prose-strong:text-foreground prose-table:border-border prose-td:border-border prose-th:border-border prose-th:p-3 prose-td:p-3 prose-th:text-left prose-thead:border-b prose-thead:border-border">
                    <ReactMarkdown>{doc.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
