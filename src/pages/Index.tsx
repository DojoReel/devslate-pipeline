import { DevSlateProvider, useDevSlate } from '@/context/DevSlateContext';
import { SlateTabBar } from '@/components/SlateTabBar';
import { ViewSwitcher } from '@/components/ViewSwitcher';
import { SwipeDeck } from '@/components/SwipeDeck';
import { PipelineView } from '@/components/PipelineView';
import { PassedView } from '@/components/PassedView';
import { Clapperboard } from 'lucide-react';

function DevSlateApp() {
  const { activeSlate, slates, currentView } = useDevSlate();
  const slate = slates[activeSlate];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-0">
        <div className="flex items-center gap-3">
          <Clapperboard className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">DevSlate</h1>
            <p className="text-xs text-muted-foreground">Development Pipeline</p>
          </div>
        </div>
      </header>

      {/* Slate tabs */}
      <SlateTabBar />

      {/* View switcher */}
      <ViewSwitcher />

      {/* Main content */}
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {currentView === 'discover' && (
          <SwipeDeck ideas={slate.deck} slateId={activeSlate} />
        )}
        {currentView === 'pipeline' && <PipelineView />}
        {currentView === 'passed' && <PassedView />}
      </main>
    </div>
  );
}

const Index = () => (
  <DevSlateProvider>
    <DevSlateApp />
  </DevSlateProvider>
);

export default Index;
