/**
 * Report service for sales analytics and export.
 * xlsx and jspdf are lazy-imported only when export is triggered.
 */

const PAID_STATUSES = ['paid', 'completed'];

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
 * Filter orders by inclusive date range.
 * @param {Array} orders
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Array}
 */
export function filterByDateRange(orders, startDate, endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return orders.filter((o) => {
    const d = toDate(o.createdAt);
    if (!d) return false;
    return d >= start && d <= end;
  });
}

/**
 * Filter orders by month and year.
 * @param {Array} orders
 * @param {number} year
 * @param {number} month - 0-indexed
 * @returns {Array}
 */
export function filterByMonth(orders, year, month) {
  return orders.filter((o) => {
    const d = toDate(o.createdAt);
    if (!d) return false;
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

/**
 * Group orders by calendar day, sorted ascending.
 * Revenue only from paid/completed orders.
 * @param {Array} orders
 * @returns {Array<{ date: string, count: number, revenue: number }>}
 */
export function groupByDay(orders) {
  const map = new Map();

  for (const o of orders) {
    const d = toDate(o.createdAt);
    if (!d) continue;
    // Use YYYY-MM-DD as key
    const key = d.toISOString().slice(0, 10);
    if (!map.has(key)) {
      map.set(key, { date: key, count: 0, revenue: 0 });
    }
    const entry = map.get(key);
    entry.count++;
    if (PAID_STATUSES.includes(o.status)) {
      entry.revenue += o.totalPrice || 0;
    }
  }

  // Sort ascending by date
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate total revenue from paid/completed orders.
 * @param {Array} orders
 * @returns {number}
 */
export function calculateRevenue(orders) {
  return orders
    .filter((o) => PAID_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
}

/**
 * Export rows to Excel (.xlsx) using lazy import.
 * @param {Array<{ date: string, count: number, revenue: number }>} rows
 * @param {string} filename - without extension
 */
export async function exportToExcel(rows, filename) {
  const XLSX = await import('xlsx');
  const ws_data = [
    ['Tanggal', 'Jumlah Pesanan', 'Total Pendapatan (Rp)'],
    ...rows.map((r) => [r.date, r.count, r.revenue]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export rows to PDF using lazy import.
 * @param {Array<{ date: string, count: number, revenue: number }>} rows
 * @param {string} filename - without extension
 */
export async function exportToPDF(rows, filename) {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('Laporan Penjualan — RN Donat', 14, 16);

  doc.autoTable({
    startY: 24,
    head: [['Tanggal', 'Jumlah Pesanan', 'Total Pendapatan (Rp)']],
    body: rows.map((r) => [r.date, r.count, r.revenue.toLocaleString('id-ID')]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [139, 69, 19] }, // chocolate color
  });

  doc.save(`${filename}.pdf`);
}

export const reportService = {
  filterByDateRange,
  filterByMonth,
  groupByDay,
  calculateRevenue,
  exportToExcel,
  exportToPDF,
};
