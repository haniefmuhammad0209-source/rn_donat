/**
 * Pure calculation functions for dashboard statistics
 * No side effects, no Firebase imports - easy to test and memoize
 */

/**
 * Kalkulasi statistik hari ini
 * @param {Array} orders - daftar semua orders
 * @returns {{ todayRevenue: number, todayOrderCount: number }}
 */
export function calculateTodayStats(orders) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let todayRevenue = 0;
  let todayOrderCount = 0;

  orders.forEach((order) => {
    if (!order.createdAt) return;

    const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    
    if (orderDate >= today && orderDate < tomorrow) {
      todayOrderCount++;
      // Revenue hanya dari paid/completed
      if (order.status === 'paid' || order.status === 'completed') {
        todayRevenue += order.totalPrice || 0;
      }
    }
  });

  return { todayRevenue, todayOrderCount };
}

/**
 * Kalkulasi statistik bulan ini
 * @param {Array} orders - daftar semua orders
 * @returns {{ monthRevenue: number }}
 */
export function calculateMonthStats(orders) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let monthRevenue = 0;

  orders.forEach((order) => {
    if (!order.createdAt) return;

    const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    
    if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
      // Revenue hanya dari paid/completed
      if (order.status === 'paid' || order.status === 'completed') {
        monthRevenue += order.totalPrice || 0;
      }
    }
  });

  return { monthRevenue };
}

/**
 * Dapatkan produk terlaris berdasarkan total quantity
 * @param {Array} orders - daftar semua orders
 * @returns {string|null} - nama produk terlaris, atau null jika tidak ada
 */
export function getBestSellingProduct(orders) {
  const productCounts = {};

  orders.forEach((order) => {
    // Hanya hitung dari paid/completed
    if (order.status !== 'paid' && order.status !== 'completed') return;
    
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const name = item.name || item.productName || 'Unknown';
        const quantity = item.quantity || 0;
        productCounts[name] = (productCounts[name] || 0) + quantity;
      });
    }
  });

  // Find product dengan quantity tertinggi
  let bestProduct = null;
  let maxQuantity = 0;

  Object.entries(productCounts).forEach(([name, count]) => {
    if (count > maxQuantity) {
      maxQuantity = count;
      bestProduct = name;
    }
  });

  return bestProduct;
}

/**
 * Hitung jumlah pelanggan unik
 * @param {Array} orders - daftar semua orders
 * @returns {number} - jumlah customerPhone unik yang tidak null
 */
export function countUniqueCustomers(orders) {
  const uniquePhones = new Set();

  orders.forEach((order) => {
    if (order.customerPhone) {
      uniquePhones.add(order.customerPhone);
    }
  });

  return uniquePhones.size;
}
