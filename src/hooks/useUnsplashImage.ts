const UNSPLASH_ACCESS_KEY = 'lnJhQZFYk1uOwPaESHrAZG31qzN6FvqgQTAQeJTuAKs';

// Global in-memory cache: query -> image URL
const imageCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string | null>>();

/** Build a search query from title + genre */
export function buildUnsplashQuery(title: string, genre: string, logline?: string): string {
  const titleWords = title.split(/\s+/).filter(w => w.length > 2).join(' ');

  let contextWords = '';
  if (logline) {
    const contextMatches = logline.match(/\b(Australia|Australian|Pacific|Asia|Sydney|Melbourne|outback|reef|ocean|island|urban|rural|remote|border|underground|desert)\b/gi);
    if (contextMatches) {
      contextWords = [...new Set(contextMatches.map(w => w.toLowerCase()))].slice(0, 2).join(' ');
    }
  }

  return [titleWords, genre, contextWords].filter(Boolean).join(' ');
}

/** Fetch a random Unsplash image URL. Returns cached result if available. */
export async function fetchUnsplashImage(
  genre: string,
  keyword: string,
  orientation: 'portrait' | 'landscape' = 'portrait',
  logline?: string
): Promise<string | null> {
  const cacheKey = `${genre}|${keyword}|${orientation}`;

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const fullQuery = buildUnsplashQuery(keyword, genre, logline);

  // Try progressively simpler queries on failure
  const queries = [
    fullQuery,
    keyword, // just title
    genre,   // just genre
  ];

  const promise = (async () => {
    for (const q of queries) {
      const encoded = encodeURIComponent(q);
      const url = `https://api.unsplash.com/photos/random?query=${encoded}&orientation=${orientation}&client_id=${UNSPLASH_ACCESS_KEY}`;
      try {
        console.log(`[Unsplash] Fetching: ${q}`);
        const res = await fetch(url);
        if (res.status === 403) {
          console.warn('[Unsplash] Rate limited, using fallback');
          return null;
        }
        if (!res.ok) {
          console.warn(`[Unsplash] ${res.status} for "${q}", trying simpler query...`);
          continue;
        }
        const data = await res.json();
        const imgUrl = data?.urls?.regular || data?.urls?.small || null;
        if (imgUrl) {
          console.log(`[Unsplash] Got image for "${q}"`);
          imageCache.set(cacheKey, imgUrl);
          return imgUrl;
        }
      } catch (err) {
        console.warn('[Unsplash] fetch error:', err);
      }
    }
    return null;
  })();

  pendingRequests.set(cacheKey, promise);
  promise.finally(() => pendingRequests.delete(cacheKey));
  return promise;
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

// React hook
import { useState, useEffect } from 'react';

export function useUnsplashImage(
  genre: string,
  keyword: string,
  orientation: 'portrait' | 'landscape' = 'portrait',
  logline?: string
) {
  const [imageUrl, setImageUrl] = useState<string | null>(() => {
    const cacheKey = `${genre}|${keyword}|${orientation}`;
    return imageCache.get(cacheKey) || null;
  });
  const [loading, setLoading] = useState(!imageUrl);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUnsplashImage(genre, keyword, orientation, logline).then(url => {
      if (!cancelled) {
        setImageUrl(url);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [genre, keyword, orientation, logline]);

  return { imageUrl, loading, gradient: getGenreGradient(genre) };
}
