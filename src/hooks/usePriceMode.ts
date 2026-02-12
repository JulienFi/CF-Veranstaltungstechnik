import { useEffect, useState } from 'react';
import type { PriceMode } from '../utils/price';

const PRICE_MODE_STORAGE_KEY = 'priceMode';
const PRICE_MODE_UPDATED_EVENT = 'price-mode-updated';

function readStoredPriceMode(): PriceMode {
  if (typeof window === 'undefined') {
    return 'gross';
  }

  const stored = localStorage.getItem(PRICE_MODE_STORAGE_KEY);
  return stored === 'net' || stored === 'gross' ? stored : 'gross';
}

export function usePriceMode() {
  const [priceMode, setPriceModeState] = useState<PriceMode>(() => readStoredPriceMode());

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === PRICE_MODE_STORAGE_KEY) {
        setPriceModeState(readStoredPriceMode());
      }
    };

    const handleLocalUpdate = () => {
      setPriceModeState(readStoredPriceMode());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(PRICE_MODE_UPDATED_EVENT, handleLocalUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(PRICE_MODE_UPDATED_EVENT, handleLocalUpdate);
    };
  }, []);

  const setPriceMode = (nextMode: PriceMode) => {
    setPriceModeState(nextMode);
    localStorage.setItem(PRICE_MODE_STORAGE_KEY, nextMode);
    window.dispatchEvent(new Event(PRICE_MODE_UPDATED_EVENT));
  };

  return {
    priceMode,
    setPriceMode,
  };
}
