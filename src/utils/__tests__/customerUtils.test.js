/**
 * Unit tests for customerUtils.js
 * Validates Requirements 7.1, 7.2, 7.4, 7.6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { computeCustomerList, getCustomerHistory } from '../customerUtils';

describe('customerUtils', () => {
  let mockOrders;

  beforeEach(() => {
    mockOrders = [
      {
        id: '1',
        customerPhone: '081234567890',
        customerName: 'John Doe',
        totalPrice: 50000,
        status: 'paid',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        items: [{ productName: 'Donat Meses', quantity: 2 }],
      },
      {
        id: '2',
        customerPhone: '081234567891',
        customerName: 'Jane Smith',
        totalPrice: 75000,
        status: 'completed',
        createdAt: new Date('2024-01-14T10:00:00Z'),
        items: [{ productName: 'Donat Oreo', quantity: 3 }],
      },
      {
        id: '3',
        customerPhone: '081234567890', // Same customer as order 1
        customerName: 'John Doe',
        totalPrice: 30000,
        status: 'paid',
        createdAt: new Date('2024-01-16T10:00:00Z'), // Most recent
        items: [{ productName: 'Donat Keju', quantity: 1 }],
      },
      {
        id: '4',
        customerPhone: '081234567892',
        customerName: 'Bob Johnson',
        totalPrice: 100000,
        status: 'completed',
        createdAt: new Date('2024-01-13T10:00:00Z'),
        items: [{ productName: 'Donat Kacang', quantity: 5 }],
      },
      {
        id: '5',
        customerPhone: '081234567891', // Same customer as order 2
        customerName: 'Jane Smith',
        totalPrice: 45000,
        status: 'pending',
        createdAt: new Date('2024-01-15T12:00:00Z'),
        items: [{ productName: 'Donat Meses', quantity: 2 }],
      },
    ];
  });

  describe('computeCustomerList', () => {
    it('should return unique customers with correct aggregated data', () => {
      const result = computeCustomerList(mockOrders);

      expect(result).toHaveLength(3); // 3 unique phone numbers
      
      // Check each customer has required fields
      result.forEach(customer => {
        expect(customer).toHaveProperty('phone');
        expect(customer).toHaveProperty('name');
        expect(customer).toHaveProperty('orderCount');
        expect(customer).toHaveProperty('totalSpent');
        expect(customer).toHaveProperty('lastOrder');
      });
    });

    it('should calculate correct orderCount and totalSpent for each customer', () => {
      const result = computeCustomerList(mockOrders);

      // Find John Doe (081234567890)
      const john = result.find(c => c.phone === '081234567890');
      expect(john.orderCount).toBe(2); // orders 1 and 3
      expect(john.totalSpent).toBe(80000); // 50000 + 30000

      // Find Jane Smith (081234567891)
      const jane = result.find(c => c.phone === '081234567891');
      expect(jane.orderCount).toBe(2); // orders 2 and 5
      expect(jane.totalSpent).toBe(120000); // 75000 + 45000

      // Find Bob Johnson (081234567892)
      const bob = result.find(c => c.phone === '081234567892');
      expect(bob.orderCount).toBe(1); // order 4
      expect(bob.totalSpent).toBe(100000);
    });

    it('should sort customers by totalSpent descending', () => {
      const result = computeCustomerList(mockOrders);

      // Jane Smith: 120000
      // Bob Johnson: 100000
      // John Doe: 80000
      expect(result[0].phone).toBe('081234567891'); // Jane
      expect(result[0].totalSpent).toBe(120000);
      
      expect(result[1].phone).toBe('081234567892'); // Bob
      expect(result[1].totalSpent).toBe(100000);
      
      expect(result[2].phone).toBe('081234567890'); // John
      expect(result[2].totalSpent).toBe(80000);
    });

    it('should track the most recent order for each customer', () => {
      const result = computeCustomerList(mockOrders);

      // John Doe's last order should be order 3 (2024-01-16)
      const john = result.find(c => c.phone === '081234567890');
      const johnLastOrderDate = john.lastOrder instanceof Date 
        ? john.lastOrder 
        : john.lastOrder.toDate();
      expect(johnLastOrderDate.toISOString()).toBe('2024-01-16T10:00:00.000Z');
    });

    it('should return empty array for empty orders', () => {
      const result = computeCustomerList([]);
      expect(result).toEqual([]);
    });

    it('should return empty array for null/undefined orders', () => {
      expect(computeCustomerList(null)).toEqual([]);
      expect(computeCustomerList(undefined)).toEqual([]);
    });

    it('should skip orders without customerPhone', () => {
      const ordersWithNull = [
        ...mockOrders,
        { id: '6', customerPhone: null, customerName: 'No Phone', totalPrice: 20000 },
        { id: '7', customerPhone: undefined, customerName: 'No Phone 2', totalPrice: 15000 },
      ];

      const result = computeCustomerList(ordersWithNull);
      expect(result).toHaveLength(3); // Still only 3 unique customers
    });

    it('should handle orders with missing totalPrice', () => {
      const ordersWithMissingPrice = [
        { customerPhone: '081111111111', customerName: 'Test', totalPrice: undefined },
        { customerPhone: '081111111111', customerName: 'Test', totalPrice: 50000 },
      ];

      const result = computeCustomerList(ordersWithMissingPrice);
      expect(result[0].totalSpent).toBe(50000); // undefined should be treated as 0
    });

    it('should handle Firestore Timestamp objects', () => {
      const firestoreTimestamp = {
        toDate: () => new Date('2024-01-20T10:00:00Z'),
      };

      const ordersWithTimestamp = [
        {
          customerPhone: '081111111111',
          customerName: 'Test User',
          totalPrice: 50000,
          createdAt: firestoreTimestamp,
        },
      ];

      const result = computeCustomerList(ordersWithTimestamp);
      expect(result).toHaveLength(1);
      expect(result[0].lastOrder).toBe(firestoreTimestamp);
    });

    it('should use customer name from any order for the same phone', () => {
      const result = computeCustomerList(mockOrders);
      
      // Both John Doe orders have the same name
      const john = result.find(c => c.phone === '081234567890');
      expect(john.name).toBe('John Doe');
    });

    it('should handle missing customer name', () => {
      const ordersWithoutName = [
        { customerPhone: '081111111111', totalPrice: 50000, createdAt: new Date() },
      ];

      const result = computeCustomerList(ordersWithoutName);
      expect(result[0].name).toBe('Unknown');
    });
  });

  describe('getCustomerHistory', () => {
    it('should return only orders for the specified customer', () => {
      const result = getCustomerHistory('081234567890', mockOrders);

      expect(result.orders).toHaveLength(2); // John Doe has 2 orders
      expect(result.orders.every(o => o.customerPhone === '081234567890')).toBe(true);
    });

    it('should sort orders by createdAt descending', () => {
      const result = getCustomerHistory('081234567890', mockOrders);

      // Order 3 (2024-01-16) should come before Order 1 (2024-01-15)
      expect(result.orders[0].id).toBe('3');
      expect(result.orders[1].id).toBe('1');
    });

    it('should calculate correct summary statistics', () => {
      const result = getCustomerHistory('081234567890', mockOrders);

      expect(result.summary.orderCount).toBe(2);
      expect(result.summary.totalSpent).toBe(80000); // 50000 + 30000
      expect(result.summary.avgOrderValue).toBe(40000); // 80000 / 2
    });

    it('should return empty result for non-existent customer', () => {
      const result = getCustomerHistory('089999999999', mockOrders);

      expect(result.orders).toEqual([]);
      expect(result.summary.orderCount).toBe(0);
      expect(result.summary.totalSpent).toBe(0);
      expect(result.summary.avgOrderValue).toBe(0);
    });

    it('should return empty result for null/undefined phone', () => {
      expect(getCustomerHistory(null, mockOrders).orders).toEqual([]);
      expect(getCustomerHistory(undefined, mockOrders).orders).toEqual([]);
      expect(getCustomerHistory('', mockOrders).orders).toEqual([]);
    });

    it('should return empty result for empty orders', () => {
      const result = getCustomerHistory('081234567890', []);

      expect(result.orders).toEqual([]);
      expect(result.summary.orderCount).toBe(0);
    });

    it('should calculate avgOrderValue correctly for single order', () => {
      const result = getCustomerHistory('081234567892', mockOrders);

      expect(result.summary.orderCount).toBe(1);
      expect(result.summary.totalSpent).toBe(100000);
      expect(result.summary.avgOrderValue).toBe(100000); // 100000 / 1
    });

    it('should handle orders with missing totalPrice', () => {
      const ordersWithMissingPrice = [
        { customerPhone: '081111111111', totalPrice: undefined, createdAt: new Date() },
        { customerPhone: '081111111111', totalPrice: 50000, createdAt: new Date() },
      ];

      const result = getCustomerHistory('081111111111', ordersWithMissingPrice);
      expect(result.summary.totalSpent).toBe(50000);
      expect(result.summary.avgOrderValue).toBe(25000); // 50000 / 2
    });

    it('should handle Firestore Timestamp objects in sorting', () => {
      const firestoreTimestamp1 = {
        toDate: () => new Date('2024-01-20T10:00:00Z'),
      };
      const firestoreTimestamp2 = {
        toDate: () => new Date('2024-01-19T10:00:00Z'),
      };

      const ordersWithTimestamp = [
        {
          id: '1',
          customerPhone: '081111111111',
          totalPrice: 50000,
          createdAt: firestoreTimestamp2, // Older
        },
        {
          id: '2',
          customerPhone: '081111111111',
          totalPrice: 60000,
          createdAt: firestoreTimestamp1, // Newer
        },
      ];

      const result = getCustomerHistory('081111111111', ordersWithTimestamp);
      
      // Order 2 should come first (more recent)
      expect(result.orders[0].id).toBe('2');
      expect(result.orders[1].id).toBe('1');
    });

    it('should handle orders with invalid createdAt', () => {
      const ordersWithInvalidDates = [
        { customerPhone: '081111111111', totalPrice: 50000, createdAt: null },
        { customerPhone: '081111111111', totalPrice: 60000, createdAt: 'invalid-date' },
        { customerPhone: '081111111111', totalPrice: 70000, createdAt: new Date('2024-01-15T10:00:00Z') },
      ];

      const result = getCustomerHistory('081111111111', ordersWithInvalidDates);
      
      // Should still return all orders
      expect(result.orders).toHaveLength(3);
      // Valid date should come first
      expect(result.orders[0].totalPrice).toBe(70000);
    });

    it('should include all order details in history', () => {
      const result = getCustomerHistory('081234567890', mockOrders);

      result.orders.forEach(order => {
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('customerPhone');
        expect(order).toHaveProperty('customerName');
        expect(order).toHaveProperty('totalPrice');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('items');
      });
    });

    it('should calculate avgOrderValue with floating point precision', () => {
      const ordersWithOddTotal = [
        { customerPhone: '081111111111', totalPrice: 100, createdAt: new Date() },
        { customerPhone: '081111111111', totalPrice: 200, createdAt: new Date() },
        { customerPhone: '081111111111', totalPrice: 300, createdAt: new Date() },
      ];

      const result = getCustomerHistory('081111111111', ordersWithOddTotal);
      
      expect(result.summary.totalSpent).toBe(600);
      expect(result.summary.avgOrderValue).toBe(200); // 600 / 3
    });
  });

  describe('Integration - Real-world scenario', () => {
    it('should handle a realistic customer base', () => {
      const realisticOrders = [
        // Regular customer with multiple orders
        { customerPhone: '081111111111', customerName: 'Alice Regular', totalPrice: 50000, createdAt: new Date('2024-01-01') },
        { customerPhone: '081111111111', customerName: 'Alice Regular', totalPrice: 60000, createdAt: new Date('2024-01-10') },
        { customerPhone: '081111111111', customerName: 'Alice Regular', totalPrice: 70000, createdAt: new Date('2024-01-20') },
        
        // VIP customer with high-value orders
        { customerPhone: '081222222222', customerName: 'Bob VIP', totalPrice: 200000, createdAt: new Date('2024-01-05') },
        { customerPhone: '081222222222', customerName: 'Bob VIP', totalPrice: 300000, createdAt: new Date('2024-01-15') },
        
        // One-time customer
        { customerPhone: '081333333333', customerName: 'Charlie Once', totalPrice: 75000, createdAt: new Date('2024-01-12') },
      ];

      // Test computeCustomerList
      const customerList = computeCustomerList(realisticOrders);
      
      expect(customerList).toHaveLength(3);
      
      // VIP customer should be first (highest totalSpent)
      expect(customerList[0].phone).toBe('081222222222');
      expect(customerList[0].totalSpent).toBe(500000);
      expect(customerList[0].orderCount).toBe(2);
      
      // Regular customer second
      expect(customerList[1].phone).toBe('081111111111');
      expect(customerList[1].totalSpent).toBe(180000);
      expect(customerList[1].orderCount).toBe(3);
      
      // One-time customer last
      expect(customerList[2].phone).toBe('081333333333');
      expect(customerList[2].totalSpent).toBe(75000);
      expect(customerList[2].orderCount).toBe(1);

      // Test getCustomerHistory for regular customer
      const aliceHistory = getCustomerHistory('081111111111', realisticOrders);
      
      expect(aliceHistory.orders).toHaveLength(3);
      expect(aliceHistory.summary.orderCount).toBe(3);
      expect(aliceHistory.summary.totalSpent).toBe(180000);
      expect(aliceHistory.summary.avgOrderValue).toBe(60000);
      
      // Orders should be sorted by date descending
      expect(aliceHistory.orders[0].totalPrice).toBe(70000); // Jan 20
      expect(aliceHistory.orders[1].totalPrice).toBe(60000); // Jan 10
      expect(aliceHistory.orders[2].totalPrice).toBe(50000); // Jan 1
    });
  });
});
