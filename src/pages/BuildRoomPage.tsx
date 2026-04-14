import { useDevSlate } from '@/context/DevSlateContext';
import { PipelineIdea, BuildRoomDocument, SLATE_CONFIGS } from '@/types/devslate';
import { Hammer, Loader2, FileText, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { UnsplashImage } from '@/components/UnsplashImage';
import { getGenrePillColor } from '@/lib/idea-meta';
import { runBuildRoom } from '@/lib/api';

const DOC_TYPES = [
  { type: 'pitchDocument', label: 'Pitch Document' },
  { type: 'budgetEstimate', label: 'Budget Estimate' },
  { type: 'productionSchedule', label: 'Production Schedule' },
  { type: 'keyContacts', label: 'Key Contacts' },
  { type: 'fundingSources', label: 'Funding Sources' },
  { type: 'sponsorshipDeck', label: 'Sponsorship Deck' },
];

function BuildRoomIdeaCard({ idea }: { idea: PipelineIdea }) {
  const { updatePipelineIdea } = useDevSlate();
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [copiedDoc, setCopiedDoc] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const docs = idea.buildRoomDocs || DOC_TYPES.map(d => ({
    documentType: d.type,
    label: d.label,
    content: '',
    status: 'pending' as const,
  }));

  const handleCopy = async (content: string, docType: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedDoc(docType);
    setTimeout(() => setCopiedDoc(null), 2000);
  };

  const generateAllDocuments = async () => {
    // Skip if any doc is already complete or generating
    const currentDocs = idea.buildRoomDocs || DOC_TYPES.map(d => ({
      documentType: d.type, label: d.label, content: '', status: 'pending' as const,
    }));
    if (currentDocs.some(d => d.status === 'complete' || d.status === 'generating')) return;

    setGenerating(true);

    // Set all to generating
    const generatingDocs = currentDocs.map(d => ({ ...d, status: 'generating' as const }));
    updatePipelineIdea(idea.slateId, idea.id, { buildRoomDocs: generatingDocs });

    try {
      const documents = await runBuildRoom(idea, idea.report);
      console.log('[BuildRoom] Batch API result:', JSON.stringify(documents, null, 2));

      const finalDocs = generatingDocs.map(d => {
        const apiDoc = documents?.find((ad: any) => ad.documentType === d.documentType);
        return apiDoc
          ? { ...d, content: apiDoc.content, status: 'complete' as const }
          : d;
      });
      updatePipelineIdea(idea.slateId, idea.id, { buildRoomDocs: finalDocs });
    } catch (err) {
      console.error('Build room batch error:', err);
      const errorDocs = currentDocs.map(d => ({ ...d, status: 'error' as const }));
      updatePipelineIdea(idea.slateId, idea.id, { buildRoomDocs: errorDocs });
    } finally {
      setGenerating(false);
    }
  };

  const completedCount = docs.filter(d => d.status === 'complete').length;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
      {/* Header with image */}
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full h-40 md:w-[200px] md:h-auto shrink-0 overflow-hidden">
          <UnsplashImage genre={idea.genre} keyword={idea.title} orientation="landscape" logline={idea.logline} className="absolute inset-0 w-full h-full object-cover" alt={idea.title} />
        </div>
        <div className="flex-1 p-4 md:p-6">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary-foreground mb-2 ${getGenrePillColor(idea.genre)}`}>
            {idea.genre}
          </span>
          <h3 className="text-lg md:text-xl font-extrabold text-foreground">{idea.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{idea.format} · {idea.targetBroadcaster}</p>
          <p className="text-xs text-muted-foreground mt-2">{completedCount}/{DOC_TYPES.length} documents generated</p>

          {/* Mobile: collapsible toggle for document generation */}
          <button
            onClick={() => setDocsExpanded(!docsExpanded)}
            className="md:hidden flex items-center gap-2 mt-3 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold min-h-[48px] w-full justify-center transition-colors"
          >
            {docsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Generate Documents
          </button>
        </div>
      </div>

      {/* Document slots — always visible on desktop, collapsible on mobile */}
      <div className={`p-4 md:p-6 pt-0 space-y-2 md:space-y-3 ${docsExpanded ? 'block' : 'hidden md:block'}`}>
        {docs.map(doc => {
          const docMeta = DOC_TYPES.find(d => d.type === doc.documentType);
          const isGenerating = generatingDoc === doc.documentType || doc.status === 'generating';

          return (
            <div key={doc.documentType} className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
              <div className="flex items-center justify-between p-3 md:p-4 gap-2">
                <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-foreground text-xs md:text-sm block truncate">{docMeta?.label || doc.label}</span>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {doc.status === 'complete' ? 'Complete' : doc.status === 'error' ? 'Failed — retry' : isGenerating ? 'Generating…' : 'Not Generated'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                  {doc.status === 'complete' && (
                    <>
                      <button onClick={() => handleCopy(doc.content, doc.documentType)}
                        className="flex items-center gap-1 px-2.5 md:px-3 py-1.5 rounded-lg bg-muted text-[10px] md:text-xs font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[36px]">
                        {copiedDoc === doc.documentType ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                      <button onClick={() => setExpandedDoc(expandedDoc === doc.documentType ? null : doc.documentType)}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center">
                        {expandedDoc === doc.documentType ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </>
                  )}
                  {isGenerating && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {(doc.status === 'pending' || doc.status === 'error') && !isGenerating && (
                    <button onClick={() => generateDocument(doc.documentType)}
                      className="px-3 md:px-4 py-2 min-h-[44px] rounded-full bg-amber-500 text-primary-foreground text-xs font-bold hover:scale-105 transition-transform">
                      Generate
                    </button>
                  )}
                </div>
              </div>
              {expandedDoc === doc.documentType && doc.status === 'complete' && (
                <div className="border-t border-border p-4 md:p-6 bg-background">
                  {console.log('[BuildRoom] Expanded doc object:', JSON.stringify(doc, null, 2)) as any}
                  <div className="buildroom-prose prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-headings:font-bold prose-strong:text-foreground">
                    <ReactMarkdown>{doc.content || 'No content available'}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BuildRoomPage() {
  const { slates } = useDevSlate();

  const buildRoomIdeas = useMemo(() => {
    return SLATE_CONFIGS.flatMap(c =>
      slates[c.id].pipeline.filter(i => i.status === 'built' || i.status === 'complete' || i.status === 'building')
    );
  }, [slates]);

  if (buildRoomIdeas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 md:h-80 text-muted-foreground">
        <Hammer className="w-10 md:w-12 h-10 md:h-12 mb-4 opacity-40" />
        <p className="text-base md:text-lg font-semibold text-foreground">Build Room</p>
        <p className="text-xs md:text-sm mt-1 text-center px-4">Send researched ideas here to generate pitch documents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {buildRoomIdeas.map(idea => (
        <BuildRoomIdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
}
