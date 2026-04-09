import { PipelineIdea, DeepDiveReport, BuildRoomDocument } from '@/types/devslate';
import { X, Loader2, FileText, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

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

  const handleCopy = async (content: string, docType: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedDoc(docType);
    setTimeout(() => setCopiedDoc(null), 2000);
  };

  const completedCount = documents.filter(d => d.status === 'complete').length;
  const totalCount = documents.length;

  const verdictBg = report.verdict === 'GREENLIGHT' ? 'bg-verdict-green' : 'bg-verdict-amber';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in card-shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between z-10 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">Build Room</h2>
              <span className={`px-3 py-1 rounded-md text-xs font-bold text-white ${verdictBg}`}>
                {report.verdict}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{idea.title} · {idea.format}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isGenerating && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Generating documents… {completedCount}/{totalCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Each document generated via separate AI call</p>
              </div>
            </div>
          )}

          {documents.map(doc => (
            <div key={doc.documentType} className="border border-border rounded-xl overflow-hidden bg-card">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedDoc(expandedDoc === doc.documentType ? null : doc.documentType)}
                disabled={doc.status !== 'complete'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="font-semibold text-foreground text-sm">{doc.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === 'pending' && <span className="text-xs text-muted-foreground">Waiting…</span>}
                  {doc.status === 'generating' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {doc.status === 'error' && <span className="text-xs text-destructive">Failed</span>}
                  {doc.status === 'complete' && (
                    expandedDoc === doc.documentType
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedDoc === doc.documentType && doc.status === 'complete' && (
                <div className="border-t border-border p-6 bg-background">
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => handleCopy(doc.content, doc.documentType)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedDoc === doc.documentType ? (
                        <><Check className="w-3 h-3" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copy</>
                      )}
                    </button>
                  </div>
                  <div className="buildroom-prose prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-headings:font-bold prose-strong:text-foreground prose-table:border-border prose-td:border-border prose-th:border-border prose-th:p-2 prose-td:p-2 prose-th:text-left prose-thead:border-b prose-thead:border-border">
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
