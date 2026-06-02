import { memo } from 'react';
import { motion } from 'framer-motion';

const fmt = (h) => `${String(h).padStart(2, '0')}:00`;

// Terima props dari parent (Home.jsx) — tidak buat listener Firestore sendiri
const StoreStatusBanner = memo(({ isOpen, nextOpenText, schedule }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`fixed top-0 left-0 right-0 z-[60] w-full py-2 px-4 text-center text-sm font-semibold text-white ${
      isOpen ? 'bg-green-500' : 'bg-red-500'
    }`}
  >
    {isOpen ? (
      <span>🟢 Toko sedang <strong>BUKA</strong> · Jam operasional: {fmt(schedule?.open)} – {fmt(schedule?.close)}</span>
    ) : (
      <span>🔴 Toko sedang <strong>TUTUP</strong> · {nextOpenText}</span>
    )}
  </motion.div>
));

StoreStatusBanner.displayName = 'StoreStatusBanner';
export default StoreStatusBanner;
