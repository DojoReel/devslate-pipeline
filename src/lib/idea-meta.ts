import { ShowIdea } from '@/types/devslate';

export const GENRE_PILL_COLORS: Record<string, string> = {
  'Documentary': 'bg-primary',
  'Political Documentary': 'bg-primary',
  'Natural History': 'bg-primary',
  'Factual Entertainment': 'bg-primary',
  'Human Interest': 'bg-primary',
  'Factual Drama': 'bg-primary',
  'True Crime': 'bg-primary',
  'Sports Documentary': 'bg-slate_accent-sport',
  'Sports Reality': 'bg-slate_accent-sport',
  'Adventure Sports': 'bg-slate_accent-sport',
  'Travel Food': 'bg-slate_accent-international',
  'Geopolitical Documentary': 'bg-slate_accent-international',
  'Current Affairs': 'bg-slate_accent-international',
  'Business Reality': 'bg-slate_accent-stan',
  'Competition Reality': 'bg-slate_accent-stan',
  'Behind the Scenes': 'bg-muted-foreground',
  'Custom': 'bg-muted-foreground',
};

export function getGenrePillColor(genre: string) {
  return GENRE_PILL_COLORS[genre] || 'bg-primary';
}

export function extractWhyNow(idea: ShowIdea): string {
  const whyNowMap: Record<string, string> = {
    'Outback Medics': 'Rural healthcare access is a growing national debate as climate events increase demand for remote medical services.',
    'First Languages': 'UNESCO has declared this the Decade of Indigenous Languages — time is running out for documentation.',
    'The Ballot': 'With record low trust in politicians, first-time voters are reshaping electoral engagement.',
    'Reef Patrol': 'Back-to-back mass bleaching events make reef conservation the defining environmental story of our era.',
    'New Roots': 'Australia\'s refugee intake is at its highest in a decade, transforming regional communities.',
    'Cold Cases Reloaded': 'Advances in forensic DNA and AI are solving cases that were impossible just five years ago.',
    'Hustle Sydney': 'The startup ecosystem is booming post-pandemic with record venture capital flowing into Australian founders.',
    'Underground Kings': 'Global opal prices have surged, drawing a new generation of miners to Coober Pedy.',
    'The Algorithm': 'Social media regulation is the hottest policy debate globally — audiences want to understand platform manipulation.',
    'Fight Camp': 'Boxing is experiencing a mainstream revival with crossover events drawing massive audiences.',
    'Grassroots': 'Community sport participation is rebounding post-COVID, but clubs face existential funding challenges.',
    'The Draft': 'The AFL draft has become a cultural event, with millions following prospect journeys on social media.',
    'Wave Hunters': 'Big wave surfing is gaining Olympic momentum and Southern Ocean conditions are producing record swells.',
    'Pacific Rising': 'COP climate conferences have put Pacific Island nations at the centre of global climate justice debates.',
    'Silk Road Kitchens': 'Central Asian cuisine is the next global food trend, driven by social media discovery.',
    'Border Towns': 'Geopolitical tensions are at their highest in decades — border communities are the human face of these conflicts.',
    'Pitch Lab': 'AI-assisted content development is transforming how producers create and pitch television concepts.',
  };
  return whyNowMap[idea.title] || 'This concept taps into current cultural conversations and audience demand for authentic, timely storytelling.';
}

export interface IdeaMeta {
  format: string;
  fundingPath: string;
  comparables: string;
  complexity: string;
}

export function getIdeaMeta(idea: ShowIdea): IdeaMeta {
  const metaMap: Record<string, IdeaMeta> = {
    'Outback Medics': { format: 'Observational Documentary', fundingPath: 'Screen Australia + ABC Commissioning', comparables: 'Ambulance (BBC), Australian Story (ABC)', complexity: 'High — remote location logistics' },
    'First Languages': { format: 'Authored Documentary', fundingPath: 'NITV + Screen Australia Indigenous Dept', comparables: 'First Australians (SBS), Language Matters (PBS)', complexity: 'Medium — community partnerships required' },
    'The Ballot': { format: 'Vérité Event Series', fundingPath: 'ABC + Documentary Australia Foundation', comparables: 'The Vote (Channel 4), Vote (Al Jazeera)', complexity: 'Medium — election cycle timing' },
    'Reef Patrol': { format: 'Natural History Hybrid', fundingPath: 'Screen Qld + ABC + Int\'l Pre-sales', comparables: 'Blue Planet (BBC), Reef Live (ABC)', complexity: 'High — underwater & aerial filming' },
    'New Roots': { format: 'Character-led Documentary', fundingPath: 'SBS Commissioning + Screen Australia', comparables: 'Go Back to Where You Came From (SBS)', complexity: 'Medium — sensitive access required' },
    'Cold Cases Reloaded': { format: 'True Crime Investigation', fundingPath: 'Stan Original + Screen NSW', comparables: 'The Night Caller (Stan), Underbelly', complexity: 'Medium — archival & legal clearance' },
    'Hustle Sydney': { format: 'Business Reality Series', fundingPath: 'Stan + Brand Partnerships', comparables: 'Shark Tank (Ten), Planet Startup', complexity: 'Low — studio + location hybrid' },
    'Underground Kings': { format: 'Factual Drama Hybrid', fundingPath: 'Stan + Screen SA + Int\'l', comparables: 'Outback Opal Hunters (Discovery)', complexity: 'High — underground filming' },
    'The Algorithm': { format: 'Competition Reality', fundingPath: 'Stan + Digital Platform Partnerships', comparables: 'The Circle (Netflix), Screentime (ABC)', complexity: 'Medium — tech integration' },
    'Fight Camp': { format: 'Sports Observational', fundingPath: 'Fox Sports + Screen NSW', comparables: 'Fighter (Stan), Last Chance U (Netflix)', complexity: 'Medium — gym & event access' },
    'Grassroots': { format: 'Sports Reality Series', fundingPath: 'Fox Sports Commissioning', comparables: 'Sunderland \'Til I Die (Netflix)', complexity: 'Low — season-long embed' },
    'The Draft': { format: 'Sports Documentary', fundingPath: 'Fox Footy + AFL Media Rights', comparables: 'Draft Day (film), Hard Knocks (HBO)', complexity: 'Medium — AFL access agreements' },
    'Wave Hunters': { format: 'Adventure Sports Doc', fundingPath: 'Fox Sports + Red Bull Media', comparables: '100 Foot Wave (HBO), Storm Surfers', complexity: 'High — ocean safety & drone crews' },
    'Pacific Rising': { format: 'Geopolitical Event Series', fundingPath: 'BBC Co-pro + Netflix + Screen Pacific', comparables: 'Chasing Coral (Netflix), Islands of Faith', complexity: 'High — multi-country shoots' },
    'Silk Road Kitchens': { format: 'Travel Food Series', fundingPath: 'Netflix + SBS Food + Tourism boards', comparables: 'Street Food (Netflix), Somebody Feed Phil', complexity: 'Medium — international travel' },
    'Border Towns': { format: 'Geopolitical Documentary', fundingPath: 'HBO Co-pro + BBC Storyville', comparables: 'Frontline (PBS), No Man\'s Land', complexity: 'High — conflict zone access' },
  };
  return metaMap[idea.title] || {
    format: idea.genre,
    fundingPath: 'Broadcaster License Fee + Screen Agency',
    comparables: 'TBD — market research pending',
    complexity: 'Medium — standard production',
  };
}
