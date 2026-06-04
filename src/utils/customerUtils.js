/**
 * Pure functions for customer list and history computation
 * No side effects - easy to test and memoize
 */

/**
 * Compute daftar pelanggan unik dengan statistik
 * @param {Array} orders - daftar semua orders
 * @returns {Array<{ phone: string, name: string, orderCount: number, totalSpent: number, lastOrder: Date }>}
 *          - diurutkan descending by totalSpent
 */
export function computeCustomerList(orders) {
  const customerMap = {};

  orders.forEach((order) => {
    const phone = order.customerPhone;
    if (!phone) return;

    const name = order.customerName || 'Unknown';
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt || Date.now());
    const price = order.totalPrice || 0;

    if (!customerMap[phone]) {
      customerMap[phone] = {
        phone,
        name,
        orderCount: 0,
        totalSpent: 0,
        lastOrder: orderDate,
      };
    }

    customerMap[phone].orderCount++;
    customerMap[phone].totalSpent += price;
    
    // Update last order jika lebih baru
    if (orderDate > customerMap[phone].lastOrder) {
      customerMap[phone].lastOrder = orderDate;
    }
    
    // Update nama jika berbeda (ambil yang terbaru)
    if (orderDate >= customerMap[phone].lastOrder) {
      customerMap[phone].name = name;
    }
  });

  // Convert ke array dan sort descending by totalSpent
  const customerList = Object.values(customerMap);
  customerList.sort((a, b) => b.totalSpent - a.totalSpent);

  return customerList;
}

/**
 * Dapatkan riwayat order untuk satu pelanggan
 * @param {string} phone - nomor telepon pelanggan
 * @param {Array} orders - daftar semua orders
 * @returns {{ orders: Array, orderCount: number, totalSpent: number, avgOrderValue: number }}
 *          - orders diurutkan descending by createdAt
 */
export function getCustomerHistory(phone, orders) {
  if (!phone) {
    return {
      orders: [],
      orderCount: 0,
      totalSpent: 0,
      avgOrderValue: 0,
    };
  }

  // Filter orders untuk pelanggan ini
  const customerOrders = orders.filter((order) => order.customerPhone === phone);

  // Sort descending by createdAt
  customerOrders.sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
    return dateB - dateA; // descending
  });

  // Compute statistics
  const orderCount = customerOrders.length;
  const totalSpent = customerOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;

  return {
    orders: customerOrders,
    orderCount,
    totalSpent,
    avgOrderValue,
  };
}
