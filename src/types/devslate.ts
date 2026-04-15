export type SlateId = 'crime' | 'environment' | 'sport' | 'culture' | 'character' | 'political' | 'history' | 'science' | 'social' | 'firstnations' | 'cooking' | 'travel' | 'custom';

export interface SlateConfig {
  id: SlateId;
  label: string;
  colorVar: string;
  description: string;
}

export interface ShowIdea {
  id: string;
  title: string;
  hook: string;
  logline: string;
  format: string;
  targetBroadcaster: string;
  genre: string;
  location: string;
  slateId: SlateId;
  whyNow: string;
  peopleAccess: string;
  archiveStatus: string;
  rightsStatus: string;
  comparables: string;
  commissionCheck: string;
  sources: string;
}

export type Verdict = 'GREENLIGHT' | 'DEVELOP FURTHER' | 'PASS';

export interface DeepDiveReport {
  ideaId: string;
  verdict: Verdict;
  verdictReason: string;
  storyVerified: boolean;
  verifiedDetail: string;
  fullStory: string;
  people: string;
  archive: string;
  rightsDetail: string;
  commissionCheck: string;
  broadcasterFit: string;
  formatRecommendation: string;
  whyNow: string;
  redFlags: string;
  sources: string;
  generatedAt: string;
}

export interface BuildRoomDocument {
  documentType: string;
  label: string;
  content: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
}

export interface PipelineIdea extends ShowIdea {
  status: 'swiped' | 'researching' | 'researched' | 'building' | 'built' | 'complete';
  report?: DeepDiveReport;
  buildRoomDocs?: BuildRoomDocument[];
  notes: string[];
}

export interface SlateState {
  config: SlateConfig;
  deck: ShowIdea[];
  pipeline: PipelineIdea[];
  passed: ShowIdea[];
}

export const SLATE_CONFIGS: SlateConfig[] = [
  { id: 'crime', label: 'Crime & Justice', colorVar: '--slate-crime', description: 'True crime, courts, justice system' },
  { id: 'environment', label: 'Environment', colorVar: '--slate-environment', description: 'Nature, climate, conservation' },
  { id: 'sport', label: 'Sport', colorVar: '--slate-sport', description: 'Sport stories and athletes' },
  { id: 'culture', label: 'Culture & Identity', colorVar: '--slate-culture', description: 'Arts, society, identity' },
  { id: 'character', label: 'Character & Community', colorVar: '--slate-character', description: 'People, place, community' },
  { id: 'political', label: 'Political & Power', colorVar: '--slate-political', description: 'Power, institutions, politics' },
  { id: 'history', label: 'History & Archive', colorVar: '--slate-history', description: 'Archive, retrospective, untold history' },
  { id: 'science', label: 'Science & Technology', colorVar: '--slate-science', description: 'Discovery, innovation, research' },
  { id: 'social', label: 'Social Issues', colorVar: '--slate-social', description: 'Inequality, health, housing, justice' },
  { id: 'firstnations', label: 'First Nations', colorVar: '--slate-firstnations', description: 'Indigenous stories and perspectives' },
  { id: 'cooking', label: 'Cooking & Food', colorVar: '--slate-cooking', description: 'Food, chefs, produce, culinary journeys' },
  { id: 'travel', label: 'Travel & Adventure', colorVar: '--slate-travel', description: 'Places, journeys, adventure, exploration' },
  { id: 'custom', label: 'Custom', colorVar: '--slate-custom', description: 'Your directed research brief' },
];
