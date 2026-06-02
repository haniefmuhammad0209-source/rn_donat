import { WA_NUMBER } from './constants';
import { formatRupiah } from './format';
import { PICKUP_SCHEDULE_LABEL } from './constants';

const STATUS_MESSAGE = {
  confirmed: (order) =>
    `✅ *Pesanan Dikonfirmasi!*\n\nHalo kak, pesanan kamu sudah kami terima dan dikonfirmasi.\n\n📦 Total: ${order.totalBoxes} kotak\n💰 Total Harga: ${formatRupiah(order.totalPrice)}\n\nTerima kasih sudah order di RN Donat! 🍩`,

  processing: (order) =>
    `👨‍🍳 *Pesanan Sedang Diproses!*\n\nHalo kak, donat kamu sedang kami buat dengan penuh cinta.\n\n📦 Total: ${order.totalBoxes} kotak\n\nSabar ya kak, sebentar lagi siap! 🍩`,

  completed: (order) =>
    `🎉 *Pesanan Selesai!*\n\nHalo kak, pesanan kamu sudah siap!\n\n📦 Total: ${order.totalBoxes} kotak\n💰 Total: ${formatRupiah(order.totalPrice)}\n\nTerima kasih sudah order di RN Donat! Jangan lupa kasih testimoni ya kak 😊`,

  cancelled: (order) =>
    `❌ *Pesanan Dibatalkan*\n\nHalo kak, mohon maaf pesanan kamu terpaksa dibatalkan.\n\nSilakan hubungi kami untuk informasi lebih lanjut.`,

  paid: (order) =>
    `💳 *Pembayaran Diterima!*\n\nHalo kak, pembayaran kamu sudah kami terima.\n\n💰 Total: ${formatRupiah(order.totalPrice)}\n${order.paymentMethod === 'cod' ? '💵 Metode: Bayar Langsung (COD)' : '📱 Metode: QRIS'}\n\nPesanan kamu akan segera kami proses! 🍩`,
};

/**
 * Buka WA ke nomor customer dengan pesan notifikasi status
 * Dipanggil dari admin panel saat update status order
 */
export const sendStatusNotification = (order, newStatus) => {
  if (!order.customerPhone) return;
  const messageFn = STATUS_MESSAGE[newStatus];
  if (!messageFn) return;

  const message = encodeURIComponent(messageFn(order));
  const phone = order.customerPhone.replace(/\D/g, '');
  const formattedPhone = phone.startsWith('0') ? `62${phone.slice(1)}` : phone;

  window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
};

/**
 * Format pickup schedule ke string human-readable
 * @param {object|null|undefined} pickupSchedule
 * @returns {string}
 */
export const formatPickupSchedule = (pickupSchedule) => {
  if (!pickupSchedule) return '';
  const { type, time } = pickupSchedule;
  if (type === 'now') return '🕐 Jadwal Ambil: Sekarang';
  if (type === 'today') return `🕐 Jadwal Ambil: Hari Ini pukul ${time || '?'}`;
  if (type === 'tomorrow') return `🕐 Jadwal Ambil: Besok pukul ${time || '?'}`;
  return '';
};

/**
 * Buka WA ke nomor admin (WA_NUMBER) dengan detail order baru
 * Dipanggil saat ada order baru masuk
 */
export const sendAdminNotification = (order) => {
  const itemLines = (order.items || []).map((item) => {
    const toppingText = typeof item.toppings === 'string'
      ? item.toppings
      : Object.entries(item.toppings || {})
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `${v} ${k}`)
          .join(', ') || 'Mix';
    return `• ${item.productName || item.product?.name || 'Produk'} x${item.quantity} kotak — Topping: ${toppingText}`;
  }).join('\n');

  const payLabel = order.paymentMethod === 'cod' ? '💵 Bayar Langsung (COD)' : '📱 QRIS';
  const pickupLine = order.pickupSchedule ? `\n${formatPickupSchedule(order.pickupSchedule)}` : '';

  const message = encodeURIComponent(
    `🔔 *Pesanan Baru!*\n\n` +
    `👤 Pelanggan: ${order.customerName || 'Tidak diketahui'}\n` +
    `📞 HP: ${order.customerPhone || '-'}\n\n` +
    `📦 Pesanan:\n${itemLines}\n\n` +
    `💰 Total Harga: ${formatRupiah(order.totalPrice || 0)}\n` +
    `💳 Metode Bayar: ${payLabel}` +
    `${pickupLine}`
  );

  window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank');
};
