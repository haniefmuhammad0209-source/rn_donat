/**
 * Performance monitoring utilities
 * Track and optimize app performance
 */

/**
 * Measure component render time
 * @param {string} componentName - Name of component to track
 * @param {function} callback - Function to measure
 */
export const measureRender = (componentName, callback) => {
  if (typeof performance === 'undefined') return callback();
  
  const startTime = performance.now();
  const result = callback();
  const endTime = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Perf] ${componentName} rendered in ${(endTime - startTime).toFixed(2)}ms`);
  }
  
  return result;
};

/**
 * Debounce function for performance
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for performance
 * @param {function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Preload image for faster loading
 * @param {string} src - Image URL
 * @returns {Promise<HTMLImageElement>}
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload multiple images
 * @param {string[]} srcs - Array of image URLs
 * @returns {Promise<HTMLImageElement[]>}
 */
export const preloadImages = (srcs) => {
  return Promise.all(srcs.map(preloadImage));
};

/**
 * Get Web Vitals metrics
 * @param {function} onPerfEntry - Callback with metrics
 */
export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get connection speed
 * @returns {string} 'slow' | 'fast' | 'unknown'
 */
export const getConnectionSpeed = () => {
  if (typeof navigator === 'undefined' || !navigator.connection) return 'unknown';
  
  const connection = navigator.connection;
  const effectiveType = connection.effectiveType;
  
  if (effectiveType === '4g') return 'fast';
  if (effectiveType === '3g' || effectiveType === '2g') return 'slow';
  return 'unknown';
};

/**
 * Request idle callback wrapper
 * @param {function} callback - Function to call when idle
 * @param {object} options - Options for requestIdleCallback
 */
export const requestIdleCallback = (callback, options = {}) => {
  if (typeof window === 'undefined') return;
  
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, options);
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(callback, 1);
  }
};

/**
 * Optimize large list rendering with virtual scrolling hint
 * @param {number} itemCount - Total number of items
 * @param {number} threshold - Threshold to suggest virtualization
 * @returns {boolean} Should use virtual scrolling
 */
export const shouldVirtualize = (itemCount, threshold = 50) => {
  return itemCount > threshold;
};

/**
 * Memory usage monitoring (Chrome only)
 * @returns {object|null} Memory info or null
 */
export const getMemoryUsage = () => {
  if (typeof performance === 'undefined' || !performance.memory) return null;
  
  return {
    usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
    totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
    jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
  };
};

/**
 * Log performance metrics in development
 */
export const logPerformanceMetrics = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  requestIdleCallback(() => {
    console.group('[Performance Metrics]');
    
    // Navigation timing
    if (performance.timing) {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
      
      console.log('⏱️ Page Load Time:', loadTime + 'ms');
      console.log('📄 DOM Ready:', domReady + 'ms');
    }
    
    // Memory usage
    const memory = getMemoryUsage();
    if (memory) {
      console.log('💾 Memory Usage:', memory);
    }
    
    // Connection speed
    console.log('🌐 Connection:', getConnectionSpeed());
    
    // Reduced motion preference
    console.log('🎬 Reduced Motion:', prefersReducedMotion());
    
    console.groupEnd();
  });
};
