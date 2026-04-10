/** Build a simple comma-separated keyword query from title + genre */
export function buildUnsplashQuery(title: string, genre: string): string {
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const genreWords = genre.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  return [...titleWords, ...genreWords].join(',');
}

/** Get a static Unsplash Source URL — no API key, no rate limit */
export function getUnsplashUrl(title: string, genre: string, width = 800, height = 500): string {
  const query = buildUnsplashQuery(title, genre);
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}`;
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
