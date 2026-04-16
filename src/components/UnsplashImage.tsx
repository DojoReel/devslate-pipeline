import { getPicsumUrl, getGenreGradient, buildPexelsQuery } from '@/hooks/useUnsplashImage';
import { useState, useEffect, useRef } from 'react';

const PEXELS_API_KEY = 'O4WvLbQPYGhTqHbbQsluFi6K1TydEqFPXB5EndiwvAuwC20Ivlz0pxyt';

// Module-level cache so images persist across re-renders and remounts
const imageCache = new Map<string, string>();

/** Resolve a Pexels image URL for a given keyword+genre. Returns cached if available. Uses logline for better relevance. */
export function resolveImageUrl(keyword: string, genre: string, logline?: string): Promise<string> {
  if (imageCache.has(keyword)) return Promise.resolve(imageCache.get(keyword)!);

  // Use logline for more relevant image search when available
  const searchText = logline && logline.length > 10 ? logline : keyword;
  const query = encodeURIComponent(buildPexelsQuery(searchText, genre));
  const randomPage = Math.floor(Math.random() * 3) + 1;

  return fetch(`https://api.pexels.com/v1/search?query=${query}&orientation=landscape&per_page=1&page=${randomPage}`, {
    headers: { Authorization: PEXELS_API_KEY },
  })
    .then(r => r.json())
    .then(data => {
      const url = data?.photos?.[0]?.src?.landscape;
      const final = url || getPicsumUrl(keyword);
      imageCache.set(keyword, final);
      return final;
    })
    .catch(() => {
      const fallback = getPicsumUrl(keyword);
      imageCache.set(keyword, fallback);
      return fallback;
    });
}

/** Preload an image into browser cache */
export function preloadImage(keyword: string, genre: string, logline?: string): void {
  resolveImageUrl(keyword, genre, logline).then(url => {
    const img = new Image();
    img.src = url;
  });
}

/** Check if an image is already cached */
export function isImageCached(keyword: string): boolean {
  return imageCache.has(keyword);
}

interface UnsplashImageProps {
  genre: string;
  keyword: string;
  orientation?: 'portrait' | 'landscape';
  className?: string;
  alt?: string;
  logline?: string;
  /** Called when the image has fully loaded and is ready to display */
  onImageReady?: () => void;
  /** If true, show loading skeleton instead of image until loaded */
  showLoadingState?: boolean;
}

export function UnsplashImage({ genre, keyword, className = '', alt = '', logline, onImageReady, showLoadingState = false }: UnsplashImageProps) {
  const cacheKey = keyword;
  const [src, setSrc] = useState<string | null>(imageCache.get(cacheKey) ?? null);
  const [loaded, setLoaded] = useState(!!imageCache.get(cacheKey));
  const [failed, setFailed] = useState(false);
  const fetched = useRef(false);
  const prevKeyword = useRef(keyword);

  // Reset state when keyword changes
  useEffect(() => {
    if (prevKeyword.current !== keyword) {
      prevKeyword.current = keyword;
      fetched.current = false;
      setFailed(false);

      if (imageCache.has(keyword)) {
        setSrc(imageCache.get(keyword)!);
        setLoaded(true);
        onImageReady?.();
      } else {
        setSrc(null);
        setLoaded(false);
      }
    }
  }, [keyword, onImageReady]);

  useEffect(() => {
    if (fetched.current || imageCache.has(cacheKey)) {
      if (imageCache.has(cacheKey) && !src) {
        setSrc(imageCache.get(cacheKey)!);
      }
      return;
    }
    fetched.current = true;

    resolveImageUrl(keyword, genre, logline).then(url => {
      setSrc(url);
    });
  }, [cacheKey, keyword, genre, src]);

  const gradient = getGenreGradient(genre);

  const handleLoad = () => {
    setLoaded(true);
    onImageReady?.();
  };

  // Show loading skeleton
  if (showLoadingState && (!src || !loaded) && !failed) {
    return (
      <div className={`${className} flex items-center justify-center`} style={{ background: '#1a1a1a' }}>
        <div className="absolute inset-0 animate-pulse" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)' }} />
        <div className="relative w-8 h-8 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (failed || !src) {
    return <div className={className} style={{ background: gradient }} />;
  }

  return (
    <>
      {showLoadingState && !loaded && (
        <div className={`${className} absolute inset-0 flex items-center justify-center z-10`} style={{ background: '#1a1a1a' }}>
          <div className="absolute inset-0 animate-pulse" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)' }} />
          <div className="relative w-8 h-8 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt || keyword}
        className={`${className} ${showLoadingState && !loaded ? 'opacity-0' : 'opacity-100'}`}
        loading="lazy"
        onLoad={handleLoad}
        onError={() => setFailed(true)}
      />
    </>
  );
}
