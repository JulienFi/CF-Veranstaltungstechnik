import { useState, useEffect } from 'react';

function dedupeEntries(entries: string[]): string[] {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const entry of entries) {
    const normalized = entry.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    deduped.push(normalized);
  }

  return deduped;
}

export function useInquiryList() {
  const [inquiryList, setInquiryList] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('inquiryList');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const normalized = dedupeEntries(parsed.filter((value): value is string => typeof value === 'string'));
          setInquiryList(normalized);
          localStorage.setItem('inquiryList', JSON.stringify(normalized));
        }
      } catch {
        setInquiryList([]);
      }
    }
  }, []);

  const addToInquiry = (productId: string, productSlug?: string | null) => {
    const normalizedId = productId.trim();
    const normalizedSlug = (productSlug ?? '').trim();

    const alreadyPresent =
      inquiryList.includes(normalizedId) || (normalizedSlug.length > 0 && inquiryList.includes(normalizedSlug));

    if (alreadyPresent || normalizedId.length === 0) {
      return;
    }

    const updated = dedupeEntries([...inquiryList, normalizedId]);
    setInquiryList(updated);
    localStorage.setItem('inquiryList', JSON.stringify(updated));
    window.dispatchEvent(new Event('inquiry-updated'));
  };

  const removeFromInquiry = (productId: string, productSlug?: string | null) => {
    const normalizedId = productId.trim();
    const normalizedSlug = (productSlug ?? '').trim();
    const updated = inquiryList.filter((id) => id !== normalizedId && id !== normalizedSlug);
    setInquiryList(updated);
    localStorage.setItem('inquiryList', JSON.stringify(updated));
    window.dispatchEvent(new Event('inquiry-updated'));
  };

  const isInInquiry = (productId: string, productSlug?: string | null) => {
    const normalizedId = productId.trim();
    const normalizedSlug = (productSlug ?? '').trim();
    return inquiryList.includes(normalizedId) || (normalizedSlug.length > 0 && inquiryList.includes(normalizedSlug));
  };

  return {
    inquiryList,
    addToInquiry,
    removeFromInquiry,
    isInInquiry
  };
}
