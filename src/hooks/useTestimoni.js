import { useState, useEffect, useCallback } from 'react';
import { testimoniService } from '../services/testimoniService';

export const useTestimoni = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = testimoniService.subscribeFirstPage(
      (data, last, more) => {
        setTestimonials(data);
        setLastDoc(last);
        setHasMore(more);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const loadMore = useCallback(async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const { data, lastDoc: newLast, hasMore: more } = await testimoniService.loadMore(lastDoc);
      setTestimonials((prev) => [...prev, ...data]);
      setLastDoc(newLast);
      setHasMore(more);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [lastDoc, loadingMore]);

  const addTestimoni = useCallback(async (user, formData) => {
    await testimoniService.add(user, formData);
  }, []);

  const deleteTestimoni = useCallback(async (id) => {
    await testimoniService.delete(id);
  }, []);

  return {
    testimonials, loading, loadingMore,
    hasMore, error,
    loadMore, addTestimoni, deleteTestimoni,
  };
};
