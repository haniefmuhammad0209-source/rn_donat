/**
 * Service for sales report filtering, grouping, and exporting
 * Uses lazy imports for xlsx, jspdf to keep initial bundle small
 */

/**
 * Filter orders by date range (inclusive)
 * @param {Array} orders
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Array} filtered orders
 */
export function filterByDateRange(orders, startDate, endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return orders.filter((order) => {
    if (!order.createdAt) return false;
    const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    return orderDate >= start && orderDate <= end;
  });
}

/**
 * Filter orders by specific month and year
 * @param {Array} orders
 * @param {number} year
 * @param {number} month - 0-indexed (0 = January)
 * @returns {Array} filtered orders
 */
export function filterByMonth(orders, year, month) {
  return orders.filter((order) => {
    if (!order.createdAt) return false;
    const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    return orderDate.getFullYear() === year && orderDate.getMonth() === month;
  });
}

/**
 * Group orders by day
 * @param {Array} orders - already filtered orders
 * @returns {Array<{ date: string, count: number, revenue: number }>} sorted ascending by date
 */
export function groupByDay(orders) {
  const dayMap = {};

  orders.forEach((order) => {
    if (!order.createdAt) return;
    const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    const dateKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!dayMap[dateKey]) {
      dayMap[dateKey] = { date: dateKey, count: 0, revenue: 0 };
    }

    dayMap[dateKey].count++;
    // Revenue hanya dari paid/completed
    if (order.status === 'paid' || order.status === 'completed') {
      dayMap[dateKey].revenue += order.totalPrice || 0;
    }
  });

  // Convert to array and sort ascending by date
  const result = Object.values(dayMap);
  result.sort((a, b) => a.date.localeCompare(b.date));
  return result;
}

/**
 * Calculate total revenue from orders (paid/completed only)
 * @param {Array} orders
 * @returns {number} total revenue
 */
export function calculateRevenue(orders) {
  return orders.reduce((sum, order) => {
    if (order.status === 'paid' || order.status === 'completed') {
      return sum + (order.totalPrice || 0);
    }
    return sum;
  }, 0);
}

/**
 * Export data to Excel file
 * @param {Array<Object>} rows - array of objects with data
 * @param {string} filename - output filename without extension
 */
export async function exportToExcel(rows, filename) {
  // Lazy import xlsx
  const XLSX = await import('xlsx');

  // Convert rows to worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');

  // Trigger download
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export data to PDF file
 * @param {Array<Object>} rows - array of objects with data
 * @param {string} filename - output filename without extension
 */
export async function exportToPDF(rows, filename) {
  // Lazy import jspdf and jspdf-autotable
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text('Laporan Penjualan RN Donat', 14, 15);

  // Table
  const tableColumn = ['Tanggal', 'Jumlah Pesanan', 'Total Pendapatan'];
  const tableRows = rows.map((row) => [
    row.date || row.Tanggal || '',
    row.count || row['Jumlah Pesanan'] || 0,
    `Rp ${(row.revenue || row['Total Pendapatan'] || 0).toLocaleString('id-ID')}`,
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    theme: 'striped',
    headStyles: { fillColor: [139, 69, 19] }, // chocolate color
  });

  // Save
  doc.save(`${filename}.pdf`);
}
