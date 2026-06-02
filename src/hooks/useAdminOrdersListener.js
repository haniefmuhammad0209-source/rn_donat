import { useEffect, useRef } from 'react';
import { collection, orderBy, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Listen to new orders and call onNewOrder only for genuinely new ones.
 * Uses useRef to track seen order IDs — does NOT trigger on initial load.
 *
 * @param {{ onNewOrder: (order: object) => void }} params
 */
const useAdminOrdersListener = ({ onNewOrder }) => {
  const seenIdsRef = useRef(null); // null = not yet initialised

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      const currentIds = new Set(snap.docs.map((d) => d.id));

      if (seenIdsRef.current === null) {
        // First snapshot — just record existing IDs, don't notify
        seenIdsRef.current = currentIds;
        return;
      }

      // Find orders that weren't in the previous snapshot
      for (const d of snap.docs) {
        if (!seenIdsRef.current.has(d.id)) {
          const order = { id: d.id, ...d.data() };
          onNewOrder(order);
        }
      }

      // Update seen IDs
      seenIdsRef.current = currentIds;
    });

    return () => unsub();
  }, []); // intentionally empty — onNewOrder is called via closure; stable ref
};

export default useAdminOrdersListener;
