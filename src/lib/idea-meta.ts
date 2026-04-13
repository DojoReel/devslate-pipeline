import { ShowIdea } from '@/types/devslate';

export const GENRE_PILL_COLORS: Record<string, string> = {
  'Documentary': 'bg-primary',
  'Political Documentary': 'bg-primary',
  'Natural History': 'bg-primary',
  'Factual Entertainment': 'bg-primary',
  'Human Interest': 'bg-primary',
  'Factual Drama': 'bg-primary',
  'True Crime': 'bg-primary',
  'Investigative Documentary': 'bg-primary',
  'Science Documentary': 'bg-primary',
  'Historical Documentary': 'bg-primary',
  'Health Documentary': 'bg-primary',
  'Social Documentary': 'bg-primary',
  'Observational Documentary': 'bg-primary',
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
  return idea.whyNow || 'This concept taps into current cultural conversations and audience demand for authentic, timely storytelling.';
}

export interface IdeaMeta {
  format: string;
  fundingPath: string;
  comparables: string;
  complexity: string;
}

export function getIdeaMeta(idea: ShowIdea): IdeaMeta {
  return {
    format: idea.genre || idea.format,
    fundingPath: 'Broadcaster License Fee + Screen Agency',
    comparables: idea.comparables || 'TBD — market research pending',
    complexity: 'Medium — standard production',
  };
}
