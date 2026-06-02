import { useState, useEffect } from 'react';
import { stockService } from '../services/stockService';

/**
 * Subscribe real-time to stock/plain_donut document.
 * @returns {{ stock: number, threshold: number, isLow: boolean, loading: boolean }}
 */
const useStockStatus = () => {
  const [stock, setStock] = useState(0);
  const [threshold, setThreshold] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = stockService.subscribeStock(({ current, threshold: t }) => {
      setStock(current);
      setThreshold(t);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return {
    stock,
    threshold,
    isLow: stock < threshold,
    loading,
  };
};

export default useStockStatus;
