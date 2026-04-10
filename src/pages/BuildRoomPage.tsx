import { useDevSlate } from '@/context/DevSlateContext';
import { PipelineIdea, BuildRoomDocument, SLATE_CONFIGS } from '@/types/devslate';
import { Hammer, Loader2, FileText, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { UnsplashImage } from '@/components/UnsplashImage';
import { getGenrePillColor } from '@/lib/idea-meta';

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
  const [generatingDoc, setGeneratingDoc] = useState<string | null>(null);

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

  const generateDocument = async (docType: string) => {
    setGeneratingDoc(docType);

    const currentDocs = idea.buildRoomDocs || DOC_TYPES.map(d => ({
      documentType: d.type, label: d.label, content: '', status: 'pending' as const,
    }));

    const updatedDocs = currentDocs.map(d =>
      d.documentType === docType ? { ...d, status: 'generating' as const } : d
    );
    updatePipelineIdea(idea.slateId, idea.id, { buildRoomDocs: updatedDocs });

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/build-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          idea: { title: idea.title, logline: idea.logline, format: idea.format, targetBroadcaster: idea.targetBroadcaster, genre: idea.genre },
          report: idea.report,
          documentType: docType,
        }),
      });
      if (!response.ok) throw new Error(`Failed: ${docType}`);
      const result = await response.json();

      const finalDocs = (idea.buildRoomDocs || currentDocs).map(d =>
        d.documentType === docType ? { ...d, content: result.content, status: 'complete' as const } : d
      );
      updatePipelineIdea(idea.slateId, idea.id, { buildRoomDocs: finalDocs });
    } catch (err) {
      console.error(`Build room error for ${docType}:`, err);
      const errorDocs = (idea.buildRoomDocs || currentDocs).map(d =>
        d.documentType === docType ? { ...d, status: 'error' as const } : d
      );
      updatePipelineIdea(idea.slateId, idea.id, { buildRoomDocs: errorDocs });
    } finally {
      setGeneratingDoc(null);
    }
  };

  const completedCount = docs.filter(d => d.status === 'complete').length;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
      {/* Header with image */}
      <div className="flex">
        <div className="relative w-[200px] shrink-0 overflow-hidden">
          <UnsplashImage genre={idea.genre} keyword={idea.title} orientation="landscape" logline={idea.logline} className="absolute inset-0 w-full h-full object-cover" alt={idea.title} />
        </div>
        <div className="flex-1 p-6">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary-foreground mb-2 ${getGenrePillColor(idea.genre)}`}>
            {idea.genre}
          </span>
          <h3 className="text-xl font-extrabold text-foreground">{idea.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{idea.format} · {idea.targetBroadcaster}</p>
          <p className="text-xs text-muted-foreground mt-2">{completedCount}/{DOC_TYPES.length} documents generated</p>
        </div>
      </div>

      {/* Document slots */}
      <div className="p-6 pt-0 space-y-3">
        {docs.map(doc => {
          const docMeta = DOC_TYPES.find(d => d.type === doc.documentType);
          const isGenerating = generatingDoc === doc.documentType || doc.status === 'generating';

          return (
            <div key={doc.documentType} className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground text-sm">{docMeta?.label || doc.label}</span>
                    <p className="text-xs text-muted-foreground">
                      {doc.status === 'complete' ? 'Complete' : doc.status === 'error' ? 'Failed — retry' : isGenerating ? 'Generating…' : 'Not Generated'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === 'complete' && (
                    <>
                      <button onClick={() => handleCopy(doc.content, doc.documentType)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                        {copiedDoc === doc.documentType ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                      <button onClick={() => setExpandedDoc(expandedDoc === doc.documentType ? null : doc.documentType)}>
                        {expandedDoc === doc.documentType ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </>
                  )}
                  {isGenerating && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {(doc.status === 'pending' || doc.status === 'error') && !isGenerating && (
                    <button onClick={() => generateDocument(doc.documentType)}
                      className="px-4 py-2 rounded-full bg-amber-500 text-primary-foreground text-xs font-bold hover:scale-105 transition-transform">
                      Generate
                    </button>
                  )}
                </div>
              </div>
              {expandedDoc === doc.documentType && doc.status === 'complete' && (
                <div className="border-t border-border p-6 bg-background">
                  <div className="buildroom-prose prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-headings:font-bold prose-strong:text-foreground">
                    <ReactMarkdown>{doc.content}</ReactMarkdown>
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
      <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
        <Hammer className="w-12 h-12 mb-4 opacity-40" />
        <p className="text-lg font-semibold text-foreground">Build Room</p>
        <p className="text-sm mt-1">Send researched ideas here to generate pitch documents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {buildRoomIdeas.map(idea => (
        <BuildRoomIdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
}
