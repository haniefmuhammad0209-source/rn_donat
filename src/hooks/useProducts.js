import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { products as staticProducts } from '../data/products';

export const useProducts = () => {
  const [products, setProducts] = useState(staticProducts); // fallback ke static
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = productService.subscribeAll(
      (data) => {
        // Kalau Firestore kosong, pakai data static
        setProducts(data.length > 0 ? data : staticProducts);
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  return { products, loading, error };
};
