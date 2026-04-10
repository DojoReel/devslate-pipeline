export type SlateId = 'abc' | 'stan' | 'sport' | 'international' | 'custom';

export interface SlateConfig {
  id: SlateId;
  label: string;
  colorVar: string;
  description: string;
}

export interface ShowIdea {
  id: string;
  title: string;
  logline: string;
  format: string;
  targetBroadcaster: string;
  genre: string;
  slateId: SlateId;
}

export type Verdict = 'GREENLIGHT' | 'DEVELOP FURTHER' | 'PASS';

export interface DeepDiveReport {
  ideaId: string;
  competitiveLandscape: string;
  commissionerFit: string;
  audience: string;
  talentAccess: string;
  verdict: Verdict;
  verdictRationale: string;
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
  { id: 'abc', label: 'ABC / SBS', colorVar: '--slate-abc', description: 'Public broadcasters' },
  { id: 'stan', label: 'Stan / Streaming', colorVar: '--slate-stan', description: 'Streaming platforms' },
  { id: 'sport', label: 'Sport / Fox', colorVar: '--slate-sport', description: 'Sports & Fox networks' },
  { id: 'international', label: 'International', colorVar: '--slate-international', description: 'Global distribution' },
  { id: 'custom', label: 'Custom', colorVar: '--slate-custom', description: 'Your custom slate' },
];
