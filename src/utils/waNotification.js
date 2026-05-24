import { WA_NUMBER, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from './constants';
import { formatRupiah } from './format';

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
    `💳 *Pembayaran Diterima!*\n\nHalo kak, pembayaran kamu sudah kami terima.\n\n💰 Total: ${formatRupiah(order.totalPrice)}\n\nPesanan kamu akan segera kami proses! 🍩`,
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
