import {
  collection, addDoc, updateDoc, doc, getDoc,
  setDoc, increment, serverTimestamp,
  query, orderBy, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { ORDER_STATUS, PAYMENT_METHOD, DONAT_PER_BOX } from '../utils/constants';
import { stockService } from './stockService';

const COL = 'orders';

export const orderService = {
  // Buat order baru
  create: async ({ items, customerName, customerPhone, notes, paymentMethod, totalPrice, totalBoxes, pickupSchedule }) => {
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
      pickupSchedule: pickupSchedule || null,
      status,
      paymentProof: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Kurangi stok donat polos secara fire-and-forget
    stockService.reduceStock(totalBoxes * DONAT_PER_BOX).catch(err =>
      console.error('[Stock] Gagal mengurangi stok:', err)
    );

    return ref.id;
  },

  // Update status order (admin) + update stats saat paid
  updateStatus: async (id, status) => {
    const updateData = {
      status,
      updatedAt: serverTimestamp(),
    };
    // Catat timestamp kapan uang diterima
    if (status === 'paid') {
      updateData.paidAt = serverTimestamp();
    }

    // Ambil data order SEBELUM update untuk cek apakah sudah pernah paid
    // (cegah double-count jika admin klik paid dua kali)
    if (status === 'paid') {
      const orderSnap = await getDoc(doc(db, COL, id));
      if (orderSnap.exists() && orderSnap.data().status !== 'paid') {
        const data = orderSnap.data();
        await updateDoc(doc(db, COL, id), updateData);
        await setDoc(doc(db, 'stats', 'orders'), {
          totalBoxes: increment(data.totalBoxes || 0),
          totalOrders: increment(1),
          totalRevenue: increment(data.totalPrice || 0),
        }, { merge: true });
        return;
      }
    }

    await updateDoc(doc(db, COL, id), updateData);
  },

  // Tandai lunas — shortcut untuk COD: langsung set status paid
  markAsPaid: async (id) => {
    return orderService.updateStatus(id, 'paid');
  },

  // Subscribe semua orders (admin)
  subscribeAll: (callback) => {
    const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
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
        // Inisialisasi hanya sekali, di luar listener
        callback({ totalBoxes: 500, totalOrders: 0 });
      }
    });
  },

  // Inisialisasi stats jika belum ada (panggil sekali saat app start)
  initStats: () =>
    setDoc(doc(db, 'stats', 'orders'), { totalBoxes: 500, totalOrders: 0 }, { merge: true }),
};
