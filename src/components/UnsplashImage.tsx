import { getPicsumUrl, getGenreGradient } from '@/hooks/useUnsplashImage';
import { useState } from 'react';

interface UnsplashImageProps {
  genre: string;
  keyword: string;
  orientation?: 'portrait' | 'landscape';
  className?: string;
  alt?: string;
  logline?: string;
}

export function UnsplashImage({ genre, keyword, className = '', alt = '' }: UnsplashImageProps) {
  const [failed, setFailed] = useState(false);
  const gradient = getGenreGradient(genre);
  const src = getPicsumUrl(keyword);

  if (failed) {
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
