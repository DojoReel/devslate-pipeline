/** Build a URL-safe slug from a title */
function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Picsum fallback URL */
export function getPicsumUrl(title: string, width = 800, height = 500): string {
  return `https://picsum.photos/seed/${toSlug(title)}/${width}/${height}`;
}

/** Stop words to strip when extracting visual keywords */
const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','it','that','this','of','in','to','and',
  'for','on','with','at','by','from','as','or','but','not','be','been','being',
  'have','has','had','do','does','did','will','would','could','should','can',
  'may','might','shall','about','into','through','during','before','after',
  'above','below','between','under','over','out','up','down','off','then',
  'than','too','very','just','also','only','own','same','so','no','nor',
  'each','every','all','both','few','more','most','other','some','such',
  'what','which','who','whom','how','when','where','why','if','because',
  'while','although','though','since','until','unless','whether','once',
  'their','there','they','them','its','his','her','she','he','we','you',
  'our','your','my','me','him','us','i','new','one','two','three','four',
  'first','second','last','next','many','much','still','even','back','get',
  'got','make','made','take','come','go','goes','went','find','found',
  'know','known','think','see','look','want','give','use','tell','say',
  'said','try','need','feel','become','leave','put','mean','keep','let',
  'begin','show','hear','play','run','move','live','believe','bring','happen',
  'must','really','already','yet','never','always','sometimes','often',
  'series','show','shows','story','stories','follows','explores','reveals',
  'uncovers','behind','scenes','world','inside','deep','dive','into',
]);

/**
 * Extract 3-4 visually descriptive keywords from logline text.
 * Focuses on nouns/descriptors that describe setting, subject, environment.
 */
export function extractVisualKeywords(logline: string): string[] {
  const text = logline.slice(0, 150).toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const words = text.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  // Deduplicate while preserving order
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const w of words) {
    if (!seen.has(w)) { seen.add(w); unique.push(w); }
  }
  return unique.slice(0, 4);
}

/** Build a Pexels search query — uses logline keywords, never the title */
export function buildPexelsQuery(logline: string, genre: string): string {
  const keywords = extractVisualKeywords(logline);
  if (keywords.length >= 2) return keywords.join(' ');
  // Fallback: use genre words if logline is too short
  const genreWords = genre.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  return [...keywords, ...genreWords].slice(0, 4).join(' ');
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
