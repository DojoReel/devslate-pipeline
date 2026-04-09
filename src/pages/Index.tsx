import { DevSlateProvider, useDevSlate } from '@/context/DevSlateContext';
import { SlateTabBar } from '@/components/SlateTabBar';
import { SwipeDeck } from '@/components/SwipeDeck';
import { PipelineView } from '@/components/PipelineView';
import { PassedView } from '@/components/PassedView';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileNav } from '@/components/MobileNav';
import { Clapperboard } from 'lucide-react';

function DevSlateApp() {
  const { activeSlate, slates, currentView } = useDevSlate();
  const slate = slates[activeSlate];

  const viewTitles = { discover: 'Discover', pipeline: 'Pipeline', passed: 'Passed' };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <AppSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-5 py-4 bg-nav-bg">
          <div className="flex items-center gap-2.5">
            <Clapperboard className="w-5 h-5 text-sidebar-primary" />
            <h1 className="text-base font-bold text-sidebar-accent-foreground tracking-tight">DevSlate</h1>
          </div>
        </header>

        {/* Mobile slate tabs */}
        <div className="md:hidden">
          <SlateTabBar />
        </div>

        {/* Content header */}
        <div className="px-6 md:px-10 pt-8 pb-2">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{viewTitles[currentView]}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {slates[activeSlate].config.label} · {slates[activeSlate].config.description}
          </p>
        </div>

        {/* Main content */}
        <main className="flex-1 px-4 md:px-10 py-6 pb-24 md:pb-6 max-w-3xl w-full">
          {currentView === 'discover' && (
            <SwipeDeck ideas={slate.deck} slateId={activeSlate} />
          )}
          {currentView === 'pipeline' && <PipelineView />}
          {currentView === 'passed' && <PassedView />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}

const Index = () => (
  <DevSlateProvider>
    <DevSlateApp />
  </DevSlateProvider>
);

export default Index;
