import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX } from 'react-icons/fi';

const PushNotification = () => {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // Cek apakah browser support notifikasi
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    setPermission(Notification.permission);

    // Tampilkan prompt setelah 30 detik, hanya jika belum pernah diminta
    if (Notification.permission === 'default') {
      const shown = localStorage.getItem('rn_donat_notif_asked');
      if (!shown) {
        const timer = setTimeout(() => setShow(true), 30000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAllow = async () => {
    localStorage.setItem('rn_donat_notif_asked', 'true');
    setShow(false);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        // Kirim notifikasi selamat datang
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification('RN Donat 🍩', {
          body: 'Notifikasi aktif! Kamu akan dapat info promo terbaru dari RN Donat.',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
        });
      }
    } catch (err) {
      console.error('Notifikasi gagal:', err);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('rn_donat_notif_asked', 'true');
    setShow(false);
  };

  if (permission !== 'default') return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-chocolate to-dark-chocolate p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white">
              <FiBell className="w-5 h-5" />
              <span className="font-semibold text-sm">Aktifkan Notifikasi</span>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <FiX className="w-3 h-3 text-white" />
            </button>
          </div>
          <div className="p-4">
            <p className="text-gray-600 text-sm mb-4">
              Aktifkan notifikasi untuk dapat info <strong>promo terbaru</strong> dan pengingat pesanan dari RN Donat 🍩
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2 rounded-full border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Nanti saja
              </button>
              <button
                onClick={handleAllow}
                className="flex-1 py-2 rounded-full bg-chocolate text-white text-sm font-medium hover:bg-dark-chocolate transition-colors"
              >
                Aktifkan
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PushNotification;
