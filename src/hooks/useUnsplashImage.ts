const UNSPLASH_ACCESS_KEY = 'lnJhQZFYk1uOwPaESHrAZG31qzN6FvqgQTAQeJTuAKs';

// Global in-memory cache: query -> image URL
const imageCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string | null>>();

/** Fetch a random Unsplash image URL for a given query. Returns cached result if available. */
export async function fetchUnsplashImage(
  genre: string,
  keyword: string,
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<string | null> {
  const cacheKey = `${genre}|${keyword}|${orientation}`;

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  // Deduplicate in-flight requests
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const query = encodeURIComponent(`${genre} ${keyword} television documentary`);
  const url = `https://api.unsplash.com/photos/random?query=${query}&orientation=${orientation}&client_id=${UNSPLASH_ACCESS_KEY}`;

  const promise = fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Unsplash API ${res.status}`);
      return res.json();
    })
    .then(data => {
      const imgUrl = data?.urls?.regular || data?.urls?.small || null;
      if (imgUrl) imageCache.set(cacheKey, imgUrl);
      return imgUrl;
    })
    .catch(err => {
      console.warn('Unsplash fetch failed:', err);
      return null;
    })
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, promise);
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

// React hook for fetching an Unsplash image with caching
import { useState, useEffect } from 'react';

export function useUnsplashImage(
  genre: string,
  keyword: string,
  orientation: 'portrait' | 'landscape' = 'portrait'
) {
  const [imageUrl, setImageUrl] = useState<string | null>(() => {
    const cacheKey = `${genre}|${keyword}|${orientation}`;
    return imageCache.get(cacheKey) || null;
  });
  const [loading, setLoading] = useState(!imageUrl);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUnsplashImage(genre, keyword, orientation).then(url => {
      if (!cancelled) {
        setImageUrl(url);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [genre, keyword, orientation]);

  return { imageUrl, loading, gradient: getGenreGradient(genre) };
}
