import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, ShoppingBag, AlertTriangle, SearchX, SlidersHorizontal, ChevronLeft } from 'lucide-react';
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
import type { Database, Json } from '../lib/database.types';
import PriceModeToggle from '../components/PriceModeToggle';
import MobileStickyCTA from '../components/MobileStickyCTA';
import ShopProductCard from '../components/ShopProductCard';
import { navigate } from '../lib/navigation';
import { parseQuery, updateQuery } from '../utils/queryState';
import { listActiveProductsForShop } from '../repositories/productRepository';
import { listCategoriesForShop } from '../repositories/categoryRepository';

const PRODUCTS_PER_BATCH = 24;
type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

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

function normalizeCategoryToken(value: string): string {
  return value
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function useSearchParams(): URLSearchParams {
  const [search, setSearch] = useState(() => window.location.search);

  useEffect(() => {
    const handleLocationChange = () => {
      setSearch(window.location.search);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ShopPage() {
  const initialQuery = useMemo(() => parseQuery(), []);
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialQuery.cat ?? 'all');
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState(initialQuery.q ?? '');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    tags: initialQuery.tags ?? [],
    category: initialQuery.cat ?? '',
  });
  const [quickViewProduct, setQuickViewProduct] = useState<ProductWithCategory | null>(null);
  const [visibleProductCount, setVisibleProductCount] = useState(PRODUCTS_PER_BATCH);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasAppliedInitialCategoryParam, setHasAppliedInitialCategoryParam] = useState(Boolean(initialQuery.cat));
  const { inquiryList, addToInquiry, removeFromInquiry, isInInquiry } = useInquiryList();
  const { priceMode } = usePriceMode();

  const loadData = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(undefined);

    try {
      const [categoriesRes, productsRes] = await Promise.all([
        listCategoriesForShop(supabase),
        listActiveProductsForShop(supabase),
      ]);

      if (categoriesRes.error) {
        console.error('Error loading categories:', categoriesRes.error);
      }

      if (categoriesRes.data) {
        setCategories((categoriesRes.data as CategoryRow[]).map(mapCategoryRow));
      }

      if (productsRes.error) {
        setStatus('error');
        setErrorMessage('Produkte konnten nicht geladen werden. Bitte prüfe deine Verbindung und versuche es erneut.');
        return;
      }

      if (productsRes.data) {
        setProducts((productsRes.data as ProductRowWithCategory[]).map(mapProductRow));
      }
      setStatus('success');
    } catch (error) {
      console.error('Error loading data:', error);
      setStatus('error');
      setErrorMessage('Konnte Daten nicht laden. Bitte prüfe deine Verbindung und versuche es erneut.');
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (hasAppliedInitialCategoryParam || categories.length === 0) {
      return;
    }

    const categoryParam = normalizeCategoryToken(searchParams.get('category') ?? '');
    if (!categoryParam) {
      setHasAppliedInitialCategoryParam(true);
      return;
    }

    const matchingCategory = categories.find((category) => {
      const normalizedSlug = normalizeCategoryToken(category.slug ?? '');
      const normalizedName = normalizeCategoryToken(category.name ?? '');
      return (
        normalizedSlug === categoryParam ||
        normalizedName === categoryParam ||
        normalizedSlug.includes(categoryParam) ||
        categoryParam.includes(normalizedSlug) ||
        normalizedName.includes(categoryParam)
      );
    });

    if (matchingCategory) {
      setSelectedCategory(matchingCategory.id);
    }

    setHasAppliedInitialCategoryParam(true);
  }, [categories, hasAppliedInitialCategoryParam, searchParams]);

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
  const activeTagFilterCount = activeFilters.tags.length;
  const filterToggleLabel =
    !showFilters && activeTagFilterCount > 0
      ? `Weitere Filter einblenden (${activeTagFilterCount} aktiv)`
      : showFilters
        ? 'Filter ausblenden'
        : 'Weitere Filter einblenden';

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

  const handleAddToInquiry = (productId: string, productSlug?: string | null) => {
    addToInquiry(productId, productSlug);
    showToast('success', 'Produkt zur Anfrageliste hinzugefügt');
  };

  const handleRemoveFromInquiry = (productId: string, productSlug?: string | null) => {
    removeFromInquiry(productId, productSlug);
    showToast('info', 'Produkt von der Anfrageliste entfernt');
  };

  return (
    <div className="bg-app-bg text-white min-h-screen pb-24 md:pb-0">
      <section className="section-shell !py-8 md:!py-10 bg-gradient-to-br from-blue-900/20 via-app-bg to-app-bg">
        <div className="content-container">
          <div className="mx-auto max-w-3xl text-center">
            <a
              href="/"
              className="focus-ring interactive mb-2 inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-sm text-gray-300 hover:text-white"
            >
              <ChevronLeft size={16} />
              <span>Zurück zur Startseite</span>
            </a>
            <h1 className="section-title mb-3 font-bold">Mietshop für Eventtechnik</h1>
            <p className="section-copy !mt-0 mb-5 text-gray-200">
              Wählen Sie die passende Technik für Ihr Event. Wir beraten bei Bedarf persönlich und erstellen ein klares, unverbindliches Angebot – in der Regel innerhalb von 24 Stunden.
            </p>
            <div className="mx-auto flex max-w-2xl justify-center">
              <SearchBar onSearch={setSearchQuery} initialQuery={searchQuery} />
            </div>
            <PriceModeToggle className="mt-4 flex justify-center" />
          </div>
        </div>
      </section>

      <section className="section-shell--tight sticky top-[4.7rem] z-40 border-subtle-bottom bg-card-bg/92 py-5 backdrop-blur-sm sm:top-[5rem] md:py-6">
        <div className="content-container">
          <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              aria-pressed={selectedCategory === 'all'}
              className={`focus-ring tap-target interactive rounded-lg px-5 py-2.5 text-sm font-medium ${
                selectedCategory === 'all'
                  ? 'border border-blue-400/70 bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'glass-panel--soft border-subtle text-gray-200 hover:text-white'
              }`}
            >
              Alle Kategorien
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={selectedCategory === cat.id}
                className={`focus-ring tap-target interactive rounded-lg px-5 py-2.5 text-sm font-medium ${
                  selectedCategory === cat.id
                    ? 'border border-blue-400/70 bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'glass-panel--soft border-subtle text-gray-200 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {availableTags.length > 0 ? (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                aria-expanded={showFilters}
                aria-controls="shop-detail-filters"
                className="btn-secondary focus-ring tap-target interactive inline-flex items-center gap-2 text-sm"
              >
                <SlidersHorizontal size={16} />
                <span>{filterToggleLabel}</span>
              </button>
            </div>
          ) : null}

          {inquiryList.length > 0 && (
            <div className="mt-6 flex justify-center">
              <a
                href="/mietshop/anfrage"
                className="btn-primary focus-ring tap-target interactive inline-flex items-center justify-center gap-2 group text-center"
              >
                <ShoppingBag className="icon-std group-hover:rotate-12 transition-transform" />
                <span>Mietanfrage für {inquiryList.length} Produkt{inquiryList.length !== 1 ? 'e' : ''} stellen</span>
                <ArrowRight className="icon-std icon-std--sm group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="section-shell">
        <div className="content-container">
          {availableTags.length > 0 && showFilters && (
            <div id="shop-detail-filters" className="mb-8 md:mb-10">
              <ProductFilters
                availableFilters={{ tags: availableTags, categories: [] }}
                activeFilters={activeFilters}
                onFilterChange={setActiveFilters}
              />
            </div>
          )}

          {searchQuery && (
            <div className="mb-6 text-sm text-gray-300">
              Suchergebnisse für "{searchQuery}" ({filteredProducts.length})
            </div>
          )}

          {status === 'loading' ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <ProductCardSkeleton key={i} />)}
            </div>
          ) : status === 'error' ? (
            <div className="glass-panel--soft card px-6 py-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="icon-std icon-std--lg text-red-300" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-white">Konnte Daten nicht laden</h2>
              <p className="mx-auto mb-6 max-w-[48ch] text-gray-300">
                {errorMessage ?? 'Beim Laden der Produkte ist ein Fehler aufgetreten. Bitte prüfe deine Verbindung.'}
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void loadData()}
                  className="btn-primary focus-ring tap-target interactive"
                >
                  Erneut versuchen
                </button>
                <a href="/" className="btn-secondary focus-ring tap-target interactive">
                  Zur Startseite
                </a>
              </div>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="mx-auto max-w-3xl">
              <div className="glass-panel p-12 text-center">
                <SearchX className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                <h2 className="text-xl font-bold">Kein exaktes Match gefunden</h2>
                <p className="mx-auto mt-4 max-w-[62ch] text-gray-300">
                  Wir haben aktuell kein exaktes Match in unserem Online-Katalog. Kontaktieren Sie uns trotzdem - wir
                  haben Zugriff auf ein großes Partner-Netzwerk und können fast jedes Equipment organisieren!
                </p>
                <a
                  href="/?subject=Mietshop#kontakt"
                  className="btn-primary focus-ring tap-target interactive mt-8 inline-flex items-center justify-center"
                >
                  Unverbindlich anfragen
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 text-sm text-gray-300">
                {visibleProducts.length} von {filteredProducts.length} Produkten angezeigt
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                {visibleProducts.map(product => (
                  <ShopProductCard
                    key={product.id}
                    product={product}
                    priceMode={priceMode}
                    inInquiry={isInInquiry(product.id, product.slug)}
                    onQuickView={() => setQuickViewProduct(product)}
                    onAddToInquiry={() => handleAddToInquiry(product.id, product.slug)}
                    onRemoveFromInquiry={() => handleRemoveFromInquiry(product.id, product.slug)}
                  />
                ))}
              </div>
              {hasMoreProducts && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleProductCount((current) => current + PRODUCTS_PER_BATCH)}
                    className="btn-secondary focus-ring tap-target interactive"
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
            <h2 className="section-title mb-6 font-bold">Sie möchten die Auswahl abstimmen?</h2>
            <p className="section-copy mb-8 text-gray-200">
              Wir unterstützen bei Auswahl und Planung – für Miete oder Full-Service, passend zu Format, Ablauf und Budget.
            </p>
            <a
              href="/kontakt"
              className="btn-primary focus-ring tap-target interactive inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <span>Unverbindliches Angebot anfragen</span>
              <ArrowRight className="icon-std" />
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
          isInInquiry={isInInquiry(quickViewProduct.id, quickViewProduct.slug)}
        />
      )}

      <MobileStickyCTA
        label="Unverbindlich anfragen"
        isVisible={showStickyCta}
        onClick={() => navigate('/mietshop/anfrage')}
      />
    </div>
  );
}



