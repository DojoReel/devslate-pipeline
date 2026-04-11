import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SlateId, SlateState, ShowIdea, PipelineIdea, SLATE_CONFIGS } from '@/types/devslate';
import { PLACEHOLDER_IDEAS } from '@/data/placeholder-ideas';

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
  currentView: 'discover' | 'pipeline' | 'passed' | 'custom' | 'buildroom' | 'market-radar' | 'funding-calendar' | 'tools';
  setCurrentView: (view: 'discover' | 'pipeline' | 'passed' | 'custom' | 'buildroom' | 'market-radar' | 'funding-calendar' | 'tools') => void;
}

const DevSlateContext = createContext<DevSlateContextType | null>(null);

function initSlates(): Record<SlateId, SlateState> {
  const slates = {} as Record<SlateId, SlateState>;
  for (const config of SLATE_CONFIGS) {
    slates[config.id] = {
      config,
      deck: [...(PLACEHOLDER_IDEAS[config.id] || [])],
      pipeline: [],
      passed: [],
    };
  }
  return slates;
}

export function DevSlateProvider({ children }: { children: ReactNode }) {
  const [activeSlate, setActiveSlate] = useState<SlateId>('abc');
  const [slates, setSlates] = useState<Record<SlateId, SlateState>>(initSlates);
  const [archivedIdeas, setArchivedIdeas] = useState<PipelineIdea[]>([]);
  const [currentView, setCurrentView] = useState<'discover' | 'pipeline' | 'passed' | 'custom' | 'buildroom' | 'market-radar' | 'funding-calendar' | 'tools'>('discover');

  const swipeRight = useCallback((slateId: SlateId, idea: ShowIdea) => {
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
    setSlates(prev => {
      const config = SLATE_CONFIGS.find(c => c.id === slateId)!;
      return {
        ...prev,
        [slateId]: {
          config,
          deck: [...(PLACEHOLDER_IDEAS[slateId] || [])],
          pipeline: [],
          passed: [],
        },
      };
    });
  }, []);

  // Custom ideas go directly to pipeline, not deck
  const addCustomIdea = useCallback((idea: ShowIdea) => {
    const pipelineIdea: PipelineIdea = { ...idea, status: 'swiped', notes: [] };
    setSlates(prev => ({
      ...prev,
      custom: {
        ...prev.custom,
        pipeline: [...prev.custom.pipeline, pipelineIdea],
      },
    }));
  }, []);

  // Mark idea as sent to build room (status 'built') without generating docs
  const sendToBuildRoom = useCallback((slateId: SlateId, ideaId: string) => {
    setSlates(prev => {
      const slate = prev[slateId];
      return {
        ...prev,
        [slateId]: {
          ...slate,
          pipeline: slate.pipeline.map(i =>
            i.id === ideaId
              ? { ...i, status: 'built' as PipelineIdea['status'] }
              : i
          ),
        },
      };
    });
  }, []);

  const archiveIdea = useCallback((slateId: SlateId, ideaId: string) => {
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
      setSlates(s => {
        const slate = s[idea.slateId];
        return {
          ...s,
          [idea.slateId]: {
            ...slate,
            pipeline: [...slate.pipeline, idea],
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
