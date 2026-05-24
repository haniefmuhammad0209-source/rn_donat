import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-cream flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-24 h-24 mx-auto mb-8 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pastel-pink to-chocolate rounded-full opacity-20"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-pastel-pink to-chocolate rounded-full opacity-40"></div>
          <div className="absolute inset-4 bg-gradient-to-br from-pastel-pink to-chocolate rounded-full"></div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-bold text-chocolate font-elegant mb-2"
        >
          Donat Premium
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-gray-600"
        >
          Memuat kelezatan...
        </motion.p>
      </div>
    </div>
  );
};

export default Loading;
