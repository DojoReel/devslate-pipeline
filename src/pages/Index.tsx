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
import MarketRadarPage from '@/pages/MarketRadarPage';
import FundingCalendarPage from '@/pages/FundingCalendarPage';

function DevSlateApp() {
  const { activeSlate, slates, currentView } = useDevSlate();

  const viewTitles: Record<string, string> = {
    discover: 'Discover',
    pipeline: 'Pipeline',
    passed: 'Idea Bin',
    custom: 'Custom',
    buildroom: 'Build Room',
    'market-radar': 'Market Radar',
    'funding-calendar': 'Funding Calendar',
  };

  const hideSubtitle = currentView === 'custom' || currentView === 'market-radar' || currentView === 'funding-calendar';

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-2.5 px-4 py-3 bg-sidebar shrink-0">
          <Clapperboard className="w-5 h-5 text-sidebar-primary" />
          <h1 className="text-base font-bold text-sidebar-accent-foreground tracking-tight">DevSlate</h1>
        </header>

        {/* Mobile: Discover title + slate tabs */}
        {currentView === 'discover' && (
          <div className="md:hidden shrink-0 bg-sidebar">
            <div className="px-4 pt-1 pb-1.5">
              <h2 className="text-lg font-bold text-white tracking-tight">Discover</h2>
            </div>
            <SlateTabBar />
          </div>
        )}

        {/* Desktop view switcher */}
        <div className="hidden md:block border-b border-border bg-card">
          <ViewSwitcher />
        </div>

        {/* Content header — hidden on mobile for discover */}
        {!hideSubtitle && (
          <div className={`px-4 md:px-10 pt-4 md:pt-8 pb-2 shrink-0 ${currentView === 'discover' ? 'hidden md:block' : ''}`}>
            <h2 className="text-lg md:text-2xl font-bold text-foreground tracking-tight">{viewTitles[currentView]}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">
              {slates[activeSlate].config.label} · {slates[activeSlate].config.description}
            </p>
          </div>
        )}

        {/* Main content */}
        <main className={`flex-1 flex flex-col ${currentView === 'discover' ? 'px-0 md:px-8' : 'px-4 md:px-8'} pb-24 md:pb-6 w-full min-w-0 ${hideSubtitle ? 'pt-0 md:py-8' : 'py-0 md:py-6'}`}>
          {currentView === 'discover' && <DiscoverLibrary />}
          {currentView === 'pipeline' && <PipelineView />}
          {currentView === 'passed' && <PassedView />}
          {currentView === 'custom' && <CustomPage />}
          {currentView === 'buildroom' && <BuildRoomPage />}
          {currentView === 'market-radar' && <MarketRadarPage />}
          {currentView === 'funding-calendar' && <FundingCalendarPage />}
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
