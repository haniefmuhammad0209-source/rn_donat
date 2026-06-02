/**
 * Unit tests for statsUtils.js
 * Validates Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateTodayStats,
  calculateMonthStats,
  getBestSellingProduct,
  countUniqueCustomers,
} from '../statsUtils';

describe('statsUtils', () => {
  let mockOrders;
  let today;
  let yesterday;
  let lastMonth;
  let tomorrow;

  beforeEach(() => {
    // Mock current date to be deterministic
    today = new Date('2024-01-15T10:00:00Z');
    yesterday = new Date('2024-01-14T10:00:00Z');
    lastMonth = new Date('2023-12-15T10:00:00Z');
    tomorrow = new Date('2024-01-16T10:00:00Z');

    vi.useFakeTimers();
    vi.setSystemTime(today);

    // Create mock orders
    mockOrders = [
      {
        id: '1',
        customerPhone: '081234567890',
        customerName: 'Customer 1',
        totalPrice: 50000,
        status: 'paid',
        createdAt: today,
        items: [
          { productName: 'Donat Meses', quantity: 2 },
          { productName: 'Donat Oreo', quantity: 1 },
        ],
      },
      {
        id: '2',
        customerPhone: '081234567891',
        customerName: 'Customer 2',
        totalPrice: 30000,
        status: 'completed',
        createdAt: today,
        items: [
          { productName: 'Donat Meses', quantity: 1 },
        ],
      },
      {
        id: '3',
        customerPhone: '081234567890', // Same customer as order 1
        customerName: 'Customer 1',
        totalPrice: 45000,
        status: 'pending',
        createdAt: today,
        items: [
          { productName: 'Donat Keju', quantity: 3 },
        ],
      },
      {
        id: '4',
        customerPhone: '081234567892',
        customerName: 'Customer 3',
        totalPrice: 60000,
        status: 'paid',
        createdAt: yesterday,
        items: [
          { productName: 'Donat Oreo', quantity: 4 },
        ],
      },
      {
        id: '5',
        customerPhone: '081234567893',
        customerName: 'Customer 4',
        totalPrice: 25000,
        status: 'completed',
        createdAt: lastMonth,
        items: [
          { productName: 'Donat Meses', quantity: 1 },
        ],
      },
    ];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateTodayStats', () => {
    it('should calculate today revenue only from paid/completed orders', () => {
      const result = calculateTodayStats(mockOrders);
      
      // Order 1: 50000 (paid, today)
      // Order 2: 30000 (completed, today)
      // Order 3: 45000 (pending, today) - should NOT be counted in revenue
      expect(result.todayRevenue).toBe(80000);
    });

    it('should count all orders created today regardless of status', () => {
      const result = calculateTodayStats(mockOrders);
      
      // Orders 1, 2, 3 are created today
      expect(result.todayOrderCount).toBe(3);
    });

    it('should return zero for empty orders array', () => {
      const result = calculateTodayStats([]);
      expect(result.todayRevenue).toBe(0);
      expect(result.todayOrderCount).toBe(0);
    });

    it('should handle orders with missing or invalid createdAt', () => {
      const ordersWithInvalid = [
        { ...mockOrders[0], createdAt: null },
        { ...mockOrders[1], createdAt: undefined },
        { ...mockOrders[2], createdAt: 'invalid-date' },
      ];
      
      const result = calculateTodayStats(ordersWithInvalid);
      expect(result.todayRevenue).toBe(0);
      expect(result.todayOrderCount).toBe(0);
    });

    it('should handle Firestore Timestamp objects', () => {
      const firestoreTimestamp = {
        toDate: () => today,
      };
      
      const ordersWithTimestamp = [
        { ...mockOrders[0], createdAt: firestoreTimestamp },
      ];
      
      const result = calculateTodayStats(ordersWithTimestamp);
      expect(result.todayRevenue).toBe(50000);
      expect(result.todayOrderCount).toBe(1);
    });

    it('should not count orders from yesterday or tomorrow', () => {
      const mixedOrders = [
        { ...mockOrders[0], createdAt: yesterday },
        { ...mockOrders[1], createdAt: today },
        { ...mockOrders[2], createdAt: tomorrow },
      ];
      
      const result = calculateTodayStats(mixedOrders);
      expect(result.todayOrderCount).toBe(1); // Only today's order
    });
  });

  describe('calculateMonthStats', () => {
    it('should calculate month revenue only from paid/completed orders', () => {
      const result = calculateMonthStats(mockOrders);
      
      // Order 1: 50000 (paid, Jan 2024)
      // Order 2: 30000 (completed, Jan 2024)
      // Order 3: 45000 (pending, Jan 2024) - should NOT be counted
      // Order 4: 60000 (paid, Jan 2024 but yesterday)
      // Order 5: 25000 (completed, Dec 2023) - should NOT be counted
      expect(result.monthRevenue).toBe(140000);
    });

    it('should return zero for empty orders array', () => {
      const result = calculateMonthStats([]);
      expect(result.monthRevenue).toBe(0);
    });

    it('should only include orders from current month and year', () => {
      const result = calculateMonthStats(mockOrders);
      
      // Order 5 is from December 2023, should not be counted
      // All January 2024 paid/completed orders should be counted
      expect(result.monthRevenue).toBe(140000);
    });

    it('should handle missing totalPrice', () => {
      const ordersWithoutPrice = [
        { ...mockOrders[0], totalPrice: undefined, status: 'paid', createdAt: today },
      ];
      
      const result = calculateMonthStats(ordersWithoutPrice);
      expect(result.monthRevenue).toBe(0);
    });

    it('should handle Firestore Timestamp objects', () => {
      const firestoreTimestamp = {
        toDate: () => today,
      };
      
      const ordersWithTimestamp = [
        { ...mockOrders[0], createdAt: firestoreTimestamp },
      ];
      
      const result = calculateMonthStats(ordersWithTimestamp);
      expect(result.monthRevenue).toBe(50000);
    });
  });

  describe('getBestSellingProduct', () => {
    it('should return product with highest total quantity from paid/completed orders', () => {
      const result = getBestSellingProduct(mockOrders);
      
      // Donat Meses: 2 (order 1, paid) + 1 (order 2, completed) + 1 (order 5, completed) = 4
      // Donat Oreo: 1 (order 1, paid) + 4 (order 4, paid) = 5
      // Donat Keju: 3 (order 3, pending) - should NOT be counted
      expect(result).toBe('Donat Oreo');
    });

    it('should return null for empty orders array', () => {
      const result = getBestSellingProduct([]);
      expect(result).toBe(null);
    });

    it('should return null when no paid/completed orders exist', () => {
      const pendingOrders = [
        { ...mockOrders[2], status: 'pending' },
        { ...mockOrders[2], status: 'cancelled' },
      ];
      
      const result = getBestSellingProduct(pendingOrders);
      expect(result).toBe(null);
    });

    it('should handle orders with empty items array', () => {
      const ordersWithEmptyItems = [
        { ...mockOrders[0], items: [] },
        { ...mockOrders[1], items: undefined },
      ];
      
      const result = getBestSellingProduct(ordersWithEmptyItems);
      expect(result).toBe(null);
    });

    it('should handle items with product.name structure', () => {
      const ordersWithNestedName = [
        {
          ...mockOrders[0],
          items: [
            { product: { name: 'Donat Test' }, quantity: 5 },
          ],
        },
      ];
      
      const result = getBestSellingProduct(ordersWithNestedName);
      expect(result).toBe('Donat Test');
    });

    it('should default quantity to 1 if not specified', () => {
      const ordersWithoutQuantity = [
        {
          status: 'paid',
          items: [
            { productName: 'Donat A' },
            { productName: 'Donat A' },
            { productName: 'Donat B' },
          ],
        },
      ];
      
      const result = getBestSellingProduct(ordersWithoutQuantity);
      expect(result).toBe('Donat A'); // 2 items vs 1 item
    });

    it('should handle tie by returning first encountered product', () => {
      const ordersWithTie = [
        {
          status: 'paid',
          items: [
            { productName: 'Donat A', quantity: 2 },
            { productName: 'Donat B', quantity: 2 },
          ],
        },
      ];
      
      const result = getBestSellingProduct(ordersWithTie);
      expect(result).toBe('Donat A');
    });
  });

  describe('countUniqueCustomers', () => {
    it('should count unique customer phone numbers', () => {
      const result = countUniqueCustomers(mockOrders);
      
      // Unique phones: 081234567890, 081234567891, 081234567892, 081234567893
      expect(result).toBe(4);
    });

    it('should return zero for empty orders array', () => {
      const result = countUniqueCustomers([]);
      expect(result).toBe(0);
    });

    it('should ignore orders with null or undefined customerPhone', () => {
      const ordersWithNullPhone = [
        { ...mockOrders[0], customerPhone: null },
        { ...mockOrders[1], customerPhone: undefined },
        { ...mockOrders[2], customerPhone: '081234567890' },
      ];
      
      const result = countUniqueCustomers(ordersWithNullPhone);
      expect(result).toBe(1);
    });

    it('should handle duplicate phone numbers', () => {
      const ordersWithDuplicates = [
        { customerPhone: '081234567890' },
        { customerPhone: '081234567890' },
        { customerPhone: '081234567890' },
        { customerPhone: '081234567891' },
      ];
      
      const result = countUniqueCustomers(ordersWithDuplicates);
      expect(result).toBe(2);
    });

    it('should handle empty string phone numbers', () => {
      const ordersWithEmptyPhone = [
        { customerPhone: '' },
        { customerPhone: '081234567890' },
      ];
      
      const result = countUniqueCustomers(ordersWithEmptyPhone);
      expect(result).toBe(1); // Empty string is falsy, won't be counted
    });
  });

  describe('Integration - Real-world scenario', () => {
    it('should handle a realistic day of orders', () => {
      const realisticOrders = [
        // Morning orders
        { customerPhone: '081111111111', totalPrice: 75000, status: 'paid', createdAt: new Date('2024-01-15T08:00:00Z'), items: [{ productName: 'Donat Meses', quantity: 5 }] },
        { customerPhone: '081222222222', totalPrice: 45000, status: 'completed', createdAt: new Date('2024-01-15T09:30:00Z'), items: [{ productName: 'Donat Oreo', quantity: 3 }] },
        
        // Noon orders
        { customerPhone: '081111111111', totalPrice: 30000, status: 'paid', createdAt: new Date('2024-01-15T12:00:00Z'), items: [{ productName: 'Donat Meses', quantity: 2 }] },
        { customerPhone: '081333333333', totalPrice: 60000, status: 'pending', createdAt: new Date('2024-01-15T13:00:00Z'), items: [{ productName: 'Donat Keju', quantity: 4 }] },
        
        // Evening orders
        { customerPhone: '081444444444', totalPrice: 90000, status: 'completed', createdAt: new Date('2024-01-15T18:00:00Z'), items: [{ productName: 'Donat Oreo', quantity: 6 }] },
        
        // Yesterday's order (should not affect today stats)
        { customerPhone: '081555555555', totalPrice: 100000, status: 'paid', createdAt: yesterday, items: [{ productName: 'Donat Kacang', quantity: 10 }] },
      ];

      const todayStats = calculateTodayStats(realisticOrders);
      const monthStats = calculateMonthStats(realisticOrders);
      const bestProduct = getBestSellingProduct(realisticOrders);
      const uniqueCustomers = countUniqueCustomers(realisticOrders);

      // Today revenue: 75000 + 45000 + 30000 + 90000 = 240000 (pending not counted)
      expect(todayStats.todayRevenue).toBe(240000);
      
      // Today orders: 5 orders today (including pending)
      expect(todayStats.todayOrderCount).toBe(5);
      
      // Month revenue includes yesterday: 240000 + 100000 = 340000
      expect(monthStats.monthRevenue).toBe(340000);
      
      // Best selling: Donat Oreo (3 + 6 = 9) > Donat Meses (5 + 2 = 7) > Donat Kacang (10 but from paid order)
      // Actually: Donat Kacang 10, Donat Oreo 9, Donat Meses 7
      expect(bestProduct).toBe('Donat Kacang');
      
      // Unique customers: 5 unique phone numbers
      expect(uniqueCustomers).toBe(5);
    });
  });
});
