import {
  doc, getDoc, setDoc, updateDoc, increment,
  serverTimestamp, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

const STOCK_DOC = 'stock/plain_donut';
const DEFAULT_THRESHOLD = 30;

export const stockService = {
  /**
   * Ambil data stok saat ini
   * @returns {Promise<{ current: number, threshold: number }>}
   */
  getStock: async () => {
    const snap = await getDoc(doc(db, STOCK_DOC));
    if (snap.exists()) {
      const data = snap.data();
      return {
        current: data.current || 0,
        threshold: data.threshold || DEFAULT_THRESHOLD,
      };
    }
    // Inisialisasi default jika belum ada
    await setDoc(doc(db, STOCK_DOC), {
      current: 0,
      threshold: DEFAULT_THRESHOLD,
      updatedAt: serverTimestamp(),
    });
    return { current: 0, threshold: DEFAULT_THRESHOLD };
  },

  /**
   * Set stok awal (admin)
   * @param {number} value - jumlah stok baru
   */
  setStock: async (value) => {
    await setDoc(
      doc(db, STOCK_DOC),
      {
        current: value,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  /**
   * Set threshold peringatan stok rendah (admin)
   * @param {number} value - batas minimum
   */
  setThreshold: async (value) => {
    await setDoc(
      doc(db, STOCK_DOC),
      {
        threshold: value,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  /**
   * Kurangi stok secara atomik (dipanggil saat order dibuat)
   * @param {number} qty - jumlah yang akan dikurangi
   */
  reduceStock: async (qty) => {
    await updateDoc(doc(db, STOCK_DOC), {
      current: increment(-qty),
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Subscribe ke perubahan stok real-time
   * @param {function} callback - dipanggil saat stok berubah dengan { current, threshold }
   * @returns {function} unsubscribe function
   */
  subscribeStock: (callback) => {
    return onSnapshot(doc(db, STOCK_DOC), async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callback({
          current: data.current || 0,
          threshold: data.threshold || DEFAULT_THRESHOLD,
        });
      } else {
        // Inisialisasi default jika belum ada
        await setDoc(doc(db, STOCK_DOC), {
          current: 0,
          threshold: DEFAULT_THRESHOLD,
          updatedAt: serverTimestamp(),
        });
        callback({ current: 0, threshold: DEFAULT_THRESHOLD });
      }
    });
  },

  /**
   * Inisialisasi dokumen stok jika belum ada
   * Dipanggil sekali saat admin mount
   */
  initStock: async () => {
    const snap = await getDoc(doc(db, STOCK_DOC));
    if (!snap.exists()) {
      await setDoc(doc(db, STOCK_DOC), {
        current: 0,
        threshold: DEFAULT_THRESHOLD,
        updatedAt: serverTimestamp(),
      });
    }
  },
};
