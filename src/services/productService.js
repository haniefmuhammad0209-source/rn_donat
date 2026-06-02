import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, orderBy, query, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'products';

export const productService = {
  // Real-time listener semua produk
  subscribeAll: (callback, onError) => {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, onError);
  },

  // Tambah produk baru
  add: (data) =>
    addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),

  // Update produk
  update: (id, data) =>
    updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: serverTimestamp(),
    }),

  // Hapus produk
  delete: (id) => deleteDoc(doc(db, COLLECTION, id)),
};
