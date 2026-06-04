import { useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook untuk mendeteksi order baru dan trigger callback
 * @param {{ onNewOrder: (order) => void }} options
 */
export const useAdminOrdersListener = ({ onNewOrder }) => {
  const lastSeenOrderIds = useRef(new Set());
  const isInitialized = useRef(false);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Pertama kali: inisialisasi dengan semua order yang sudah ada
      if (!isInitialized.current) {
        orders.forEach((order) => {
          lastSeenOrderIds.current.add(order.id);
        });
        isInitialized.current = true;
        return;
      }

      // Setelah inisialisasi: deteksi order baru
      orders.forEach((order) => {
        if (!lastSeenOrderIds.current.has(order.id)) {
          lastSeenOrderIds.current.add(order.id);
          // Trigger callback untuk order baru
          onNewOrder(order);
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [onNewOrder]);
};
