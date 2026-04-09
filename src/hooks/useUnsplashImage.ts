import { useState, useEffect } from 'react';

const cache = new Map<string, string>();

export function useUnsplashImage(query: string, fallback = '/placeholder.svg') {
  const [url, setUrl] = useState(() => cache.get(query) || fallback);

  useEffect(() => {
    if (cache.has(query)) {
      setUrl(cache.get(query)!);
      return;
    }
    const encoded = encodeURIComponent(query);
    const imgUrl = `https://source.unsplash.com/800x1200/?${encoded}`;
    cache.set(query, imgUrl);
    setUrl(imgUrl);
  }, [query]);

  return url;
}

export function getUnsplashUrl(query: string, w = 800, h = 1200) {
  const encoded = encodeURIComponent(query);
  return `https://source.unsplash.com/${w}x${h}/?${encoded}`;
}
