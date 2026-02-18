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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
      <div
        className="absolute inset-0 bg-black/82 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="glass-panel no-scrollbar relative w-full max-w-4xl max-h-[min(92vh,860px)] overflow-y-auto rounded-2xl">
        <button
          onClick={onClose}
          className="focus-ring tap-target absolute right-3 top-3 z-10 rounded-lg border border-gray-700/75 bg-card-hover/90 p-2 transition-colors hover:bg-card-hover md:right-4 md:top-4"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 md:gap-8 md:p-8">
          <div className="glass-panel--soft aspect-square overflow-hidden rounded-xl">
            <img
              src={resolveImageUrl(product.image_url, 'product', product.slug)}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="flex flex-col">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-md bg-blue-500/14 px-3 py-1.5 text-sm font-medium text-blue-300">
                {product.categories.name}
              </span>
              {product.tags.slice(0, 3).map(tag => (
                <span key={tag} className="rounded-md bg-card-hover/80 px-3 py-1.5 text-sm text-gray-200">
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="mb-4 text-3xl font-bold text-white">{product.name}</h2>
            <p className="mb-6 text-gray-200 leading-relaxed">{product.short_description}</p>

            {product.suitable_for && (
              <div className="glass-panel--soft mb-4 rounded-xl p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Target className="w-4 h-4" />
                  Geeignet für
                </h3>
                <p className="text-sm text-gray-200">{product.suitable_for}</p>
              </div>
            )}

            {product.scope_of_delivery && (
              <div className="glass-panel--soft mb-6 rounded-xl p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Package className="w-4 h-4" />
                  Lieferumfang
                </h3>
                <p className="text-sm text-gray-200">{product.scope_of_delivery}</p>
              </div>
            )}

            <div className="mt-2 flex flex-col gap-2.5 sm:mt-auto sm:flex-row">
              <a
                href={`/mietshop/${product.slug}`}
                className="btn-secondary focus-ring tap-target flex-1 text-center"
              >
                Alle Details ansehen
              </a>
              {isInInquiry ? (
                <button
                  disabled
                  className="tap-target inline-flex items-center justify-center gap-2 rounded-lg border border-green-500/45 bg-green-500/16 px-5 py-3 font-medium text-green-300"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Hinzugefügt
                </button>
              ) : (
                <button
                  onClick={() => {
                    onAddToInquiry(product.id);
                    onClose();
                  }}
                  className="btn-primary focus-ring tap-target inline-flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
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

