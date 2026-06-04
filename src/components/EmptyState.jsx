import { motion } from 'framer-motion';
import { memo } from 'react';

/**
 * EmptyState Component - Reusable empty state with animation
 * 
 * @param {string} icon - Emoji or icon character (e.g., '🍩', '📦')
 * @param {string} title - Main heading text
 * @param {string} description - Supporting text (optional)
 * @param {object} action - Action button config { label, onClick, icon } (optional)
 * @param {string} size - 'sm' | 'md' | 'lg' (default: 'md')
 * @param {string} variant - 'default' | 'minimal' (default: 'default')
 */
const EmptyState = memo(({ 
  icon = '📭',
  title = 'Tidak ada data',
  description,
  action,
  size = 'md',
  variant = 'default'
}) => {
  const sizes = {
    sm: {
      icon: 'text-4xl',
      title: 'text-base',
      description: 'text-xs',
      spacing: 'py-8',
      iconMargin: 'mb-3'
    },
    md: {
      icon: 'text-6xl',
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'py-12',
      iconMargin: 'mb-4'
    },
    lg: {
      icon: 'text-7xl',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'py-16',
      iconMargin: 'mb-6'
    }
  };

  const currentSize = sizes[size];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (variant === 'minimal') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`${currentSize.spacing} text-center`}
      >
        <motion.div variants={itemVariants} className="text-gray-400 dark:text-gray-600">
          <div className={`${currentSize.icon} ${currentSize.iconMargin} flex items-center justify-center opacity-40`}>
            {icon}
          </div>
          <p className={`${currentSize.title} text-gray-500 dark:text-gray-400 font-medium`}>
            {title}
          </p>
          {description && (
            <p className={`${currentSize.description} text-gray-400 dark:text-gray-500 mt-1`}>
              {description}
            </p>
          )}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`${currentSize.spacing} text-center`}
    >
      {/* Floating icon with background */}
      <motion.div
        variants={itemVariants}
        className="relative inline-block"
      >
        {/* Animated background circles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute inset-0 bg-gradient-to-br from-pastel-pink/20 to-chocolate/20 dark:from-pastel-pink/10 dark:to-caramel/10 rounded-full blur-xl"
        />
        
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={`${currentSize.icon} ${currentSize.iconMargin} relative`}
        >
          {icon}
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h3
        variants={itemVariants}
        className={`${currentSize.title} font-semibold text-gray-700 dark:text-gray-300 mb-2`}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          variants={itemVariants}
          className={`${currentSize.description} text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed`}
        >
          {description}
        </motion.p>
      )}

      {/* Action button */}
      {action && (
        <motion.div
          variants={itemVariants}
          className="mt-6"
        >
          <motion.button
            onClick={action.onClick}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 20px -5px rgba(139, 69, 19, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center space-x-2 bg-chocolate dark:bg-caramel text-white px-6 py-3 rounded-full font-semibold hover:bg-dark-chocolate dark:hover:bg-chocolate transition-colors shadow-md"
          >
            {action.icon && <span className="text-lg">{action.icon}</span>}
            <span>{action.label}</span>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
});

EmptyState.displayName = 'EmptyState';

// Pre-configured variants for common use cases
export const EmptyCart = (props) => (
  <EmptyState
    icon="🍩"
    title="Keranjang masih kosong"
    description="Yuk pilih donat favoritmu dan mulai order!"
    size="lg"
    {...props}
  />
);

export const EmptyOrders = (props) => (
  <EmptyState
    icon="📦"
    title="Belum ada pesanan"
    description="Pesanan akan muncul di sini setelah customer melakukan order"
    size="md"
    {...props}
  />
);

export const EmptyReport = (props) => (
  <EmptyState
    icon="📊"
    title="Tidak ada data untuk periode ini"
    description="Coba pilih periode waktu yang berbeda"
    size="md"
    variant="minimal"
    {...props}
  />
);

export const EmptyCustomers = (props) => (
  <EmptyState
    icon="👥"
    title="Belum ada data pelanggan"
    description="Data pelanggan akan muncul setelah ada pesanan pertama"
    size="md"
    {...props}
  />
);

export const EmptyTestimonials = (props) => (
  <EmptyState
    icon="💬"
    title="Belum ada testimoni"
    description="Testimoni dari pelanggan akan ditampilkan di sini"
    size="md"
    {...props}
  />
);

export const EmptySearch = (props) => (
  <EmptyState
    icon="🔍"
    title="Tidak ada hasil ditemukan"
    description="Coba gunakan kata kunci yang berbeda"
    size="md"
    {...props}
  />
);

export const EmptyStock = (props) => (
  <EmptyState
    icon="📉"
    title="Stok habis"
    description="Silakan update stok untuk melanjutkan penjualan"
    size="md"
    {...props}
  />
);

export const NoConnection = (props) => (
  <EmptyState
    icon="📡"
    title="Tidak ada koneksi"
    description="Periksa koneksi internet Anda dan coba lagi"
    size="md"
    {...props}
  />
);

export default EmptyState;
