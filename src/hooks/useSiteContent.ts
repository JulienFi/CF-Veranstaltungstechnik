import { useEffect, useState } from 'react';
import { getContent } from '../repositories/contentRepository';

interface UseSiteContentState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export function useSiteContent<T>(
  key: string,
  fallback: T,
  normalize: (value: unknown, fallback: T) => T
): UseSiteContentState<T> {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const content = await getContent<Record<string, unknown>>(key);
        if (!isMounted) {
          return;
        }
        setData(normalize(content, fallback));
      } catch (loadError) {
        if (!isMounted) {
          return;
        }
        console.error(`Error loading CMS content for ${key}:`, loadError);
        setError('Inhalte konnten nicht geladen werden.');
        setData(fallback);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [key, fallback, normalize]);

  return { data, loading, error };
}
