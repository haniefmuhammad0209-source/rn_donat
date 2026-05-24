import {
  collection, addDoc, deleteDoc, doc,
  query, orderBy, limit, startAfter,
  getDocs, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'testimonials';
const PAGE_SIZE = 4;

export const testimoniService = {
  // Real-time listener untuk halaman pertama
  subscribeFirstPage: (callback, onError) => {
    const q = query(
      collection(db, COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE)
    );
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(data, snap.docs[snap.docs.length - 1] ?? null, snap.docs.length === PAGE_SIZE);
    }, onError);
  },

  // Load more (pagination)
  loadMore: async (lastDoc) => {
    const q = query(
      collection(db, COLLECTION),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );
    const snap = await getDocs(q);
    return {
      data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
      lastDoc: snap.docs[snap.docs.length - 1] ?? null,
      hasMore: snap.docs.length === PAGE_SIZE,
    };
  },

  // Tambah testimoni baru
  add: (user, { text, rating }) =>
    addDoc(collection(db, COLLECTION), {
      name: user.displayName || 'Pengguna Google',
      avatar: user.photoURL || null,
      uid: user.uid,
      text: text.trim(),
      rating,
      createdAt: serverTimestamp(),
    }),

  // Hapus testimoni (admin only)
  delete: (id) => deleteDoc(doc(db, COLLECTION, id)),
};
