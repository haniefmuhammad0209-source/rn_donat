import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';

export const useOrderStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = orderService.subscribeStats((data) => {
      setStats(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { stats, loading };
};
