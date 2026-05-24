import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHome, FiShoppingBag } from 'react-icons/fi';

const NotFound = () => (
  <div className="min-h-screen bg-cream dark:bg-gray-900 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center max-w-md"
    >
      {/* Animated donut */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-8xl mb-6 select-none"
      >
        🍩
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-8xl font-bold text-chocolate dark:text-pastel-pink font-elegant mb-4"
      >
        404
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-gray-800 dark:text-white mb-3 font-elegant"
      >
        Halaman Tidak Ditemukan
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed"
      >
        Sepertinya donat di halaman ini sudah habis terjual!<br />
        Yuk kembali dan pilih donat favoritmu.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto bg-chocolate text-white px-8 py-3.5 rounded-full font-semibold hover:bg-dark-chocolate transition-colors flex items-center justify-center space-x-2"
          >
            <FiHome className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </motion.button>
        </Link>
        <Link to="/#menu">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto border-2 border-chocolate text-chocolate dark:text-pastel-pink dark:border-pastel-pink px-8 py-3.5 rounded-full font-semibold hover:bg-cream dark:hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
          >
            <FiShoppingBag className="w-4 h-4" />
            <span>Lihat Menu</span>
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  </div>
);

export default NotFound;
