import { getPicsumUrl, getGenreGradient, buildPexelsQuery } from '@/hooks/useUnsplashImage';
import { useState, useEffect, useRef } from 'react';

const PEXELS_API_KEY = 'O4WvLbQPYGhTqHbbQsluFi6K1TydEqFPXB5EndiwvAuwC20Ivlz0pxyt';

// Module-level cache so images persist across re-renders and remounts
const imageCache = new Map<string, string>();

interface UnsplashImageProps {
  genre: string;
  keyword: string;
  orientation?: 'portrait' | 'landscape';
  className?: string;
  alt?: string;
  logline?: string;
}

export function UnsplashImage({ genre, keyword, className = '', alt = '' }: UnsplashImageProps) {
  const cacheKey = keyword;
  const [src, setSrc] = useState<string | null>(imageCache.get(cacheKey) ?? null);
  const [failed, setFailed] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current || imageCache.has(cacheKey)) {
      if (imageCache.has(cacheKey)) setSrc(imageCache.get(cacheKey)!);
      return;
    }
    fetched.current = true;

    const query = encodeURIComponent(buildPexelsQuery(keyword, genre));
    const randomPage = Math.floor(Math.random() * 3) + 1;
    fetch(`https://api.pexels.com/v1/search?query=${query}&orientation=landscape&per_page=1&page=${randomPage}`, {
      headers: { Authorization: PEXELS_API_KEY },
    })
      .then(r => r.json())
      .then(data => {
        const url = data?.photos?.[0]?.src?.landscape;
        if (url) {
          imageCache.set(cacheKey, url);
          setSrc(url);
        } else {
          const fallback = getPicsumUrl(keyword);
          imageCache.set(cacheKey, fallback);
          setSrc(fallback);
        }
      })
      .catch(() => {
        const fallback = getPicsumUrl(keyword);
        imageCache.set(cacheKey, fallback);
        setSrc(fallback);
      });
  }, [cacheKey, keyword, genre]);

  const gradient = getGenreGradient(genre);

  if (failed || !src) {
    return <div className={className} style={{ background: gradient }} />;
  }

  return (
    <img
      src={src}
      alt={alt || keyword}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
