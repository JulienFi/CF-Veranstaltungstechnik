import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Package, Target, Plus } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
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
    try {
      const { data, error } = await getActiveProductBySlug(supabase, slug);

      if (error) throw error;
      if (data) {
        const mappedProduct = mapProductRow(data as ProductQueryRow);
        setProduct(mappedProduct);
        if (mappedProduct.category_id) {
          void loadRelatedProducts(mappedProduct.category_id, mappedProduct.id);
        }
        addToRecentlyViewed(mappedProduct.id);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
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
    showToast('success', 'Produkt zur Anfrageliste hinzugefÃƒÂ¼gt');
  };

  const isProductInInquiry = product ? isInInquiry(product.id) : false;

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl mb-4">Produkt nicht gefunden</h1>
          <a href="/mietshop" className="text-blue-400 hover:text-blue-300">ZurÃƒÂ¼ck zum Shop</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-bg text-white min-h-screen pb-24 md:pb-0">
      <section className="py-8 md:py-12 bg-card-bg/50">
        <div className="container mx-auto px-4">
          <BackButton href="/mietshop" label="ZurÃƒÂ¼ck zum Shop" className="mb-6" />
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Mietshop', href: '/mietshop' },
              { label: product.categories.name, href: '/mietshop' },
              { label: product.name }
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <div>
              <div className="aspect-square bg-gradient-to-br from-card-hover to-card-bg rounded-xl flex items-center justify-center border border-gray-800 overflow-hidden">
                <img
                  src={resolveImageUrl(product.image_url, 'product', product.slug)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium">
                  {product.categories.name}
                </span>
                {product.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-card-hover text-gray-300 rounded-lg text-sm">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">{product.short_description}</p>
              <div className="mb-8">
                <div className="mb-3">
                  <PriceModeToggle />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Preis</p>
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

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                {isProductInInquiry ? (
                  <a
                    href={`/mietshop/anfrage?product=${encodeURIComponent(product.slug || product.id)}`}
                    className="flex-1 px-8 py-4 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition-all font-semibold text-lg flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Zur Angebotsanfrage</span>
                  </a>
                ) : (
                  <button
                    onClick={() => handleAddToInquiry(product.id)}
                    className="flex-1 px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-lg flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Zur Anfrageliste hinzufÃƒÂ¼gen</span>
                  </button>
                )}
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span>Geeignet fÃƒÂ¼r</span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{product.suitable_for}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                    <Package className="w-5 h-5 text-blue-400" />
                    <span>Lieferumfang</span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{product.scope_of_delivery}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card-bg/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold mb-6">Beschreibung</h2>
            <p className="text-gray-300 leading-relaxed text-lg mb-12">{product.full_description}</p>

            <h2 className="text-3xl font-bold mb-6">Technische Spezifikationen</h2>
            <div className="bg-card-bg border border-gray-800 rounded-xl overflow-hidden">
              {product.specs.map((spec, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-6 ${
                    index !== product.specs.length - 1 ? 'border-b border-gray-800' : ''
                  }`}
                >
                  <div className="font-medium text-gray-400">{spec.label}</div>
                  <div className="text-white">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Passende ErgÃƒÂ¤nzungen</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map(relatedProduct => (
                <a
                  key={relatedProduct.id}
                  href={`/mietshop/${relatedProduct.slug}`}
                  className="bg-card-bg border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/10 group"
                >
                  <div className="aspect-video bg-gradient-to-br from-card-hover to-card-bg flex items-center justify-center overflow-hidden">
                    <img
                      src={resolveImageUrl(relatedProduct.image_url, 'product', relatedProduct.slug)}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{relatedProduct.short_description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-card-bg/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Noch Fragen?</h2>
            <p className="text-gray-300 text-lg mb-8">
              Unsere Experten beraten Sie gerne zu diesem Produkt und erstellen Ihnen ein individuelles Angebot.
            </p>
            <a
              href="/kontakt"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-lg"
            >
              <span>Jetzt Kontakt aufnehmen</span>
              <ArrowRight className="w-5 h-5" />
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

