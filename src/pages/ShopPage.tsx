import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ShoppingBag, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Category, ProductWithCategory } from '../types/shop.types';
import { ProductCardSkeleton } from '../components/SkeletonLoader';
import QuickViewModal from '../components/QuickViewModal';
import SearchBar from '../components/SearchBar';
import ProductFilters, { ActiveFilters } from '../components/ProductFilters';
import ScrollToTop from '../components/ScrollToTop';
import { showToast } from '../lib/toast';
import { useInquiryList } from '../hooks/useInquiryList';
import { usePriceMode } from '../hooks/usePriceMode';
import BackButton from '../components/BackButton';
import type { Database, Json } from '../lib/database.types';
import { resolveImageUrl } from '../utils/image';
import PriceDisplay from '../components/PriceDisplay';
import PriceModeToggle from '../components/PriceModeToggle';
import MobileStickyCTA from '../components/MobileStickyCTA';
import { navigate } from '../lib/navigation';
import { parseQuery, updateQuery } from '../utils/queryState';
import { listActiveProductsForShop } from '../repositories/productRepository';

const PRODUCTS_PER_BATCH = 24;

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type ProductRowWithCategory = Database['public']['Tables']['products']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'] | null;
};

interface ProductSpec {
  label: string;
  value: string;
}

interface ProductSpecJson {
  label: string;
  value: string;
  [key: string]: Json | undefined;
}

function isProductSpec(value: Json): value is ProductSpecJson {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const maybeSpec = value as { label?: unknown; value?: unknown };
  return typeof maybeSpec.label === 'string' && typeof maybeSpec.value === 'string';
}

function parseSpecs(value: Json | null): ProductSpec[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isProductSpec).map((spec) => ({
    label: spec.label,
    value: spec.value,
  }));
}

function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? '',
    display_order: row.display_order ?? 0,
    created_at: row.created_at ?? '',
  };
}

function mapProductRow(row: ProductRowWithCategory): ProductWithCategory {
  return {
    id: row.id,
    name: row.name ?? '',
    slug: row.slug ?? '',
    category_id: row.category_id ?? '',
    short_description: row.short_description ?? '',
    full_description: row.full_description ?? '',
    specs: parseSpecs(row.specs),
    suitable_for: row.suitable_for ?? '',
    scope_of_delivery: row.scope_of_delivery ?? '',
    tags: row.tags ?? [],
    image_url: row.image_url ?? '',
    price_net: row.price_net ?? null,
    vat_rate: row.vat_rate ?? null,
    show_price: row.show_price ?? false,
    is_active: row.is_active ?? true,
    created_at: row.created_at ?? '',
    updated_at: row.updated_at ?? '',
    categories: {
      id: row.categories?.id ?? '',
      name: row.categories?.name ?? '',
      slug: row.categories?.slug ?? '',
    },
  };
}

export default function ShopPage() {
  const initialQuery = useMemo(() => parseQuery(), []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialQuery.cat ?? 'all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery.q ?? '');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    tags: initialQuery.tags ?? [],
    category: initialQuery.cat ?? '',
  });
  const [quickViewProduct, setQuickViewProduct] = useState<ProductWithCategory | null>(null);
  const [visibleProductCount, setVisibleProductCount] = useState(PRODUCTS_PER_BATCH);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const { inquiryList, addToInquiry, removeFromInquiry, isInInquiry } = useInquiryList();
  const { priceMode } = usePriceMode();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        listActiveProductsForShop(supabase),
      ]);

      if (categoriesRes.error) {
        throw categoriesRes.error;
      }

      if (productsRes.error) {
        throw productsRes.error;
      }

      if (categoriesRes.data) {
        setCategories((categoriesRes.data as CategoryRow[]).map(mapCategoryRow));
      }
      if (productsRes.data) {
        setProducts((productsRes.data as ProductRowWithCategory[]).map(mapProductRow));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeSearchText = (value: string): string =>
    value.toLowerCase().replace(/\s+/g, ' ').trim();

  const normalizedQuery = useMemo(() => normalizeSearchText(searchQuery), [searchQuery]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== 'all' && product.category_id !== selectedCategory) {
        return false;
      }

      if (activeFilters.tags.length > 0 && !activeFilters.tags.some((tag) => product.tags.includes(tag))) {
        return false;
      }

      if (normalizedQuery) {
        const specsText = (product.specs ?? [])
          .map((spec) => `${spec.label} ${spec.value}`)
          .join(' ');

        const searchableText = normalizeSearchText(
          [
            product.name,
            product.short_description,
            product.full_description,
            product.suitable_for,
            product.scope_of_delivery,
            product.tags.join(' '),
            specsText,
            product.categories?.name ?? '',
          ]
            .filter(Boolean)
            .join(' ')
        );

        if (!searchableText.includes(normalizedQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, activeFilters.tags, normalizedQuery]);

  useEffect(() => {
    setVisibleProductCount(PRODUCTS_PER_BATCH);
  }, [selectedCategory, normalizedQuery, activeFilters.tags]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleProductCount);
  }, [filteredProducts, visibleProductCount]);

  const hasMoreProducts = visibleProductCount < filteredProducts.length;

  const availableTags = useMemo(() => {
    return Array.from(new Set(products.flatMap((product) => product.tags)));
  }, [products]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCta(window.scrollY > window.innerHeight * 0.5);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      return;
    }

    const isValidCategory = categories.some((category) => category.id === selectedCategory);
    if (!isValidCategory) {
      setSelectedCategory('all');
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (availableTags.length === 0 || activeFilters.tags.length === 0) {
      return;
    }

    const validTags = activeFilters.tags.filter((tag) => availableTags.includes(tag));
    if (validTags.length !== activeFilters.tags.length) {
      setActiveFilters((prev) => ({ ...prev, tags: validTags }));
    }
  }, [availableTags, activeFilters.tags]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      updateQuery({ q: searchQuery || undefined }, { replace: true });
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const activeTagsKey = useMemo(() => activeFilters.tags.join(','), [activeFilters.tags]);

  useEffect(() => {
    updateQuery(
      {
        cat: selectedCategory !== 'all' ? selectedCategory : undefined,
        tags: activeFilters.tags.length > 0 ? activeFilters.tags : undefined,
      },
      { replace: true }
    );
  }, [selectedCategory, activeTagsKey, activeFilters.tags]);

  const handleAddToInquiry = (productId: string) => {
    addToInquiry(productId);
    showToast('success', 'Produkt zur Anfrageliste hinzugefügt');
  };

  const handleRemoveFromInquiry = (productId: string) => {
    removeFromInquiry(productId);
    showToast('info', 'Produkt von der Anfrageliste entfernt');
  };

  if (loading) {
    return (
      <div className="bg-app-bg text-white min-h-screen">
        <section className="section-shell section-shell--hero bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
          <div className="content-container">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="section-title mb-6 font-bold">Mietshop für Eventtechnik</h1>
            </div>
          </div>
        </section>
        <section className="section-shell">
          <div className="content-container">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <ProductCardSkeleton key={i} />)}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-app-bg text-white min-h-screen pb-24 md:pb-0">
      <section className="section-shell section-shell--hero bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="content-container">
          <BackButton href="/" label="Zurück zur Startseite" className="mb-8 md:mb-10" />
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="section-title mb-6 font-bold">Mietshop für Eventtechnik</h1>
            <p className="section-copy mb-8 text-gray-200">
              Wählen Sie die passende Technik für Ihr Event in Berlin und Brandenburg. Wir erstellen Ihnen ein unverbindliches Angebot, das Umfang, Laufzeit und Service exakt auf Ihren Bedarf abstimmt.
            </p>
            <div className="mx-auto flex max-w-2xl justify-center">
              <SearchBar onSearch={setSearchQuery} initialQuery={searchQuery} />
            </div>
            <PriceModeToggle className="mt-6 flex justify-center" />
          </div>
        </div>
      </section>

      <section className="section-shell--tight sticky top-[4.8rem] z-40 border-b border-gray-700/85 bg-card-bg/92 py-8 backdrop-blur-sm md:top-20 md:py-10">
        <div className="content-container">
          <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`focus-ring tap-target rounded-lg border px-5 py-2.5 text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 border-blue-400/70'
                  : 'bg-card-hover/80 text-gray-200 border-gray-700/70 hover:bg-card-hover hover:text-white'
              }`}
            >
              Alle Kategorien
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`focus-ring tap-target rounded-lg border px-5 py-2.5 text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 border-blue-400/70'
                    : 'bg-card-hover/80 text-gray-200 border-gray-700/70 hover:bg-card-hover hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {inquiryList.length > 0 && (
            <div className="mt-6 flex justify-center">
              <a
                href="/mietshop/anfrage"
                className="btn-primary focus-ring tap-target inline-flex items-center gap-2 group"
              >
                <ShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Anfrage für {inquiryList.length} Produkt{inquiryList.length !== 1 ? 'e' : ''} senden</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="section-shell">
        <div className="content-container">
          {availableTags.length > 0 && (
            <div className="mb-8 md:mb-10">
              <ProductFilters
                availableFilters={{ tags: availableTags, categories: [] }}
                activeFilters={activeFilters}
                onFilterChange={setActiveFilters}
              />
            </div>
          )}

          {searchQuery && (
            <div className="mb-6 text-sm text-gray-300">
              Suchergebnisse für &quot;{searchQuery}&quot; ({filteredProducts.length})
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="glass-panel--soft py-16 text-center">
              <p className="text-lg text-gray-300 md:text-xl">Keine Produkte in dieser Kategorie gefunden.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-sm text-gray-300">
                {visibleProducts.length} von {filteredProducts.length} Produkten angezeigt
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                {visibleProducts.map(product => (
                  <div
                    key={product.id}
                    className="glass-panel interactive-card group overflow-hidden rounded-xl"
                  >
                    <a
                      href={`/mietshop/${product.slug}`}
                      className="focus-ring block aspect-video cursor-pointer overflow-hidden bg-gradient-to-br from-card-hover to-card-bg"
                    >
                      <img
                        src={resolveImageUrl(product.image_url, 'product', product.slug)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </a>
                    <div className="p-5 md:p-6">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-md bg-blue-500/14 px-2.5 py-1 text-xs font-medium text-blue-300">
                          {product.categories.name}
                        </span>
                        {product.tags.map(tag => (
                          <span key={tag} className="rounded-md bg-card-hover/80 px-2.5 py-1 text-xs text-gray-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="mb-2 text-xl font-bold leading-snug transition-colors group-hover:text-blue-300">
                        {product.name}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-300">{product.short_description}</p>
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
                          onClick={() => setQuickViewProduct(product)}
                          className="focus-ring tap-target flex items-center gap-2 rounded-lg border border-gray-700/70 bg-card-hover/80 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-card-hover"
                          aria-label="Schnellansicht"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`/mietshop/${product.slug}`}
                          className="focus-ring tap-target flex-1 rounded-lg border border-gray-700/70 bg-card-hover/80 px-4 py-2.5 text-center text-sm font-medium text-white transition-all hover:bg-card-hover"
                        >
                          Details
                        </a>
                        {isInInquiry(product.id) ? (
                          <button
                            onClick={() => handleRemoveFromInquiry(product.id)}
                            className="btn-primary focus-ring tap-target px-4 py-2.5 text-sm"
                            aria-label="Von Anfrageliste entfernen"
                          >
                            ✓
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToInquiry(product.id)}
                            className="focus-ring tap-target rounded-lg border border-gray-700/70 bg-card-hover/80 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-card-hover"
                            aria-label="Zur Anfrageliste hinzufuegen"
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {hasMoreProducts && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleProductCount((current) => current + PRODUCTS_PER_BATCH)}
                    className="btn-secondary focus-ring tap-target"
                  >
                    Mehr laden ({Math.min(PRODUCTS_PER_BATCH, filteredProducts.length - visibleProductCount)} weitere)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="section-shell bg-card-bg/50">
        <div className="content-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="section-title mb-6 font-bold">Sie brauchen Unterstützung bei der Auswahl?</h2>
            <p className="section-copy mb-8 text-gray-200">
              Wir übernehmen die technische Planung und beraten Sie persönlich. So können Sie sich auf Ihr Event konzentrieren, während wir die passende Lösung liefern.
            </p>
            <a
              href="/kontakt"
              className="btn-primary focus-ring tap-target inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <span>Unverbindliches Angebot anfragen</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      <ScrollToTop />

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToInquiry={handleAddToInquiry}
          isInInquiry={isInInquiry(quickViewProduct.id)}
        />
      )}

      <MobileStickyCTA
        label="Angebot anfragen"
        isVisible={showStickyCta}
        onClick={() => navigate('/mietshop/anfrage')}
      />
    </div>
  );
}


