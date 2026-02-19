import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Package, Target, Plus, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductDetailSkeleton } from '../components/SkeletonLoader';
import Breadcrumb from '../components/Breadcrumb';
import BackButton from '../components/BackButton';
import ScrollToTop from '../components/ScrollToTop';
import { showToast } from '../lib/toast';
import { useInquiryList } from '../hooks/useInquiryList';
import { usePriceMode } from '../hooks/usePriceMode';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import type { Json } from '../lib/database.types';
import { resolveImageUrl } from '../utils/image';
import PriceDisplay from '../components/PriceDisplay';
import PriceModeToggle from '../components/PriceModeToggle';
import MobileStickyCTA from '../components/MobileStickyCTA';
import { navigate } from '../lib/navigation';
import { useSEO } from '../contexts/seo-state';
import { generateProductSchema } from '../lib/seo';
import { getBaseUrl } from '../lib/site';
import { getActiveProductBySlug, listRelatedByCategory } from '../repositories/productRepository';

interface ProductSpec {
  label: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  specs: ProductSpec[];
  suitable_for: string;
  scope_of_delivery: string;
  tags: string[];
  category_id: string;
  image_url?: string;
  price_net?: number | null;
  vat_rate?: number | null;
  show_price?: boolean;
  categories: {
    name: string;
  };
}

interface ProductDetailPageProps {
  slug: string;
}
type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface ProductQueryRow {
  id: string;
  name: string | null;
  slug: string | null;
  short_description: string | null;
  full_description: string | null;
  specs: Json | null;
  suitable_for: string | null;
  scope_of_delivery: string | null;
  tags: string[] | null;
  category_id: string | null;
  image_url: string | null;
  price_net: number | null;
  vat_rate: number | null;
  show_price: boolean | null;
  categories: {
    name: string | null;
  } | null;
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

function mapProductRow(row: ProductQueryRow): Product {
  return {
    id: row.id,
    name: row.name ?? '',
    slug: row.slug ?? '',
    short_description: row.short_description ?? '',
    full_description: row.full_description ?? '',
    specs: parseSpecs(row.specs),
    suitable_for: row.suitable_for ?? '',
    scope_of_delivery: row.scope_of_delivery ?? '',
    tags: row.tags ?? [],
    category_id: row.category_id ?? '',
    image_url: row.image_url ?? '',
    price_net: row.price_net,
    vat_rate: row.vat_rate,
    show_price: row.show_price ?? false,
    categories: {
      name: row.categories?.name ?? '',
    },
  };
}

function trimToLength(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

export default function ProductDetailPage({ slug }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [isNotFound, setIsNotFound] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const { addToInquiry, isInInquiry } = useInquiryList();
  const { priceMode } = usePriceMode();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { setSEO } = useSEO();

  const loadRelatedProducts = useCallback(async (categoryId: string, currentProductId: string) => {
    try {
      const { data, error } = await listRelatedByCategory(supabase, categoryId, currentProductId);

      if (error) {
        throw error;
      }

      if (data) {
        setRelatedProducts((data as ProductQueryRow[]).map(mapProductRow));
      }
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  }, []);

  const loadProduct = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(undefined);
    setIsNotFound(false);

    try {
      const { data, error } = await getActiveProductBySlug(supabase, slug);

      if (error) {
        if (error.code === 'PGRST116') {
          setProduct(null);
          setRelatedProducts([]);
          setIsNotFound(true);
          setStatus('success');
          return;
        }
        throw error;
      }

      if (!data) {
        setProduct(null);
        setRelatedProducts([]);
        setIsNotFound(true);
        setStatus('success');
        return;
      }

      const mappedProduct = mapProductRow(data as ProductQueryRow);
      setProduct(mappedProduct);
      if (mappedProduct.category_id) {
        void loadRelatedProducts(mappedProduct.category_id, mappedProduct.id);
      }
      addToRecentlyViewed(mappedProduct.id);
      setStatus('success');
    } catch (error) {
      console.error('Error loading product:', error);
      setProduct(null);
      setRelatedProducts([]);
      setStatus('error');
      setErrorMessage('Produktdaten konnten nicht geladen werden. Bitte prüfe deine Verbindung und versuche es erneut.');
    }
  }, [addToRecentlyViewed, loadRelatedProducts, slug]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCta(window.scrollY > window.innerHeight * 0.5);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const baseUrl = getBaseUrl();
    const canonicalSlug = encodeURIComponent((product?.slug || slug || '').trim());
    const canonical = `${baseUrl}/mietshop/${canonicalSlug}`;

    if (!product) {
      setSEO({
        title: 'Produkt mieten in Berlin | CF Veranstaltungstechnik',
        description: 'Entdecken Sie professionelle Veranstaltungstechnik im Mietshop von CF Veranstaltungstechnik.',
        canonical,
        ogImage: '/images/products/placeholder.png',
        schemaData: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Produktdetail',
          url: canonical,
        },
      });
      return;
    }

    const descriptionBase =
      product.short_description ||
      product.full_description ||
      `Jetzt ${product.name} bei CF Veranstaltungstechnik in Berlin mieten.`;
    const description = trimToLength(descriptionBase, 160);
    const imageUrl = resolveImageUrl(product.image_url, 'product', product.slug);

    setSEO({
      title: `${product.name} mieten in Berlin | CF Veranstaltungstechnik`,
      description,
      canonical,
      ogImage: imageUrl,
      schemaData: generateProductSchema(
        {
          name: product.name,
          description,
          imageUrl,
        },
        canonical
      ),
    });
  }, [product, slug, setSEO]);

  const handleAddToInquiry = (productId: string) => {
    addToInquiry(productId);
    showToast('success', 'Produkt zur Anfrageliste hinzugefügt');
  };

  const isProductInInquiry = product ? isInInquiry(product.id) : false;
  const categoryLabel = product?.categories?.name?.trim() || 'Produkt';
  const shortDescription =
    product?.short_description?.trim() ||
    'Für dieses Produkt liegt aktuell keine Kurzbeschreibung vor. Wir beraten Sie gerne persönlich.';
  const fullDescription =
    product?.full_description?.trim() ||
    'Für dieses Produkt liegt aktuell keine ausführliche Beschreibung vor. Sprechen Sie uns an, wir helfen bei der Auswahl.';
  const suitableForDescription =
    product?.suitable_for?.trim() ||
    'Wir beraten Sie gern, ob dieses Produkt zu Ihrem Einsatz passt.';
  const scopeOfDeliveryDescription =
    product?.scope_of_delivery?.trim() ||
    'Den genauen Lieferumfang stimmen wir passend zu Ihrem Bedarf mit Ihnen ab.';
  const hasSpecs = Array.isArray(product?.specs) && product.specs.length > 0;

  if (status === 'loading' || status === 'idle') {
    return <ProductDetailSkeleton />;
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center px-4">
        <div className="glass-panel--soft card max-w-2xl text-center px-6 py-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="icon-std icon-std--lg text-red-300" />
          </div>
          <h1 className="mb-3 text-2xl font-semibold text-white">Konnte Daten nicht laden</h1>
          <p className="mx-auto mb-6 max-w-[52ch] text-gray-300">
            {errorMessage ?? 'Beim Laden ist ein Fehler aufgetreten. Bitte prüfe deine Verbindung.'}
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void loadProduct()}
              className="btn-primary focus-ring tap-target interactive"
            >
              Erneut versuchen
            </button>
            <a href="/mietshop" className="btn-secondary focus-ring tap-target interactive">
              Zurück zum Shop
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isNotFound || !product) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center px-4">
        <div className="glass-panel--soft card max-w-xl text-center px-6 py-8">
          <h1 className="mb-4 text-2xl font-semibold text-white">Produkt nicht gefunden</h1>
          <a href="/mietshop" className="interactive-link focus-ring interactive rounded px-1 py-1 text-blue-300 hover:text-blue-200">Zurück zum Shop</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-bg text-white min-h-screen pb-24 md:pb-0">
      <section className="section-shell section-shell--tight bg-card-bg/50">
        <div className="content-container">
          <BackButton href="/mietshop" label="Zurück zum Shop" className="mb-6 md:mb-8" />
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Mietshop', href: '/mietshop' },
              { label: categoryLabel, href: '/mietshop' },
              { label: product.name }
            ]}
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 md:gap-10">
            <div>
              <div className="glass-panel card overflow-hidden">
                <img
                  src={resolveImageUrl(product.image_url, 'product', product.slug)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>

            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="card-inner rounded-md bg-blue-500/14 px-3 py-1.5 text-sm font-medium text-blue-300">
                  {categoryLabel}
                </span>
                {product.tags.map(tag => (
                  <span key={tag} className="glass-panel--soft card-inner px-3 py-1.5 text-sm text-gray-200">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="section-title mb-4 font-bold">{product.name}</h1>
              <p className="section-copy mb-8 text-gray-200">{shortDescription}</p>
              <div className="glass-panel--soft card-inner mb-8 p-4 md:mb-10 md:p-5">
                <div className="mb-3">
                  <PriceModeToggle />
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-300">Preis</p>
                  <div className="text-3xl">
                    <PriceDisplay
                      priceNet={product.price_net}
                      showPrice={product.show_price}
                      vatRate={product.vat_rate}
                      mode={priceMode}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-10 flex flex-col gap-3 sm:flex-row md:mb-12">
                {isProductInInquiry ? (
                  <a
                    href={`/mietshop/anfrage?product=${encodeURIComponent(product.slug || product.id)}`}
                    className="btn-primary focus-ring tap-target interactive flex-1 text-center text-base md:text-lg"
                  >
                    <CheckCircle2 className="icon-std" />
                    <span>Zur Angebotsanfrage</span>
                  </a>
                ) : (
                  <button
                    onClick={() => handleAddToInquiry(product.id)}
                    className="btn-primary focus-ring tap-target interactive flex-1 text-base md:text-lg"
                  >
                    <Plus className="icon-std" />
                    <span>Zur Anfrageliste hinzufügen</span>
                  </button>
                )}
              </div>

              <div className="space-y-4 md:space-y-5">
                <div className="glass-panel--soft card-inner p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-xl font-bold">
                    <Target className="icon-std text-blue-400" />
                    <span>Geeignet für</span>
                  </h3>
                  <p className="text-gray-200 leading-relaxed">{suitableForDescription}</p>
                </div>

                <div className="glass-panel--soft card-inner p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-xl font-bold">
                    <Package className="icon-std text-blue-400" />
                    <span>Lieferumfang</span>
                  </h3>
                  <p className="text-gray-200 leading-relaxed">{scopeOfDeliveryDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-card-bg/50">
        <div className="content-container">
          <div className="max-w-4xl">
            <h2 className="section-title mb-6 font-bold">Beschreibung</h2>
            <p className="mb-10 text-lg leading-relaxed text-gray-200 md:mb-12">{fullDescription}</p>

            <h2 className="section-title mb-6 font-bold">Technische Spezifikationen</h2>
            <div className="glass-panel--soft card-inner overflow-hidden">
              {hasSpecs ? (
                product.specs.map((spec, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-1 gap-3 p-5 md:grid-cols-2 md:gap-4 md:p-6 ${
                      index !== product.specs.length - 1 ? 'border-subtle-bottom' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-300">{spec.label}</div>
                    <div className="text-white">{spec.value}</div>
                  </div>
                ))
              ) : (
                <div className="p-5 text-gray-200 md:p-6">
                  Technische Spezifikationen werden gerade ergänzt. Gern senden wir Ihnen alle Details auf Anfrage.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="section-shell">
          <div className="content-container">
            <h2 className="section-title mb-8 font-bold">Passende Ergänzungen</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {relatedProducts.map(relatedProduct => (
                <a
                  key={relatedProduct.id}
                  href={`/mietshop/${relatedProduct.slug}`}
                  className="glass-panel card interactive-card focus-ring group overflow-hidden"
                >
                  <div className="card-inner aspect-video overflow-hidden bg-gradient-to-br from-card-hover to-card-bg">
                    <img
                      src={resolveImageUrl(relatedProduct.image_url, 'product', relatedProduct.slug)}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 md:p-6">
                    <h3 className="mb-2 text-lg font-bold transition-colors group-hover:text-blue-300">
                      {relatedProduct.name}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-relaxed text-gray-300">{relatedProduct.short_description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-shell bg-card-bg/50">
        <div className="content-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="section-title mb-6 font-bold">Noch Fragen?</h2>
            <p className="section-copy mb-8 text-gray-200">
              Unsere Experten beraten Sie gerne zu diesem Produkt und erstellen Ihnen ein individuelles Angebot.
            </p>
            <a
              href="/kontakt"
              className="btn-primary focus-ring tap-target interactive inline-flex items-center gap-2"
            >
              <span>Jetzt Kontakt aufnehmen</span>
              <ArrowRight className="icon-std" />
            </a>
          </div>
        </div>
      </section>

      <ScrollToTop />

      <MobileStickyCTA
        label="Dieses Produkt anfragen"
        isVisible={showStickyCta}
        onClick={() => navigate(`/mietshop/anfrage?product=${encodeURIComponent(product.slug || product.id)}`)}
      />
    </div>
  );
}

