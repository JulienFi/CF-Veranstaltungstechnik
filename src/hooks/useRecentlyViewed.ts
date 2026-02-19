import { useState, useEffect, useCallback } from 'react';

const MAX_RECENT_PRODUCTS = 5;
const STORAGE_KEY = 'recentlyViewed';

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setRecentlyViewed(parsed.filter((entry): entry is string => typeof entry === 'string'));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const addToRecentlyViewed = useCallback((productId: string) => {
    if (!productId) {
      return;
    }

    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== productId);
      const updated = [productId, ...filtered].slice(0, MAX_RECENT_PRODUCTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    recentlyViewed,
    addToRecentlyViewed
  };
}
