import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * OptimizedImage - Lazy-loaded image with blur-up effect
 * Features:
 * - Lazy loading (only loads when in viewport)
 * - Blur-up placeholder effect
 * - Loading skeleton
 * - Error handling with fallback
 * - Aspect ratio preservation
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  aspectRatio = '1/1', // CSS aspect-ratio value
  objectFit = 'cover',
  placeholder = 'blur', // 'blur' | 'skeleton' | 'none'
  fallback = null, // Fallback image URL or component
  onLoad = () => {},
  onError = () => {},
  priority = false, // Skip lazy loading for above-the-fold images
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip observer if priority image

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError(e);
  };

  // Show fallback if error
  if (hasError) {
    if (fallback) {
      return typeof fallback === 'string' ? (
        <img src={fallback} alt={alt} className={className} {...props} />
      ) : (
        fallback
      );
    }
    // Default fallback
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ aspectRatio }}
        {...props}
      >
        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
      {...props}
    >
      {/* Placeholder while loading */}
      {!isLoaded && placeholder === 'blur' && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse"
        />
      )}

      {!isLoaded && placeholder === 'skeleton' && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )}

      {/* Actual image - only render when in view */}
      {isInView && (
        <motion.img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={`w-full h-full object-${objectFit}`}
          style={{ objectFit }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
