import { motion } from 'framer-motion';
import { FiStar, FiUsers, FiShoppingCart, FiCheckCircle, FiAward, FiTrendingUp } from 'react-icons/fi';

/**
 * Social Proof Components
 * Build trust and credibility through various trust indicators
 */

// Trust Badge Component
export const TrustBadge = ({ icon: Icon, title, description, color = 'chocolate' }) => {
  const colorMap = {
    chocolate: 'from-chocolate to-caramel',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transition-all"
    >
      <div className={`w-14 h-14 bg-gradient-to-br ${colorMap[color]} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  );
};

// Stats Counter Component
export const StatsCounter = ({ value, label, suffix = '', icon: Icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="flex items-center justify-center space-x-2 mb-2">
        {Icon && <Icon className="w-8 h-8 text-chocolate dark:text-pastel-pink" />}
        <div className="text-5xl font-bold bg-gradient-to-r from-chocolate to-caramel bg-clip-text text-transparent dark:from-pastel-pink dark:to-rose-gold">
          {value}{suffix}
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 font-medium">{label}</p>
    </motion.div>
  );
};

// Customer Review Highlight
export const ReviewHighlight = ({ rating, review, author, date, verified = true }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              className={`w-5 h-5 ${
                i < rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          ))}
        </div>
        {verified && (
          <span className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
            <FiCheckCircle className="w-3 h-3" />
            <span>Verified</span>
          </span>
        )}
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{review}"</p>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-800 dark:text-white">{author}</span>
        <span className="text-gray-400 dark:text-gray-500">{date}</span>
      </div>
    </motion.div>
  );
};

// Social Proof Banner
export const SocialProofBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-r from-chocolate/10 via-caramel/10 to-rose-gold/10 dark:from-chocolate/5 dark:via-caramel/5 dark:to-rose-gold/5 rounded-3xl p-8 border border-chocolate/20 dark:border-chocolate/10"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatsCounter value="500" suffix="+" label="Pelanggan Puas" icon={FiUsers} />
        <StatsCounter value="2000" suffix="+" label="Donat Terjual" icon={FiShoppingCart} />
        <StatsCounter value="4.9" suffix="/5" label="Rating Rata-rata" icon={FiStar} />
        <StatsCounter value="100" suffix="%" label="Bahan Premium" icon={FiAward} />
      </div>
    </motion.div>
  );
};

// Trust Indicators Section
export const TrustIndicators = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <TrustBadge
        icon={FiCheckCircle}
        title="Kualitas Terjamin"
        description="Bahan pilihan dan proses higienis"
        color="green"
      />
      <TrustBadge
        icon={FiAward}
        title="Best Seller"
        description="Produk terfavorit pelanggan"
        color="chocolate"
      />
      <TrustBadge
        icon={FiShoppingCart}
        title="Mudah & Cepat"
        description="Pesan via WhatsApp langsung"
        color="blue"
      />
      <TrustBadge
        icon={FiTrendingUp}
        title="Harga Terjangkau"
        description="Kualitas premium, harga bersahabat"
        color="purple"
      />
    </div>
  );
};

// Urgency/Scarcity Indicator
export const UrgencyBadge = ({ stock, threshold = 10 }) => {
  if (!stock || stock > threshold) return null;

  const isLow = stock <= threshold && stock > 0;
  const isOut = stock <= 0;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
        isOut
          ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
      }`}
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        🔥
      </motion.span>
      <span>
        {isOut ? 'Stok Habis' : `Hanya ${stock} box tersisa!`}
      </span>
    </motion.div>
  );
};

// Recent Activity Notification
export const RecentActivity = ({ activities = [] }) => {
  if (activities.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-24 left-4 z-40 max-w-sm"
    >
      {activities.slice(0, 3).map((activity, index) => (
        <motion.div
          key={activity.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ delay: index * 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-3 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FiCheckCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                {activity.customerName || 'Seseorang'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Baru saja memesan {activity.productName}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{activity.timeAgo}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Guarantee Badge
export const GuaranteeBadge = () => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800"
    >
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
          <FiCheckCircle className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
            100% Garansi Kepuasan
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Kami berkomitmen memberikan donat berkualitas terbaik. Jika tidak puas, 
            hubungi kami dan kami akan pastikan Anda senang!
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default {
  TrustBadge,
  StatsCounter,
  ReviewHighlight,
  SocialProofBanner,
  TrustIndicators,
  UrgencyBadge,
  RecentActivity,
  GuaranteeBadge,
};
