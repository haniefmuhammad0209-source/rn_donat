import {
  collection, addDoc, updateDoc, doc,
  setDoc, increment, serverTimestamp,
  query, orderBy, onSnapshot, where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { ORDER_STATUS, PAYMENT_METHOD } from '../utils/constants';

const COL = 'orders';

export const orderService = {
  // Buat order baru
  create: async ({ items, customerName, customerPhone, notes, paymentMethod, totalPrice, totalBoxes }) => {
    const status = paymentMethod === PAYMENT_METHOD.COD
      ? ORDER_STATUS.PENDING
      : ORDER_STATUS.WAITING_PAYMENT;

    const ref = await addDoc(collection(db, COL), {
      items,
      customerName,
      customerPhone,
      notes,
      paymentMethod,
      totalPrice,
      totalBoxes,
      status,
      paymentProof: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update stats counter
    await setDoc(doc(db, 'stats', 'orders'), {
      totalBoxes: increment(totalBoxes),
      totalOrders: increment(1),
    }, { merge: true });

    return ref.id;
  },

  // Update status order (admin)
  updateStatus: (id, status) =>
    updateDoc(doc(db, COL, id), {
      status,
      updatedAt: serverTimestamp(),
    }),

  // Upload bukti bayar (customer)
  uploadPaymentProof: (id, proofUrl) =>
    updateDoc(doc(db, COL, id), {
      paymentProof: proofUrl,
      status: ORDER_STATUS.PAID,
      updatedAt: serverTimestamp(),
    }),

  // Subscribe semua orders (admin)
  subscribeAll: (callback) => {
    const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  },

  // Subscribe orders by status (admin)
  subscribeByStatus: (status, callback) => {
    const q = query(
      collection(db, COL),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  },

  // Subscribe stats
  subscribeStats: (callback) => {
    return onSnapshot(doc(db, 'stats', 'orders'), (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        setDoc(doc(db, 'stats', 'orders'), { totalBoxes: 500, totalOrders: 0 });
        callback({ totalBoxes: 500, totalOrders: 0 });
      }
    });
  },
};
