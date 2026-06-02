/**
 * Pure utility functions for customer history.
 * No Firebase imports.
 */

/**
 * Convert a Firestore Timestamp, Date, or ISO string to a Date.
 * @param {*} value
 * @returns {Date|null}
 */
function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Build list of unique customers from orders, sorted descending by totalSpent.
 *
 * @param {Array} orders
 * @returns {Array<{ phone: string, name: string, orderCount: number, totalSpent: number, lastOrder: Date|null }>}
 */
export function computeCustomerList(orders) {
  const map = new Map();

  for (const o of orders) {
    if (!o.customerPhone) continue;
    const phone = o.customerPhone;

    if (!map.has(phone)) {
      map.set(phone, {
        phone,
        name: o.customerName || 'Pelanggan',
        orderCount: 0,
        totalSpent: 0,
        lastOrder: null,
      });
    }

    const c = map.get(phone);
    // Use most recent non-empty name
    if (o.customerName && o.customerName !== 'Pelanggan') {
      c.name = o.customerName;
    }
    c.orderCount++;
    c.totalSpent += o.totalPrice || 0;

    const orderDate = toDate(o.createdAt);
    if (orderDate && (!c.lastOrder || orderDate > c.lastOrder)) {
      c.lastOrder = orderDate;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

/**
 * Get order history for a specific customer phone number.
 *
 * @param {string} phone
 * @param {Array} orders
 * @returns {{
 *   orders: Array,
 *   orderCount: number,
 *   totalSpent: number,
 *   avgOrderValue: number,
 * }}
 */
export function getCustomerHistory(phone, orders) {
  const customerOrders = orders
    .filter((o) => o.customerPhone === phone)
    .slice()
    .sort((a, b) => {
      const da = toDate(a.createdAt);
      const db_ = toDate(b.createdAt);
      if (!da && !db_) return 0;
      if (!da) return 1;
      if (!db_) return -1;
      return db_ - da; // descending
    });

  const orderCount = customerOrders.length;
  const totalSpent = customerOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;

  return {
    orders: customerOrders,
    orderCount,
    totalSpent,
    avgOrderValue,
  };
}
