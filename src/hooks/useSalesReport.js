import { useState, useMemo } from 'react';
import { filterByDateRange, filterByMonth, groupByDay, calculateRevenue } from '../services/reportService';

/**
 * State management hook for the sales report tab.
 *
 * @param {Array} orders - all orders from Firestore
 * @returns {{
 *   rows: Array,
 *   totalRevenue: number,
 *   totalOrders: number,
 *   filterMode: 'range'|'month',
 *   setFilterMode: function,
 *   startDate: string,
 *   setStartDate: function,
 *   endDate: string,
 *   setEndDate: function,
 *   selectedMonth: string,
 *   setSelectedMonth: function,
 * }}
 */
const useSalesReport = (orders) => {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayStr = now.toISOString().slice(0, 10);

  const [filterMode, setFilterMode] = useState('month');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  const rows = useMemo(() => {
    let filtered;
    if (filterMode === 'range') {
      filtered = filterByDateRange(orders, new Date(startDate), new Date(endDate));
    } else {
      const [year, month] = selectedMonth.split('-').map(Number);
      filtered = filterByMonth(orders, year, month - 1); // month is 1-indexed in input
    }
    return groupByDay(filtered);
  }, [orders, filterMode, startDate, endDate, selectedMonth]);

  const totalRevenue = useMemo(() => calculateRevenue(
    filterMode === 'range'
      ? filterByDateRange(orders, new Date(startDate), new Date(endDate))
      : (() => {
          const [year, month] = selectedMonth.split('-').map(Number);
          return filterByMonth(orders, year, month - 1);
        })()
  ), [orders, filterMode, startDate, endDate, selectedMonth]);

  const totalOrders = rows.reduce((sum, r) => sum + r.count, 0);

  return {
    rows,
    totalRevenue,
    totalOrders,
    filterMode,
    setFilterMode,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedMonth,
    setSelectedMonth,
  };
};

export default useSalesReport;
