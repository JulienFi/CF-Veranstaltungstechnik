import { createContext, useContext } from 'react';

export interface SEOState {
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogImage: string | null;
  schemaData: object | null;
}

export interface SEOContextValue {
  seo: SEOState;
  setSEO: (partial: Partial<SEOState>) => void;
  resetSEO: () => void;
}

export const INITIAL_SEO_STATE: SEOState = {
  title: null,
  description: null,
  canonical: null,
  ogImage: null,
  schemaData: null,
};

export const SEOContext = createContext<SEOContextValue | undefined>(undefined);

export function useSEO() {
  const context = useContext(SEOContext);
  if (!context) {
    throw new Error('useSEO must be used within SEOProvider');
  }
  return context;
}
