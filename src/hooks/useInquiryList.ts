import { useState, useEffect } from 'react';

export function useInquiryList() {
  const [inquiryList, setInquiryList] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('inquiryList');
    if (saved) {
      setInquiryList(JSON.parse(saved));
    }
  }, []);

  const addToInquiry = (productId: string) => {
    const updated = [...inquiryList, productId];
    setInquiryList(updated);
    localStorage.setItem('inquiryList', JSON.stringify(updated));
    window.dispatchEvent(new Event('inquiry-updated'));
  };

  const removeFromInquiry = (productId: string) => {
    const updated = inquiryList.filter(id => id !== productId);
    setInquiryList(updated);
    localStorage.setItem('inquiryList', JSON.stringify(updated));
    window.dispatchEvent(new Event('inquiry-updated'));
  };

  const isInInquiry = (productId: string) => {
    return inquiryList.includes(productId);
  };

  return {
    inquiryList,
    addToInquiry,
    removeFromInquiry,
    isInInquiry
  };
}
