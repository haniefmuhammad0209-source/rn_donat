/**
 * Pure utility functions for admin dashboard statistics.
 * No Firebase imports — all functions are pure.
 */

const PAID_STATUSES = ['paid', 'completed'];

/**
 * Get a Date object from a Firestore Timestamp or Date or ISO string.
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
 * Calculate today's stats from orders array.
 * @param {Array} orders
 * @returns {{ todayRevenue: number, todayOrderCount: number }}
 */
export function calculateTodayStats(orders) {
  const now = new Date();
  const todayStr = now.toDateString();
  let todayRevenue = 0;
  let todayOrderCount = 0;

  for (const o of orders) {
    const d = toDate(o.createdAt);
    if (!d) continue;
    if (d.toDateString() === todayStr) {
      todayOrderCount++;
      if (PAID_STATUSES.includes(o.status)) {
        todayRevenue += o.totalPrice || 0;
      }
    }
  }

  return { todayRevenue, todayOrderCount };
}

/**
 * Calculate this month's revenue from orders array.
 * @param {Array} orders
 * @returns {{ monthRevenue: number }}
 */
export function calculateMonthStats(orders) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  let monthRevenue = 0;

  for (const o of orders) {
    const d = toDate(o.createdAt);
    if (!d) continue;
    if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
      if (PAID_STATUSES.includes(o.status)) {
        monthRevenue += o.totalPrice || 0;
      }
    }
  }

  return { monthRevenue };
}

/**
 * Get the best selling product name from orders.
 * Only considers paid/completed orders.
 * @param {Array} orders
 * @returns {string|null}
 */
export function getBestSellingProduct(orders) {
  const tally = new Map();

  for (const o of orders) {
    if (!PAID_STATUSES.includes(o.status)) continue;
    for (const item of (o.items || [])) {
      const name = item.productName || item.product?.name || '';
      if (!name) continue;
      tally.set(name, (tally.get(name) || 0) + (item.quantity || 1));
    }
  }

  if (tally.size === 0) return null;

  let best = null;
  let bestQty = 0;
  for (const [name, qty] of tally) {
    if (qty > bestQty) {
      bestQty = qty;
      best = name;
    }
  }
  return best;
}

/**
 * Count unique customers by phone number.
 * @param {Array} orders
 * @returns {number}
 */
export function countUniqueCustomers(orders) {
  const phones = new Set();
  for (const o of orders) {
    if (o.customerPhone) phones.add(o.customerPhone);
  }
  return phones.size;
}
