/**
 * Mobile Optimization Utilities
 * Helpers for detecting mobile devices and optimizing touch interactions
 */

/**
 * Detect if user is on mobile device
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Detect if user is on touch device
 */
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
};

/**
 * Get current viewport width
 */
export const getViewportWidth = () => {
  if (typeof window === 'undefined') return 0;
  return Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );
};

/**
 * Get current viewport height
 */
export const getViewportHeight = () => {
  if (typeof window === 'undefined') return 0;
  return Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0
  );
};

/**
 * Check if viewport is mobile size (< 640px)
 */
export const isMobileViewport = () => getViewportWidth() < 640;

/**
 * Check if viewport is tablet size (640px - 1024px)
 */
export const isTabletViewport = () => {
  const width = getViewportWidth();
  return width >= 640 && width < 1024;
};

/**
 * Check if viewport is desktop size (>= 1024px)
 */
export const isDesktopViewport = () => getViewportWidth() >= 1024;

/**
 * Prevent body scroll (useful for modals on mobile)
 */
export const preventBodyScroll = () => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
};

/**
 * Allow body scroll
 */
export const allowBodyScroll = () => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
};

/**
 * Smooth scroll to element (mobile-friendly)
 */
export const smoothScrollTo = (elementId, offset = 0) => {
  if (typeof window === 'undefined') return;
  
  const element = document.getElementById(elementId);
  if (!element) return;

  const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
  
  window.scrollTo({
    top: y,
    behavior: 'smooth'
  });
};

/**
 * Debounce function for scroll/resize events
 */
export const debounce = (func, wait = 150) => {
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
 * Throttle function for frequent events
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Get safe area insets for notched devices (iPhone X, etc)
 */
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 };
  
  const computedStyle = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(computedStyle.getPropertyValue('--sat') || '0', 10),
    right: parseInt(computedStyle.getPropertyValue('--sar') || '0', 10),
    bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0', 10),
    left: parseInt(computedStyle.getPropertyValue('--sal') || '0', 10),
  };
};

/**
 * Haptic feedback for mobile devices
 */
export const hapticFeedback = (type = 'light') => {
  if (typeof window === 'undefined' || !window.navigator.vibrate) return;
  
  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30],
    success: [10, 50, 10],
    error: [10, 100, 10, 100, 10],
  };
  
  window.navigator.vibrate(patterns[type] || patterns.light);
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get optimal image size for current viewport
 */
export const getOptimalImageSize = () => {
  const width = getViewportWidth();
  
  if (width < 640) return 'small'; // Mobile
  if (width < 1024) return 'medium'; // Tablet
  return 'large'; // Desktop
};

/**
 * Format phone number for mobile calling
 */
export const formatPhoneForCall = (phone) => {
  // Remove all non-numeric characters except +
  return phone.replace(/[^0-9+]/g, '');
};

/**
 * Check if running as PWA
 */
export const isPWA = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
};

/**
 * Get device pixel ratio for high-DPI displays
 */
export const getPixelRatio = () => {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
};

export default {
  isMobile,
  isTouchDevice,
  getViewportWidth,
  getViewportHeight,
  isMobileViewport,
  isTabletViewport,
  isDesktopViewport,
  preventBodyScroll,
  allowBodyScroll,
  smoothScrollTo,
  debounce,
  throttle,
  getSafeAreaInsets,
  hapticFeedback,
  prefersReducedMotion,
  getOptimalImageSize,
  formatPhoneForCall,
  isPWA,
  getPixelRatio,
};
