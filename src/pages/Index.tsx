import { useDevSlate } from '@/context/DevSlateContext';
import { DiscoverLibrary } from '@/components/DiscoverLibrary';
import { PipelineView } from '@/components/PipelineView';
import { PassedView } from '@/components/PassedView';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileNav } from '@/components/MobileNav';
import { MobileSlateDrawer } from '@/components/MobileSlateDrawer';
import { ViewSwitcher } from '@/components/ViewSwitcher';
import { Clapperboard, ChevronRight } from 'lucide-react';
import CustomPage from '@/pages/CustomPage';
import BuildRoomPage from '@/pages/BuildRoomPage';
import MarketRadarPage from '@/pages/MarketRadarPage';
import FundingCalendarPage from '@/pages/FundingCalendarPage';
import ResearchAgentPage from '@/pages/ResearchAgentPage';
import ToolsPage from '@/pages/ToolsPage';
import { SLATE_CONFIGS } from '@/types/devslate';
import { useState } from 'react';

function DevSlateApp() {
  const { activeSlate, slates, currentView, isLoading } = useDevSlate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Clapperboard className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground font-medium">Loading your slates…</p>
        </div>
      </div>
    );
  }

  const viewTitles: Record<string, string> = {
    discover: 'Discover',
    pipeline: 'Pipeline',
    passed: 'Idea Bin',
    custom: 'Custom',
    buildroom: 'Build Room',
    'market-radar': 'Market Radar',
    'funding-calendar': 'Funding Calendar',
    'research-agent': 'Research Agent',
    tools: 'Tools',
  };

  const hideSubtitle = currentView === 'custom' || currentView === 'market-radar' || currentView === 'funding-calendar' || currentView === 'tools' || currentView === 'research-agent';

  // Active slate label for mobile header
  const activeSlateLabel = SLATE_CONFIGS.find(c => c.id === activeSlate)?.label || 'Slate';

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Mobile header — logo + slates button */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-sidebar shrink-0">
          <div className="flex items-center gap-2.5">
            <Clapperboard className="w-5 h-5 text-sidebar-primary" />
            <h1 className="text-base font-bold text-sidebar-accent-foreground tracking-tight">Pitchfire</h1>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-semibold text-sidebar-foreground/80 hover:text-sidebar-foreground bg-sidebar-accent/30 transition-colors"
          >
            {activeSlateLabel}
            <ChevronRight className="w-4 h-4" />
          </button>
        </header>

        {/* Mobile slate bottom sheet */}
        <MobileSlateDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

        {/* Desktop view switcher */}
        <div className="hidden md:block border-b border-border bg-card">
          <ViewSwitcher />
        </div>

        {/* Content header — hidden on mobile for discover */}
        {!hideSubtitle && (
          <div className={`px-4 md:px-10 pt-4 md:pt-8 pb-2 shrink-0 hidden md:block`}>
            <h2 className="text-lg md:text-2xl font-bold text-foreground tracking-tight">{viewTitles[currentView]}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">
              {slates[activeSlate].config.label} · {slates[activeSlate].config.description}
            </p>
          </div>
        )}

        {/* Main content — single scroll context on mobile */}
        <main className={`flex-1 flex flex-col ${currentView === 'discover' ? 'px-0 md:px-8' : 'px-0 md:px-8'} pb-24 md:pb-6 w-full min-w-0 ${hideSubtitle ? 'pt-0 md:py-8' : 'py-0 md:py-6'} overflow-hidden`}>
          {currentView === 'discover' && <DiscoverLibrary />}
          {currentView === 'pipeline' && <PipelineView />}
          {currentView === 'passed' && <PassedView />}
          {currentView === 'custom' && <CustomPage />}
          {currentView === 'buildroom' && <BuildRoomPage />}
          {currentView === 'market-radar' && <MarketRadarPage />}
          {currentView === 'funding-calendar' && <FundingCalendarPage />}
          {currentView === 'research-agent' && <ResearchAgentPage />}
          {currentView === 'tools' && <ToolsPage />}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

const Index = () => <DevSlateApp />;

export default Index;
