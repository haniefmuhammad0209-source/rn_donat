import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useOrderStats } from '../hooks/useOrderStats';

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    if (start === value) return;
    const duration = 1500;
    const startTime = performance.now();
    let rafId;
    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        prevRef.current = value;
      }
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return <span>{display.toLocaleString('id-ID')}</span>;
};

const OrderCounter = () => {
  const { stats, loading } = useOrderStats();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const totalBoxes = stats?.totalBoxes || 0;

  // Tampilkan skeleton saat loading, sembunyikan jika data 0
  if (loading) return (
    <div className="bg-gradient-to-r from-chocolate to-dark-chocolate rounded-3xl p-8 text-center shadow-xl animate-pulse">
      <div className="h-12 w-32 bg-white/20 rounded-xl mx-auto mb-2" />
      <div className="h-5 w-28 bg-white/20 rounded mx-auto" />
    </div>
  );

  if (!stats) return null;

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-chocolate to-dark-chocolate rounded-3xl p-8 text-white text-center shadow-xl"
    >
      <div className="text-5xl font-bold font-elegant mb-2">
        {isInView ? <AnimatedNumber value={totalBoxes} /> : '0'}+
      </div>
      <div className="text-white/80 text-lg font-medium">Kotak Terjual</div>
      <div className="text-white/60 text-sm mt-1">dan terus bertambah setiap hari 🍩</div>
    </motion.div>
  );
};

export default OrderCounter;
