import { memo } from 'react';
import { motion } from 'framer-motion';

const Loading = memo(() => (
  <div className="fixed inset-0 bg-cream dark:bg-gray-900 flex items-center justify-center z-50">
    <div className="text-center">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-24 h-24 mx-auto mb-8 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pastel-pink to-chocolate rounded-full opacity-20" />
        <div className="absolute inset-2 bg-gradient-to-br from-pastel-pink to-chocolate rounded-full opacity-40" />
        <div className="absolute inset-4 bg-gradient-to-br from-pastel-pink to-chocolate rounded-full" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-3xl font-bold text-chocolate dark:text-pastel-pink font-elegant mb-2"
      >
        RN Donat
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-gray-600 dark:text-gray-400"
      >
        Memuat kelezatan...
      </motion.p>
    </div>
  </div>
));

Loading.displayName = 'Loading';
export default Loading;
