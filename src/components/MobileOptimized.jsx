import { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isMobileViewport, preventBodyScroll, allowBodyScroll } from '../utils/mobileOptimizations';

/**
 * MobileOptimizedModal - Full-screen modal on mobile, centered on desktop
 * Better UX for mobile users with bottom sheet style
 */
export const MobileOptimizedModal = memo(({ isOpen, onClose, children, title, className = '' }) => {
  useEffect(() => {
    if (isOpen && isMobileViewport()) {
      preventBodyScroll();
    } else {
      allowBodyScroll();
    }
    
    return () => allowBodyScroll();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center ${className}`}
          >
            <div className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-lg md:mx-4 max-h-[90vh] md:max-h-[85vh] flex flex-col shadow-2xl">
              {/* Handle bar (mobile only) */}
              <div className="md:hidden flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              {/* Header */}
              {title && (
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {title}
                  </h3>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
MobileOptimizedModal.displayName = 'MobileOptimizedModal';

/**
 * TouchOptimizedButton - Larger touch targets on mobile
 */
export const TouchOptimizedButton = memo(({ 
  children, 
  onClick, 
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...props 
}) => {
  const variants = {
    primary: 'bg-chocolate dark:bg-caramel hover:bg-dark-chocolate dark:hover:bg-chocolate text-white',
    secondary: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    outline: 'border-2 border-chocolate dark:border-pastel-pink text-chocolate dark:text-pastel-pink hover:bg-chocolate dark:hover:bg-pastel-pink hover:text-white',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[40px]', // Mobile-friendly minimum
    md: 'px-6 py-3 text-base min-h-[44px]', // iOS guideline: 44px
    lg: 'px-8 py-4 text-lg min-h-[48px]',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-full font-semibold transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95 touch-manipulation
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
});
TouchOptimizedButton.displayName = 'TouchOptimizedButton';

/**
 * SwipeToDelete - Swipeable list item (mobile)
 */
export const SwipeToDelete = memo(({ children, onDelete, threshold = 100 }) => {
  const [x, setX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (_, info) => {
    setIsDragging(false);
    if (Math.abs(info.offset.x) > threshold) {
      onDelete();
    } else {
      setX(0);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Delete background */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6">
        <span className="text-white font-semibold">Delete</span>
      </div>

      {/* Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -200, right: 0 }}
        dragElastic={0.2}
        onDrag={(_, info) => {
          setIsDragging(true);
          setX(info.offset.x);
        }}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`bg-white dark:bg-gray-800 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} touch-pan-y`}
      >
        {children}
      </motion.div>
    </div>
  );
});
SwipeToDelete.displayName = 'SwipeToDelete';

/**
 * MobileStickyFooter - Sticky action bar on mobile
 */
export const MobileStickyFooter = memo(({ children, className = '' }) => (
  <div className={`
    sticky bottom-0 left-0 right-0 
    bg-white dark:bg-gray-900 
    border-t border-gray-200 dark:border-gray-700
    p-4 pb-safe
    shadow-lg
    md:relative md:border-0 md:shadow-none md:p-0
    ${className}
  `}>
    {children}
  </div>
));
MobileStickyFooter.displayName = 'MobileStickyFooter';

/**
 * ResponsiveGrid - Auto-responsive grid based on viewport
 */
export const ResponsiveGrid = memo(({ children, className = '' }) => (
  <div className={`
    grid 
    grid-cols-1 
    sm:grid-cols-2 
    lg:grid-cols-3 
    xl:grid-cols-4 
    gap-4 sm:gap-6 lg:gap-8
    ${className}
  `}>
    {children}
  </div>
));
ResponsiveGrid.displayName = 'ResponsiveGrid';

/**
 * MobileDrawer - Bottom sheet drawer for mobile
 */
export const MobileDrawer = memo(({ isOpen, onClose, children, height = '75vh' }) => {
  useEffect(() => {
    if (isOpen) {
      preventBodyScroll();
    } else {
      allowBodyScroll();
    }
    
    return () => allowBodyScroll();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl"
            style={{ maxHeight: height }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Content */}
            <div className="overflow-y-auto pb-safe" style={{ maxHeight: `calc(${height} - 2rem)` }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
MobileDrawer.displayName = 'MobileDrawer';

/**
 * SafeAreaView - Respects device safe areas (notch, home indicator)
 */
export const SafeAreaView = memo(({ children, className = '' }) => (
  <div className={`pt-safe pr-safe pb-safe pl-safe ${className}`}>
    {children}
  </div>
));
SafeAreaView.displayName = 'SafeAreaView';

export default {
  MobileOptimizedModal,
  TouchOptimizedButton,
  SwipeToDelete,
  MobileStickyFooter,
  ResponsiveGrid,
  MobileDrawer,
  SafeAreaView,
};
