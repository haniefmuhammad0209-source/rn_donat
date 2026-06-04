import { useState, useMemo } from 'react';
import { filterByDateRange, filterByMonth, groupByDay, calculateRevenue } from '../services/reportService';

/**
 * Hook untuk sales report dengan filter dan kalkulasi
 * @param {Array} orders - daftar semua orders
 * @returns {{ filterMode, setFilterMode, startDate, setStartDate, endDate, setEndDate, selectedMonth, setSelectedMonth, rows, totalRevenue, totalOrders }}
 */
export const useSalesReport = (orders) => {
  const [filterMode, setFilterMode] = useState('range'); // 'range' | 'month'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(''); // format "YYYY-MM"

  // Filter orders based on mode
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    if (filterMode === 'range' && startDate && endDate) {
      return filterByDateRange(orders, new Date(startDate), new Date(endDate));
    }

    if (filterMode === 'month' && selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      return filterByMonth(orders, parseInt(year, 10), parseInt(month, 10) - 1);
    }

    return [];
  }, [orders, filterMode, startDate, endDate, selectedMonth]);

  // Group by day
  const rows = useMemo(() => {
    return groupByDay(filteredOrders);
  }, [filteredOrders]);

  // Calculate totals
  const totalRevenue = useMemo(() => {
    return calculateRevenue(filteredOrders);
  }, [filteredOrders]);

  const totalOrders = filteredOrders.length;

  return {
    filterMode,
    setFilterMode,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedMonth,
    setSelectedMonth,
    rows,
    totalRevenue,
    totalOrders,
  };
};
