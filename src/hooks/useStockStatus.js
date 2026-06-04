import { useState, useEffect } from 'react';
import { stockService } from '../services/stockService';

/**
 * Hook untuk subscribe ke stock status real-time dari Firestore
 * @returns {{ stock: number, threshold: number, isLow: boolean, loading: boolean }}
 */
export const useStockStatus = () => {
  const [stock, setStock] = useState(0);
  const [threshold, setThreshold] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe ke perubahan stok real-time
    const unsubscribe = stockService.subscribeStock((data) => {
      setStock(data.current);
      setThreshold(data.threshold);
      setLoading(false);
    });

    // Cleanup: unsubscribe saat unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Hitung apakah stok rendah
  const isLow = stock < threshold;

  return {
    stock,
    threshold,
    isLow,
    loading,
  };
};
