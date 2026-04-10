import { DevSlateProvider, useDevSlate } from '@/context/DevSlateContext';
import { SlateTabBar } from '@/components/SlateTabBar';
import { DiscoverLibrary } from '@/components/DiscoverLibrary';
import { PipelineView } from '@/components/PipelineView';
import { PassedView } from '@/components/PassedView';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileNav } from '@/components/MobileNav';
import { ViewSwitcher } from '@/components/ViewSwitcher';
import { Clapperboard } from 'lucide-react';
import CustomPage from '@/pages/CustomPage';
import BuildRoomPage from '@/pages/BuildRoomPage';

function DevSlateApp() {
  const { activeSlate, slates, currentView } = useDevSlate();

  const viewTitles: Record<string, string> = {
    discover: 'Discover',
    pipeline: 'Pipeline',
    passed: 'Passed',
    custom: 'Custom',
    buildroom: 'Build Room',
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-5 py-4 bg-sidebar">
          <div className="flex items-center gap-2.5">
            <Clapperboard className="w-5 h-5 text-sidebar-primary" />
            <h1 className="text-base font-bold text-sidebar-accent-foreground tracking-tight">DevSlate</h1>
          </div>
        </header>

        {/* Mobile slate tabs */}
        <div className="md:hidden">
          <SlateTabBar />
        </div>

        {/* Desktop view switcher */}
        <div className="hidden md:block border-b border-border bg-card">
          <ViewSwitcher />
        </div>

        {/* Content header */}
        <div className="px-6 md:px-10 pt-8 pb-2">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{viewTitles[currentView]}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {slates[activeSlate].config.label} · {slates[activeSlate].config.description}
          </p>
        </div>

        {/* Main content */}
        <main className="flex-1 px-4 md:px-10 py-6 pb-24 md:pb-6 max-w-5xl w-full">
          {currentView === 'discover' && <DiscoverLibrary />}
          {currentView === 'pipeline' && <PipelineView />}
          {currentView === 'passed' && <PassedView />}
          {currentView === 'custom' && <CustomPage />}
          {currentView === 'buildroom' && <BuildRoomPage />}
        </main>
      </div>

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
