import { memo } from 'react';
import { motion } from 'framer-motion';

const Loading = memo(() => (
  <div className="fixed inset-0 bg-gradient-to-br from-warm-cream via-cream to-peach dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center z-50">
    <div className="text-center">
      {/* Animated Donut Ring */}
      <div className="relative w-32 h-32 mx-auto mb-8">
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-8 border-transparent border-t-chocolate border-r-chocolate/50 dark:border-t-pastel-pink dark:border-r-pastel-pink/50"
        />
        
        {/* Middle pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-2 rounded-full bg-gradient-to-br from-pastel-pink/20 to-chocolate/20 dark:from-pastel-pink/10 dark:to-rose-gold/10"
        />
        
        {/* Inner spinning donut emoji */}
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center text-5xl"
        >
          🍩
        </motion.div>

        {/* Sparkle effects */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: [0, Math.cos(i * 120 * Math.PI / 180) * 40],
              y: [0, Math.sin(i * 120 * Math.PI / 180) * 40],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeOut'
            }}
            className="absolute top-1/2 left-1/2 w-2 h-2 bg-rose-gold dark:bg-pastel-pink rounded-full"
          />
        ))}
      </div>

      {/* Text with stagger animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-4xl font-bold font-elegant mb-2">
          <span className="bg-gradient-to-r from-chocolate via-caramel to-chocolate dark:from-pastel-pink dark:via-rose-gold dark:to-pastel-pink bg-clip-text text-transparent">
            RN Donat
          </span>
        </h1>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-gray-600 dark:text-gray-400 text-lg"
        >
          Memuat kelezatan...
        </motion.p>
      </motion.div>

      {/* Loading dots */}
      <div className="flex items-center justify-center space-x-2 mt-6">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut'
            }}
            className="w-2 h-2 bg-chocolate dark:bg-pastel-pink rounded-full"
          />
        ))}
      </div>
    </div>
  </div>
));

Loading.displayName = 'Loading';
export default Loading;
