import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { doc, getDoc, setDoc, increment, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const COUNTER_DOC = 'stats/orders';

// Animasi angka naik
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;

    const duration = 1500;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
      else prevRef.current = end;
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{display.toLocaleString('id-ID')}</span>;
};

const OrderCounter = () => {
  const [totalOrders, setTotalOrders] = useState(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    // Real-time listener ke Firestore
    const unsub = onSnapshot(doc(db, 'stats', 'orders'), (snap) => {
      if (snap.exists()) {
        setTotalOrders(snap.data().totalBoxes || 0);
      } else {
        // Inisialisasi dokumen jika belum ada
        setDoc(doc(db, 'stats', 'orders'), { totalBoxes: 500 });
        setTotalOrders(500);
      }
    });
    return unsub;
  }, []);

  if (totalOrders === null) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-chocolate to-dark-chocolate rounded-3xl p-8 text-white text-center shadow-xl"
    >
      <div className="text-5xl font-bold font-elegant mb-2">
        {isInView ? <AnimatedNumber value={totalOrders} /> : '0'}+
      </div>
      <div className="text-white/80 text-lg font-medium">Kotak Terjual</div>
      <div className="text-white/60 text-sm mt-1">dan terus bertambah setiap hari 🍩</div>
    </motion.div>
  );
};

export default OrderCounter;
