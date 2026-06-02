// Format harga ke Rupiah
export const formatRupiah = (amount) =>
  `Rp ${amount.toLocaleString('id-ID')}`;

// Format timestamp Firestore ke string relatif
export const timeAgo = (timestamp) => {
  if (!timestamp) return 'Baru saja';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit yang lalu`;
  if (hours < 24) return `${hours} jam yang lalu`;
  if (days < 7) return `${days} hari yang lalu`;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

// Format nomor WA (08xx → 62xx)
export const formatWANumber = (number) =>
  number.startsWith('0') ? `62${number.slice(1)}` : number;
