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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-card-bg rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-card-hover rounded-lg hover:bg-gray-700 transition-colors z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div className="aspect-square bg-gradient-to-br from-card-hover to-card-bg rounded-xl flex items-center justify-center overflow-hidden">
            <img
              src={resolveImageUrl(product.image_url, 'product', product.slug)}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium">
                {product.categories.name}
              </span>
              {product.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-card-hover text-gray-300 rounded-lg text-sm">
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">{product.name}</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">{product.short_description}</p>

            {product.suitable_for && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Geeignet fÃƒÂ¼r
                </h3>
                <p className="text-gray-300 text-sm">{product.suitable_for}</p>
              </div>
            )}

            {product.scope_of_delivery && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Lieferumfang
                </h3>
                <p className="text-gray-300 text-sm">{product.scope_of_delivery}</p>
              </div>
            )}

            <div className="mt-auto flex gap-3">
              <a
                href={`/mietshop/${product.slug}`}
                className="flex-1 px-6 py-3 bg-card-hover text-white text-center rounded-lg hover:bg-gray-700 transition-all font-medium"
              >
                Alle Details ansehen
              </a>
              {isInInquiry ? (
                <button
                  disabled
                  className="px-6 py-3 bg-green-500/20 text-green-400 rounded-lg font-medium flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  HinzugefÃƒÂ¼gt
                </button>
              ) : (
                <button
                  onClick={() => {
                    onAddToInquiry(product.id);
                    onClose();
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium flex items-center gap-2"
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

