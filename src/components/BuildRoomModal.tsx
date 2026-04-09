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

  const verdictColors: Record<string, string> = {
    'GREENLIGHT': 'text-green-400 bg-green-500/10 border-green-500/30',
    'DEVELOP FURTHER': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  };

  const handleCopy = async (content: string, docType: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedDoc(docType);
    setTimeout(() => setCopiedDoc(null), 2000);
  };

  const completedCount = documents.filter(d => d.status === 'complete').length;
  const totalCount = documents.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-surface-2 border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface-2 border-b border-border p-6 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">Build Room</h2>
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${verdictColors[report.verdict]}`}>
                {report.verdict}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{idea.title} · {idea.format}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-3 text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isGenerating && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Generating documents… {completedCount}/{totalCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Each document is generated via a separate AI call</p>
              </div>
            </div>
          )}

          {documents.map(doc => (
            <div key={doc.documentType} className="border border-border rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-surface-3 transition-colors"
                onClick={() => setExpandedDoc(expandedDoc === doc.documentType ? null : doc.documentType)}
                disabled={doc.status !== 'complete'}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground text-sm">{doc.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === 'pending' && <span className="text-xs text-muted-foreground">Waiting…</span>}
                  {doc.status === 'generating' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {doc.status === 'error' && <span className="text-xs text-red-400">Failed</span>}
                  {doc.status === 'complete' && (
                    expandedDoc === doc.documentType
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedDoc === doc.documentType && doc.status === 'complete' && (
                <div className="border-t border-border p-4 bg-surface-1">
                  <div className="flex justify-end mb-3">
                    <button
                      onClick={() => handleCopy(doc.content, doc.documentType)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedDoc === doc.documentType ? (
                        <><Check className="w-3 h-3" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copy</>
                      )}
                    </button>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-secondary-foreground">
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
