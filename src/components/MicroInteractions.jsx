import { motion } from 'framer-motion';
import { memo } from 'react';

/**
 * Collection of reusable micro-interaction components
 * Provides consistent, delightful feedback for user actions
 */

// ============================================
// 1. HAPTIC FEEDBACK (Visual)
// ============================================

/**
 * TapFeedback - Adds scale animation on tap
 * Use for: Buttons, cards, clickable items
 */
export const TapFeedback = memo(({ children, scale = 0.95, className = '', ...props }) => (
  <motion.div
    whileTap={{ scale }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
));
TapFeedback.displayName = 'TapFeedback';

/**
 * HoverGrow - Grows slightly on hover
 * Use for: CTAs, important buttons, featured items
 */
export const HoverGrow = memo(({ children, scale = 1.05, className = '', ...props }) => (
  <motion.div
    whileHover={{ scale }}
    transition={{ duration: 0.2 }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
));
HoverGrow.displayName = 'HoverGrow';

/**
 * HoverLift - Lifts up with shadow on hover
 * Use for: Cards, product items, elevated surfaces
 */
export const HoverLift = memo(({ 
  children, 
  y = -8, 
  shadow = '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
  className = '', 
  ...props 
}) => (
  <motion.div
    whileHover={{ y, boxShadow: shadow }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
));
HoverLift.displayName = 'HoverLift';

// ============================================
// 2. SUCCESS FEEDBACK
// ============================================

/**
 * SuccessCheckmark - Animated checkmark for success states
 * Use for: Form submissions, adding to cart, saving data
 */
export const SuccessCheckmark = memo(({ size = 24, color = 'currentColor' }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
  >
    <motion.circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.3 }}
    />
    <motion.path
      d="M8 12l2 2 4-4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    />
  </motion.svg>
));
SuccessCheckmark.displayName = 'SuccessCheckmark';

/**
 * SuccessBadge - Animated success badge with emoji
 * Use for: Notifications, confirmations, achievements
 */
export const SuccessBadge = memo(({ emoji = '✓', message = 'Success!' }) => (
  <motion.div
    initial={{ scale: 0, y: 50 }}
    animate={{ scale: 1, y: 0 }}
    exit={{ scale: 0, y: -50 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="inline-flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg"
  >
    <motion.span
      initial={{ rotate: -180, scale: 0 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      className="text-lg"
    >
      {emoji}
    </motion.span>
    <span className="font-semibold text-sm">{message}</span>
  </motion.div>
));
SuccessBadge.displayName = 'SuccessBadge';

// ============================================
// 3. NUMBER ANIMATIONS
// ============================================

/**
 * NumberPop - Pops number when it changes
 * Use for: Quantity counters, cart badges, notifications
 */
export const NumberPop = memo(({ value, className = '' }) => (
  <motion.span
    key={value}
    initial={{ scale: 1.5, color: '#F97316' }}
    animate={{ scale: 1, color: 'inherit' }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className={className}
  >
    {value}
  </motion.span>
));
NumberPop.displayName = 'NumberPop';

/**
 * CounterBadge - Animated notification badge
 * Use for: Cart count, notification count, unread messages
 */
export const CounterBadge = memo(({ count, max = 9, className = '' }) => {
  const display = count > max ? `${max}+` : count;
  
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full ${className}`}
        >
          <NumberPop value={display} />
        </motion.span>
      )}
    </AnimatePresence>
  );
});
CounterBadge.displayName = 'CounterBadge';

// ============================================
// 4. LOADING STATES
// ============================================

/**
 * Spinner - Simple spinning loader
 * Use for: Button loading states, inline loading
 */
export const Spinner = memo(({ size = 20, color = 'currentColor', className = '' }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    className={className}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="32 32"
      opacity="0.25"
    />
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="32 32"
      strokeDashoffset="8"
    />
  </motion.svg>
));
Spinner.displayName = 'Spinner';

/**
 * Pulse - Pulsing dot indicator
 * Use for: Live status, activity indicator, thinking state
 */
export const Pulse = memo(({ size = 12, color = 'currentColor', className = '' }) => (
  <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
    <motion.div
      animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="absolute inset-0 rounded-full"
      style={{ backgroundColor: color }}
    />
    <div
      className="absolute inset-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  </div>
));
Pulse.displayName = 'Pulse';

// ============================================
// 5. ATTENTION GRABBERS
// ============================================

/**
 * Wiggle - Subtle wiggle animation
 * Use for: Draw attention to new features, errors, important items
 */
export const Wiggle = memo(({ children, trigger = false, className = '' }) => (
  <motion.div
    animate={trigger ? {
      rotate: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.5 }
    } : {}}
    className={className}
  >
    {children}
  </motion.div>
));
Wiggle.displayName = 'Wiggle';

/**
 * Bounce - Bounce animation
 * Use for: Errors, alerts, getting user attention
 */
export const Bounce = memo(({ children, trigger = false, className = '' }) => (
  <motion.div
    animate={trigger ? {
      y: [0, -10, 0, -5, 0],
      transition: { duration: 0.6 }
    } : {}}
    className={className}
  >
    {children}
  </motion.div>
));
Bounce.displayName = 'Bounce';

/**
 * Shake - Shake animation for errors
 * Use for: Form validation errors, wrong input, denied actions
 */
export const Shake = memo(({ children, trigger = false, className = '' }) => (
  <motion.div
    animate={trigger ? {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    } : {}}
    className={className}
  >
    {children}
  </motion.div>
));
Shake.displayName = 'Shake';

// ============================================
// 6. REVEAL ANIMATIONS
// ============================================

/**
 * FadeIn - Simple fade in animation
 * Use for: Content reveals, new items, modals
 */
export const FadeIn = memo(({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay }}
    className={className}
  >
    {children}
  </motion.div>
));
FadeIn.displayName = 'FadeIn';

/**
 * SlideUp - Slide up with fade
 * Use for: Lists, cards, sequential reveals
 */
export const SlideUp = memo(({ children, delay = 0, y = 20, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
));
SlideUp.displayName = 'SlideUp';

/**
 * ScaleIn - Scale in with fade
 * Use for: Modals, popups, important announcements
 */
export const ScaleIn = memo(({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
));
ScaleIn.displayName = 'ScaleIn';

// ============================================
// 7. INTERACTIVE FEEDBACK
// ============================================

/**
 * RippleEffect - Material design ripple
 * Use for: Buttons, clickable surfaces
 */
export const RippleButton = memo(({ children, onClick, className = '', ...props }) => {
  const [ripples, setRipples] = useState([]);

  const addRipple = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = { x, y, size, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
    
    onClick?.(e);
  };

  return (
    <button
      onClick={addRipple}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </button>
  );
});
RippleButton.displayName = 'RippleButton';

// Import AnimatePresence at top
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default {
  TapFeedback,
  HoverGrow,
  HoverLift,
  SuccessCheckmark,
  SuccessBadge,
  NumberPop,
  CounterBadge,
  Spinner,
  Pulse,
  Wiggle,
  Bounce,
  Shake,
  FadeIn,
  SlideUp,
  ScaleIn,
  RippleButton,
};
