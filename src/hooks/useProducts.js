import { useState, useEffect } from 'react';
import { productService } from '../services/productService';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = productService.subscribeAll(
      (data) => {
        setProducts(data);
        setLoading(false);
      },
      (err) => {
        setError(err?.message || 'Gagal memuat produk');
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { products, loading, error };
};
