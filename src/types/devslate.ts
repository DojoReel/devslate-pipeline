export type SlateId = 'crime' | 'food' | 'sport' | 'travel' | 'character' | 'culture' | 'business' | 'society' | 'custom';

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
  { id: 'crime', label: 'Crime & Justice', colorVar: '--slate-crime', description: 'Obscure crimes, fraud, scams, legal battles, subcultural crime worlds' },
  { id: 'food', label: 'Food & Lifestyle', colorVar: '--slate-food', description: 'Chefs, producers, food culture, lifestyle formats built around food' },
  { id: 'sport', label: 'Sport & Competition', colorVar: '--slate-sport', description: 'Athletes, rivalries, niche sports, competition in any form' },
  { id: 'travel', label: 'Travel & Adventure', colorVar: '--slate-travel', description: 'Journeys with purpose, remote locations, character-led exploration' },
  { id: 'character', label: 'Character', colorVar: '--slate-character', description: 'Singular compelling individuals, obsession stories, unusual lives' },
  { id: 'culture', label: 'Culture & Subcultures', colorVar: '--slate-culture', description: 'Underground communities, creative scenes, unique social worlds' },
  { id: 'business', label: 'Business, Tech & Power', colorVar: '--slate-business', description: 'Startups, entrepreneurs, AI, political power, decision-makers' },
  { id: 'society', label: 'Environment & Society', colorVar: '--slate-society', description: 'People vs systems, environmental conflict, communities under pressure' },
  { id: 'custom', label: 'Custom', colorVar: '--slate-custom', description: 'Your directed research brief' },
];
