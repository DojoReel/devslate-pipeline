/** Build a URL-safe slug from a title */
function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Picsum fallback URL */
export function getPicsumUrl(title: string, width = 800, height = 500): string {
  return `https://picsum.photos/seed/${toSlug(title)}/${width}/${height}`;
}

/** Build a Pexels search query from title + genre */
const KEYWORD_OVERRIDES: Record<string, string> = {
  'Outback Medics': 'outback australia remote medical helicopter',
  'First Languages': 'aboriginal indigenous australia language',
  'The Ballot': 'australia election voting parliament',
  'Reef Patrol': 'great barrier reef coral underwater',
  'New Roots': 'refugee australia community multicultural',
  'Cold Cases Reloaded': 'forensic detective crime investigation',
  'Hustle Sydney': 'sydney entrepreneur business startup',
  'Underground Kings': 'opal mining outback underground',
  'The Algorithm': 'social media technology digital screen',
  'Fight Camp': 'boxing training athlete ring',
  'Grassroots': 'community sport australia local football',
  'The Draft': 'australian football draft young athlete',
  'Wave Hunters': 'surfing big wave ocean australia',
  'Pacific Rising': 'pacific island ocean climate',
  'Silk Road Kitchens': 'central asian cuisine food market',
  'Border Towns': 'border town community frontier',
  'Pitch Lab': 'television production studio creative',
};

export function buildPexelsQuery(title: string, genre: string): string {
  if (KEYWORD_OVERRIDES[title]) return KEYWORD_OVERRIDES[title];
  const titleWords = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  const genreWords = genre.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  return [...titleWords, ...genreWords].slice(0, 5).join(' ');
}

/** Gradient fallback per genre family */
const GENRE_GRADIENTS: Record<string, string> = {
  documentary: 'linear-gradient(135deg, hsl(40 96% 53%), hsl(30 80% 40%))',
  sport: 'linear-gradient(135deg, hsl(217 91% 60%), hsl(217 70% 35%))',
  international: 'linear-gradient(135deg, hsl(173 80% 40%), hsl(173 60% 28%))',
  streaming: 'linear-gradient(135deg, hsl(263 70% 58%), hsl(263 50% 35%))',
  default: 'linear-gradient(135deg, hsl(220 14% 40%), hsl(220 14% 25%))',
};

export function getGenreGradient(genre: string): string {
  const g = genre.toLowerCase();
  if (g.includes('sport') || g.includes('adventure')) return GENRE_GRADIENTS.sport;
  if (g.includes('international') || g.includes('travel') || g.includes('geopolitical') || g.includes('current')) return GENRE_GRADIENTS.international;
  if (g.includes('crime') || g.includes('business') || g.includes('competition') || g.includes('behind')) return GENRE_GRADIENTS.streaming;
  if (g.includes('documentary') || g.includes('factual') || g.includes('natural') || g.includes('human') || g.includes('political')) return GENRE_GRADIENTS.documentary;
  return GENRE_GRADIENTS.default;
}
