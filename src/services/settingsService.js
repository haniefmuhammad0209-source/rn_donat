import {
  doc, getDoc, setDoc, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

const SETTINGS_DOC = 'settings/store';

const DEFAULT_SETTINGS = {
  isOpen: true,
  openOverride: false, // true = paksa buka, false = ikut jadwal
  announcement: '',
  weekdayOpen: 8,
  weekdayClose: 20,
  weekendOpen: 8,
  weekendClose: 21,
};

export const settingsService = {
  // Real-time listener settings
  subscribe: (callback) =>
    onSnapshot(doc(db, 'settings', 'store'), (snap) => {
      callback(snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.data() } : DEFAULT_SETTINGS);
    }),

  // Update settings
  update: (data) =>
    setDoc(doc(db, 'settings', 'store'), data, { merge: true }),

  // Toggle buka/tutup manual
  toggleStore: async (isOpen) =>
    setDoc(doc(db, 'settings', 'store'), { openOverride: true, isOpen }, { merge: true }),
};
