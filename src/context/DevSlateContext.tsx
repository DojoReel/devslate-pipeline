// DevSlate context — loads all data from Supabase on mount
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { SlateId, SlateState, ShowIdea, PipelineIdea, SLATE_CONFIGS } from '@/types/devslate';
import {
  loadAllData,
  insertDecision,
  insertPipeline,
  updatePipelineStatus,
  deletePipelineRow,
} from '@/lib/supabase-helpers';

interface DevSlateContextType {
  activeSlate: SlateId;
  setActiveSlate: (id: SlateId) => void;
  slates: Record<SlateId, SlateState>;
  archivedIdeas: PipelineIdea[];
  swipeRight: (slateId: SlateId, idea: ShowIdea) => void;
  swipeLeft: (slateId: SlateId, idea: ShowIdea) => void;
  updatePipelineIdea: (slateId: SlateId, ideaId: string, updates: Partial<PipelineIdea>) => void;
  restoreToPipeline: (slateId: SlateId, ideaId: string) => void;
  resetSlate: (slateId: SlateId) => void;
  addCustomIdea: (idea: ShowIdea) => void;
  sendToBuildRoom: (slateId: SlateId, ideaId: string) => void;
  archiveIdea: (slateId: SlateId, ideaId: string) => void;
  unarchiveIdea: (ideaId: string) => void;
  currentView: 'discover' | 'pipeline' | 'passed' | 'custom' | 'buildroom' | 'market-radar' | 'funding-calendar' | 'tools' | 'research-agent';
  setCurrentView: (view: 'discover' | 'pipeline' | 'passed' | 'custom' | 'buildroom' | 'market-radar' | 'funding-calendar' | 'tools' | 'research-agent') => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const DevSlateContext = createContext<DevSlateContextType | null>(null);

function emptySlates(): Record<SlateId, SlateState> {
  const slates = {} as Record<SlateId, SlateState>;
  for (const config of SLATE_CONFIGS) {
    slates[config.id] = { config, deck: [], pipeline: [], passed: [] };
  }
  return slates;
}

export function DevSlateProvider({ children }: { children: ReactNode }) {
  const [activeSlate, setActiveSlate] = useState<SlateId>('crime');
  const [slates, setSlates] = useState<Record<SlateId, SlateState>>(emptySlates);
  const [archivedIdeas, setArchivedIdeas] = useState<PipelineIdea[]>([]);
  const [currentView, setCurrentView] = useState<'discover' | 'pipeline' | 'passed' | 'custom' | 'buildroom' | 'market-radar' | 'funding-calendar' | 'tools' | 'research-agent'>('discover');
  const [isLoading, setIsLoading] = useState(true);

  // Load everything from Supabase on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await loadAllData();

        // Build sets for quick lookup
        const decisionMap = new Set<string>();
        const leftSwipedSet = new Set<string>();
        for (const d of data.decisions) {
          decisionMap.add(d.idea_id);
          if (d.decision === 'swiped_left') leftSwipedSet.add(d.idea_id);
        }

        // Group ideas by slate
        const ideasBySlate: Record<string, ShowIdea[]> = {};
        for (const idea of data.ideas) {
          if (!ideasBySlate[idea.slateId]) ideasBySlate[idea.slateId] = [];
          ideasBySlate[idea.slateId].push(idea);
        }

        // Build pipeline ideas from user_pipeline rows
        const pipelineBySlate: Record<string, PipelineIdea[]> = {};
        const archivedList: PipelineIdea[] = [];
        const ideaLookup = new Map(data.ideas.map(i => [i.id, i]));

        for (const row of data.pipelineRows) {
          const idea = ideaLookup.get(row.idea_id);
          if (!idea) continue;
          const report = data.reports.get(row.idea_id);
          const docs = data.buildDocs.get(row.idea_id);
          const pipelineIdea: PipelineIdea = {
            ...idea,
            status: row.status as PipelineIdea['status'],
            notes: row.notes,
            report,
            buildRoomDocs: docs,
          };

          if (row.status === 'archived') {
            archivedList.push(pipelineIdea);
          } else {
            const sid = row.slate_id || idea.slateId;
            if (!pipelineBySlate[sid]) pipelineBySlate[sid] = [];
            pipelineBySlate[sid].push(pipelineIdea);
          }
        }

        // Build passed ideas (swiped left but not in pipeline)
        const passedBySlate: Record<string, ShowIdea[]> = {};
        for (const ideaId of leftSwipedSet) {
          const idea = ideaLookup.get(ideaId);
          if (!idea) continue;
          if (!passedBySlate[idea.slateId]) passedBySlate[idea.slateId] = [];
          passedBySlate[idea.slateId].push(idea);
        }

        // Build slate state
        const newSlates = emptySlates();
        for (const config of SLATE_CONFIGS) {
          const allIdeas = ideasBySlate[config.id] || [];
          // Deck = ideas not yet swiped (no decision recorded)
          const deck = allIdeas.filter(i => !decisionMap.has(i.id));
          newSlates[config.id] = {
            config,
            deck,
            pipeline: pipelineBySlate[config.id] || [],
            passed: passedBySlate[config.id] || [],
          };
        }

        setSlates(newSlates);
        setArchivedIdeas(archivedList);
      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const swipeRight = useCallback((slateId: SlateId, idea: ShowIdea) => {
    // Persist to Supabase
    insertDecision(idea.id, 'swiped_right');
    insertPipeline(idea.id, slateId, 'swiped');

    setSlates(prev => {
      const slate = prev[slateId];
      const pipelineIdea: PipelineIdea = { ...idea, status: 'swiped', notes: [] };
      return {
        ...prev,
        [slateId]: {
          ...slate,
          deck: slate.deck.filter(i => i.id !== idea.id),
          pipeline: [...slate.pipeline, pipelineIdea],
        },
      };
    });
  }, []);

  const swipeLeft = useCallback((slateId: SlateId, idea: ShowIdea) => {
    // Persist to Supabase
    insertDecision(idea.id, 'swiped_left');

    setSlates(prev => {
      const slate = prev[slateId];
      return {
        ...prev,
        [slateId]: {
          ...slate,
          deck: slate.deck.filter(i => i.id !== idea.id),
          passed: [...slate.passed, idea],
        },
      };
    });
  }, []);

  const updatePipelineIdea = useCallback((slateId: SlateId, ideaId: string, updates: Partial<PipelineIdea>) => {
    // If status changed, persist to Supabase
    if (updates.status) {
      updatePipelineStatus(ideaId, updates.status);
    }

    setSlates(prev => {
      const slate = prev[slateId];
      return {
        ...prev,
        [slateId]: {
          ...slate,
          pipeline: slate.pipeline.map(i => i.id === ideaId ? { ...i, ...updates } : i),
        },
      };
    });
  }, []);

  const restoreToPipeline = useCallback((slateId: SlateId, ideaId: string) => {
    // Re-insert into pipeline in Supabase
    insertPipeline(ideaId, slateId, 'swiped');
    // Remove the left-swipe decision by inserting a new "restored" decision
    insertDecision(ideaId, 'swiped_right');

    setSlates(prev => {
      const slate = prev[slateId];
      const idea = slate.passed.find(i => i.id === ideaId);
      if (!idea) return prev;
      const pipelineIdea: PipelineIdea = { ...idea, status: 'swiped', notes: [] };
      return {
        ...prev,
        [slateId]: {
          ...slate,
          passed: slate.passed.filter(i => i.id !== ideaId),
          pipeline: [...slate.pipeline, pipelineIdea],
        },
      };
    });
  }, []);

  const resetSlate = useCallback((slateId: SlateId) => {
    // Note: resetSlate is local-only for now since it's a destructive operation
    // To fully support it we'd need to delete decisions/pipeline rows for that slate
    setSlates(prev => {
      const config = SLATE_CONFIGS.find(c => c.id === slateId)!;
      // We can't easily reset without re-fetching from DB, so just clear pipeline/passed
      return {
        ...prev,
        [slateId]: {
          config,
          deck: [], // Would need to re-fetch ideas
          pipeline: [],
          passed: [],
        },
      };
    });
  }, []);

  const addCustomIdea = useCallback((idea: ShowIdea) => {
    // Custom ideas go directly to pipeline
    insertDecision(idea.id, 'swiped_right');
    insertPipeline(idea.id, 'custom', 'swiped');

    const pipelineIdea: PipelineIdea = { ...idea, status: 'swiped', notes: [] };
    setSlates(prev => ({
      ...prev,
      custom: {
        ...prev.custom,
        pipeline: [...prev.custom.pipeline, pipelineIdea],
      },
    }));
  }, []);

  const sendToBuildRoom = useCallback((slateId: SlateId, ideaId: string) => {
    // Persist to Supabase
    updatePipelineStatus(ideaId, 'built');
    insertDecision(ideaId, 'sent_to_build_room');

    setSlates(prev => {
      const slate = prev[slateId];
      return {
        ...prev,
        [slateId]: {
          ...slate,
          pipeline: slate.pipeline.map(i =>
            i.id === ideaId ? { ...i, status: 'built' as PipelineIdea['status'] } : i
          ),
        },
      };
    });
  }, []);

  const archiveIdea = useCallback((slateId: SlateId, ideaId: string) => {
    // Persist to Supabase
    updatePipelineStatus(ideaId, 'archived');
    insertDecision(ideaId, 'archived');

    setSlates(prev => {
      const slate = prev[slateId];
      const idea = slate.pipeline.find(i => i.id === ideaId);
      if (!idea) return prev;
      setArchivedIdeas(archived => [...archived, idea]);
      return {
        ...prev,
        [slateId]: {
          ...slate,
          pipeline: slate.pipeline.filter(i => i.id !== ideaId),
        },
      };
    });
  }, []);

  const unarchiveIdea = useCallback((ideaId: string) => {
    setArchivedIdeas(prev => {
      const idea = prev.find(i => i.id === ideaId);
      if (!idea) return prev;

      // Persist to Supabase
      updatePipelineStatus(ideaId, 'swiped');
      insertDecision(ideaId, 'swiped_right');

      setSlates(s => {
        const slate = s[idea.slateId];
        return {
          ...s,
          [idea.slateId]: {
            ...slate,
            pipeline: [...slate.pipeline, { ...idea, status: 'swiped' as const }],
          },
        };
      });
      return prev.filter(i => i.id !== ideaId);
    });
  }, []);

  return (
    <DevSlateContext.Provider value={{
      activeSlate, setActiveSlate,
      slates, archivedIdeas,
      swipeRight, swipeLeft,
      updatePipelineIdea, restoreToPipeline, resetSlate,
      addCustomIdea, sendToBuildRoom,
      archiveIdea, unarchiveIdea,
      currentView, setCurrentView,
      isLoading,
    }}>
      {children}
    </DevSlateContext.Provider>
  );
}

export function useDevSlate() {
  const ctx = useContext(DevSlateContext);
  if (!ctx) throw new Error('useDevSlate must be used within DevSlateProvider');
  return ctx;
}
