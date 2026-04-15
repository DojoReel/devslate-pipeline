import { useDevSlate } from '@/context/DevSlateContext';
import { PipelineIdea, BuildRoomDocument, SLATE_CONFIGS } from '@/types/devslate';
import { Hammer, Loader2, FileText, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { UnsplashImage } from '@/components/UnsplashImage';
import { getGenrePillColor } from '@/lib/idea-meta';
import { runBuildRoomDocument } from '@/lib/api';
import { upsertBuildDoc } from '@/lib/supabase-helpers';

const DOC_TYPES = [
  { type: 'one_pager', label: 'One Pager' },
  { type: 'series_bible', label: 'Series Bible' },
  { type: 'director_treatment', label: 'Director Treatment' },
  { type: 'budget_overview', label: 'Budget Overview' },
  { type: 'funding_strategy', label: 'Funding Strategy' },
  { type: 'pitch_email', label: 'Commissioner Pitch Email' },
];

function BuildRoomIdeaCard({ idea }: { idea: PipelineIdea }) {
  const { updatePipelineIdea } = useDevSlate();
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [copiedDoc, setCopiedDoc] = useState<string | null>(null);
  const [generatingDoc, setGeneratingDoc] = useState<string | null>(null);
  const [docsExpanded, setDocsExpanded] = useState(false);

  const docs = DOC_TYPES.map(d => {
    const existing = (idea.buildRoomDocs || []).find(bd => bd.documentType === d.type);
    return existing || {
      documentType: d.type,
      label: d.label,
      content: '',
      status: 'pending' as const,
    };
  });

  const handleCopy = async (content: string, docType: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedDoc(docType);
    setTimeout(() => setCopiedDoc(null), 2000);
  };

  const generateDocument = async (docType: string) => {
    if (generatingDoc) return;
    setGeneratingDoc(docType);

    const currentDocs = idea.buildRoomDocs || DOC_TYPES.map(d => ({
      documentType: d.type, label: d.label, content: '', status: 'pending' as const,
    }));

    const updatedDocs = currentDocs.map(d =>
      d.documentType === docType ? { ...d, status: 'generating' as const } : d
    );
    updatePipelineIdea(idea.slateId, idea.id, { buildRoomDocs: updatedDocs });

    try {
      const result: any = await runBuildRoomDocument(idea, idea.report, docType);
      console.log('[BuildRoom] API result:', result);

      // API returns { success: true, documents: [...] } — find the matching doc
      let content = '';
      if (result.documents && Array.isArray(result.documents)) {
        const match = result.documents.find((d: any) => d.documentType === docType);
        content = match?.content || result.documents[0]?.content || '';
      } else {
        content = result.content || '';
      }

      const finalDocs = updatedDocs.map(d =>
        d.documentType === docType ? { ...d, content, status: 'complete' as const } : d
      );
      updatePipelineIdea(idea.slateId, idea.id, { buildRoomDocs: finalDocs });
      // Persist completed doc to Supabase
      const completedDoc = finalDocs.find(d => d.documentType === docType);
      if (completedDoc) upsertBuildDoc(idea.id, completedDoc);
    } catch (err) {
      console.error(`Build room error for ${docType}:`, err);
      const errorDocs = updatedDocs.map(d =>
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

          {/* Mobile: collapsible toggle */}
          <button
            onClick={() => setDocsExpanded(!docsExpanded)}
            className="md:hidden flex items-center gap-2 mt-3 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold min-h-[48px] w-full justify-center transition-colors"
          >
            {docsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Documents
          </button>
        </div>
      </div>

      {/* Document slots */}
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
                    idea.report ? (
                      <button
                        onClick={() => generateDocument(doc.documentType)}
                        disabled={!!generatingDoc}
                        className="px-3 md:px-4 py-2 min-h-[44px] rounded-full bg-amber-500 text-primary-foreground text-xs font-bold hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Generate
                      </button>
                    ) : (
                      <span className="text-[10px] md:text-xs text-amber-500 font-medium">Run Deep Dive first</span>
                    )
                  )}
                </div>
              </div>
              {expandedDoc === doc.documentType && doc.status === 'complete' && (
                <div className="border-t border-border p-4 md:p-6 bg-background">
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

