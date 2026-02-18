import { useEffect, useRef } from 'react';
import { X, Plus, CheckCircle2, Package, Target } from 'lucide-react';
import type { ProductWithCategory } from '../types/shop.types';
import { resolveImageUrl } from '../utils/image';

interface QuickViewModalProps {
  product: ProductWithCategory;
  isOpen: boolean;
  onClose: () => void;
  onAddToInquiry: (productId: string) => void;
  isInInquiry: boolean;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToInquiry,
  isInInquiry
}: QuickViewModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusCloseButton = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    const getFocusableElements = (): HTMLElement[] => {
      const container = modalRef.current;
      if (!container) {
        return [];
      }

      return Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first || !modalRef.current?.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (!active || active === last || !modalRef.current?.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusCloseButton);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusedElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 pt-6 md:items-center md:p-4">
      <div
        className="absolute inset-0 bg-black/82 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div
        ref={modalRef}
        className="glass-panel no-scrollbar card relative z-10 max-h-[min(92vh,860px)] w-full max-w-4xl overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickview-title"
        aria-describedby="quickview-description"
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="btn-secondary focus-ring tap-target interactive absolute right-3 top-3 z-10 !min-h-0 !p-2 md:right-4 md:top-4"
          aria-label="Schnellansicht schließen"
        >
          <X className="icon-std text-white" />
        </button>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 md:gap-8 md:p-8">
          <div className="glass-panel--soft card-inner aspect-square overflow-hidden">
            <img
              src={resolveImageUrl(product.image_url, 'product', product.slug)}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="flex flex-col">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="card-inner rounded-md bg-blue-500/14 px-3 py-1.5 text-sm font-medium text-blue-300">
                {product.categories.name}
              </span>
              {product.tags.slice(0, 3).map(tag => (
                <span key={tag} className="glass-panel--soft card-inner px-3 py-1.5 text-sm text-gray-200">
                  {tag}
                </span>
              ))}
            </div>

            <h2 id="quickview-title" className="mb-4 text-3xl font-bold text-white">{product.name}</h2>
            <p id="quickview-description" className="mb-6 text-gray-200 leading-relaxed">{product.short_description}</p>

            {product.suitable_for && (
              <div className="glass-panel--soft card-inner mb-4 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Target className="icon-std icon-std--sm" />
                  Geeignet für
                </h3>
                <p className="text-sm text-gray-200">{product.suitable_for}</p>
              </div>
            )}

            {product.scope_of_delivery && (
              <div className="glass-panel--soft card-inner mb-6 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Package className="icon-std icon-std--sm" />
                  Lieferumfang
                </h3>
                <p className="text-sm text-gray-200">{product.scope_of_delivery}</p>
              </div>
            )}

            <div className="mt-2 flex flex-col gap-2.5 sm:mt-auto sm:flex-row">
              <a
                href={`/mietshop/${product.slug}`}
                className="btn-secondary focus-ring tap-target interactive flex-1 text-center"
              >
                Alle Details ansehen
              </a>
              {isInInquiry ? (
                <button
                  disabled
                  className="glass-panel--soft tap-target inline-flex items-center justify-center gap-2 rounded-lg border border-green-500/45 bg-green-500/16 px-5 py-3 font-medium text-green-300"
                >
                  <CheckCircle2 className="icon-std" />
                  Hinzugefügt
                </button>
              ) : (
                <button
                  onClick={() => {
                    onAddToInquiry(product.id);
                    onClose();
                  }}
                  className="btn-primary focus-ring tap-target interactive inline-flex items-center justify-center gap-2"
                >
                  <Plus className="icon-std" />
                  Anfragen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
