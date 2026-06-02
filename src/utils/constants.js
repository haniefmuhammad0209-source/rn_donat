export const WA_NUMBER = '6282391869544';
export const DONAT_PER_BOX = 6;
export const MAX_ORDER_BOXES = 20;
export const PRICE_PER_BOX = 15000;

export const STORE_SCHEDULE = {
  weekday: { open: 8, close: 20 },
  weekend: { open: 8, close: 21 },
};

export const TOPPINGS = ['Meses', 'Oreo', 'Kacang', 'Keju'];
export const TOPPING_EMOJI = {
  Meses: '🍫',
  Oreo: '🍪',
  Kacang: '🥜',
  Keju: '🧀',
};

// Single source of truth untuk admin UIDs
export const ADMIN_UIDS = [
  'QHS8fA0mGEYV4aayfJ0DFVVRshT2',
  'QHS0fA0mGEYV4aayfJ0DFVVRshT2',
];

// Order status
export const ORDER_STATUS = {
  PENDING: 'pending',
  WAITING_PAYMENT: 'waiting_payment',
  PAID: 'paid',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABEL = {
  pending: 'Menunggu',
  waiting_payment: 'Menunggu Pembayaran',
  paid: 'Sudah Dibayar',
  processing: 'Diproses',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

export const ORDER_STATUS_COLOR = {
  pending: 'bg-yellow-100 text-yellow-700',
  waiting_payment: 'bg-orange-100 text-orange-700',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

// Payment methods
export const PAYMENT_METHOD = {
  QRIS: 'qris',
  COD: 'cod',
};

export const PAYMENT_METHOD_LABEL = {
  qris: 'QRIS',
  cod: 'Bayar Langsung',
};

// Pickup schedule types
export const PICKUP_SCHEDULE_TYPES = {
  NOW: 'now',
  TODAY: 'today',
  TOMORROW: 'tomorrow',
};

export const PICKUP_SCHEDULE_LABEL = {
  now: 'Ambil Sekarang',
  today: 'Ambil Hari Ini',
  tomorrow: 'Ambil Besok',
};
