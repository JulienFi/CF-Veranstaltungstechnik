import { Eye, ImageOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ProductWithCategory } from '../types/shop.types';
import type { PriceMode } from '../utils/price';
import { resolveImageUrl } from '../utils/image';
import PriceDisplay from './PriceDisplay';

interface ShopProductCardProps {
  product: ProductWithCategory;
  priceMode: PriceMode;
  inInquiry: boolean;
  onQuickView: () => void;
  onAddToInquiry: () => void;
  onRemoveFromInquiry: () => void;
}

export default function ShopProductCard({
  product,
  priceMode,
  inInquiry,
  onQuickView,
  onAddToInquiry,
  onRemoveFromInquiry,
}: ShopProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const imageSrc = useMemo(() => {
    const directImageUrl = product.image_url?.trim() ?? '';
    if (directImageUrl.length > 0) {
      return resolveImageUrl(directImageUrl, 'product', product.slug);
    }

    const slug = product.slug?.trim() ?? '';
    if (slug.length > 0) {
      return resolveImageUrl(null, 'product', slug);
    }

    return null;
  }, [product.image_url, product.slug]);

  const showImage = Boolean(imageSrc) && !imageError;
  const imageAlt = product.name?.trim() || 'Produkt';

  return (
    <div className="glass-panel card interactive-card group flex h-full flex-col overflow-hidden">
      <a
        href={`/mietshop/${product.slug}`}
        className="focus-ring interactive card-inner block aspect-video cursor-pointer overflow-hidden bg-gradient-to-br from-card-hover to-card-bg"
      >
        {showImage ? (
          <img
            src={imageSrc ?? undefined}
            alt={imageAlt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-800 text-slate-400">
            <ImageOff className="icon-std text-slate-500" />
            <span className="text-xs font-medium">Kein Bild verfügbar</span>
          </div>
        )}
      </a>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="card-inner rounded-md bg-blue-500/14 px-2.5 py-1 text-xs font-medium text-blue-300">
            {product.categories.name}
          </span>
          {product.tags.map((tag) => (
            <span key={tag} className="glass-panel--soft card-inner px-2.5 py-1 text-xs text-gray-200">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="mb-2 text-xl font-bold leading-snug transition-colors group-hover:text-blue-300">
          {product.name}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-300">{product.short_description}</p>

        <div className="mt-auto">
          <div className="mb-4 text-lg">
            <PriceDisplay
              priceNet={product.price_net}
              showPrice={product.show_price}
              vatRate={product.vat_rate}
              mode={priceMode}
              prefix="ab"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onQuickView}
              className="btn-secondary focus-ring tap-target interactive !min-h-0 px-4 py-2.5 text-sm"
              aria-label={`Schnellansicht ${product.name}`}
            >
              <Eye className="icon-std icon-std--sm" />
            </button>
            <a
              href={`/mietshop/${product.slug}`}
              className="btn-secondary focus-ring tap-target interactive !min-h-0 flex-1 px-4 py-2.5 text-center text-sm"
            >
              Details
            </a>
            {inInquiry ? (
              <button
                onClick={onRemoveFromInquiry}
                className="btn-primary focus-ring tap-target interactive !min-h-0 px-4 py-2.5 text-sm"
                aria-label="Von Anfrageliste entfernen"
              >
                ✓
              </button>
            ) : (
              <button
                onClick={onAddToInquiry}
                className="btn-secondary focus-ring tap-target interactive !min-h-0 px-4 py-2.5 text-sm"
                aria-label="Zur Anfrageliste hinzufügen"
              >
                +
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
