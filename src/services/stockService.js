import {
  doc, getDoc, setDoc, updateDoc,
  increment, serverTimestamp, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

const STOCK_DOC = 'stock/plain_donut';
const DEFAULT_THRESHOLD = 30;

export const stockService = {
  /**
   * Get current stock snapshot (one-time)
   * @returns {Promise<{ current: number, threshold: number }>}
   */
  getStock: async () => {
    const snap = await getDoc(doc(db, 'stock', 'plain_donut'));
    if (snap.exists()) {
      const data = snap.data();
      return {
        current: data.current ?? 0,
        threshold: data.threshold ?? DEFAULT_THRESHOLD,
      };
    }
    return { current: 0, threshold: DEFAULT_THRESHOLD };
  },

  /**
   * Set absolute stock value (admin action)
   * @param {number} value
   */
  setStock: async (value) => {
    await setDoc(
      doc(db, 'stock', 'plain_donut'),
      { current: value, updatedAt: serverTimestamp() },
      { merge: true }
    );
  },

  /**
   * Update threshold value (admin action)
   * @param {number} value
   */
  setThreshold: async (value) => {
    await setDoc(
      doc(db, 'stock', 'plain_donut'),
      { threshold: value, updatedAt: serverTimestamp() },
      { merge: true }
    );
  },

  /**
   * Atomically reduce stock by qty (called after order creation)
   * @param {number} qty
   */
  reduceStock: async (qty) => {
    await updateDoc(doc(db, 'stock', 'plain_donut'), {
      current: increment(-qty),
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Subscribe to real-time stock updates
   * @param {function} cb - callback({ current, threshold })
   * @returns {function} unsubscribeFn
   */
  subscribeStock: (cb) => {
    return onSnapshot(doc(db, 'stock', 'plain_donut'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        cb({
          current: data.current ?? 0,
          threshold: data.threshold ?? DEFAULT_THRESHOLD,
        });
      } else {
        cb({ current: 0, threshold: DEFAULT_THRESHOLD });
      }
    });
  },

  /**
   * Pure helper — exposed for testing
   */
  isLowStock: (stock, threshold) => stock < threshold,
};
