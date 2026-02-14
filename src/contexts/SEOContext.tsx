import { useCallback, useMemo, useState } from 'react';
import { INITIAL_SEO_STATE, SEOContext, type SEOContextValue, type SEOState } from './seo-state';

export function SEOProvider({ children }: { children: React.ReactNode }) {
  const [seo, setSeoState] = useState<SEOState>(INITIAL_SEO_STATE);

  const setSEO = useCallback((partial: Partial<SEOState>) => {
    setSeoState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetSEO = useCallback(() => {
    setSeoState(INITIAL_SEO_STATE);
  }, []);

  const value = useMemo<SEOContextValue>(
    () => ({
      seo,
      setSEO,
      resetSEO,
    }),
    [seo, setSEO, resetSEO]
  );

  return <SEOContext.Provider value={value}>{children}</SEOContext.Provider>;
}
