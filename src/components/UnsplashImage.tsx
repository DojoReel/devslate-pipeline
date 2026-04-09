import { useUnsplashImage } from '@/hooks/useUnsplashImage';

interface UnsplashImageProps {
  genre: string;
  keyword: string;
  orientation?: 'portrait' | 'landscape';
  className?: string;
  alt?: string;
}

/** Renders an Unsplash image with gradient fallback. Never shows broken icons. */
export function UnsplashImage({ genre, keyword, orientation = 'portrait', className = '', alt = '' }: UnsplashImageProps) {
  const { imageUrl, loading, gradient } = useUnsplashImage(genre, keyword, orientation);

  if (!imageUrl) {
    return <div className={className} style={{ background: gradient }} />;
  }

  return (
    <img
      src={imageUrl}
      alt={alt || keyword}
      className={className}
      loading="lazy"
      onError={(e) => {
        // Replace with gradient on error
        const el = e.currentTarget;
        const parent = el.parentElement;
        if (parent) {
          const div = document.createElement('div');
          div.className = el.className;
          div.style.background = gradient;
          parent.replaceChild(div, el);
        }
      }}
    />
  );
}
