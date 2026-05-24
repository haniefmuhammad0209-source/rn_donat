import { motion, AnimatePresence } from 'framer-motion';
import { useStoreStatus } from '../hooks/useStoreStatus';

const StoreStatusBanner = () => {
  const { isOpen, nextOpenText, schedule } = useStoreStatus();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full py-2 px-4 text-center text-sm font-medium ${
          isOpen
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}
      >
        {isOpen ? (
          <span>
            🟢 Toko sedang <strong>BUKA</strong> · Jam operasional: {schedule.open}.00 – {schedule.close}.00
          </span>
        ) : (
          <span>
            🔴 Toko sedang <strong>TUTUP</strong> · {nextOpenText}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default StoreStatusBanner;
