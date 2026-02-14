import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Send, MessageCircle, ExternalLink, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Json } from '../lib/database.types';
import BackButton from '../components/BackButton';
import { track } from '../lib/analytics';
import { useSEO } from '../contexts/seo-state';
import { getBaseUrl } from '../lib/site';
import { resolveImageUrl } from '../utils/image';
import { COMPANY_INFO } from '../config/company';
import { inquiryRepository } from '../repositories/inquiryRepository';

type CategoryRelation = { name: string | null } | Array<{ name: string | null }> | null;

interface ProductLookupRow {
  id: string;
  slug: string | null;
  name: string | null;
  image_url: string | null;
  categories: CategoryRelation;
}

interface ProductSummary {
  id: string;
  slug: string | null;
  name: string;
  image_url: string | null;
  categoryName: string;
}

interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  eventLocation: string;
  budget: string;
  message: string;
}

interface InquiryValidationErrors {
  name?: string;
  email?: string;
  contact?: string;
  message?: string;
}

interface QueryContext {
  productParam: string | null;
  category: string | null;
  tags: string[];
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

const INITIAL_FORM_DATA: InquiryFormData = {
  name: '',
  email: '',
  phone: '',
  eventType: '',
  eventDate: '',
  eventLocation: '',
  budget: '',
  message: '',
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getCategoryName(categories: CategoryRelation): string {
  if (Array.isArray(categories)) {
    return categories[0]?.name ?? '';
  }

  return categories?.name ?? '';
}

function mapProductRow(row: ProductLookupRow): ProductSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name ?? '',
    image_url: row.image_url,
    categoryName: getCategoryName(row.categories),
  };
}

function parseStoredInquiryList(raw: string | null): string[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  } catch {
    return [];
  }
}

function parseQueryContext(search: string): QueryContext {
  const params = new URLSearchParams(search);
  const tagsRaw = params.get('tags');

  return {
    productParam: params.get('product'),
    category: params.get('cat'),
    tags: tagsRaw
      ? tagsRaw
          .split(',')
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
      : [],
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateInquiryForm(formData: InquiryFormData): InquiryValidationErrors {
  const errors: InquiryValidationErrors = {};
  const name = formData.name.trim();
  const email = formData.email.trim();
  const phone = formData.phone.trim();
  const message = formData.message.trim();

  if (!name) {
    errors.name = 'Bitte geben Sie Ihren Namen ein.';
  }

  if (!email && !phone) {
    errors.contact = 'Bitte geben Sie mindestens E-Mail oder Telefonnummer an.';
  }

  if (email && !isValidEmail(email)) {
    errors.email = 'Bitte geben Sie eine gueltige E-Mail-Adresse ein.';
  }

  if (!message) {
    errors.message = 'Bitte beschreiben Sie kurz Ihre Anfrage.';
  }

  return errors;
}

function buildMessagePayload(formData: InquiryFormData, queryContext: QueryContext): string {
  const sections: string[] = [];
  const userMessage = formData.message.trim();

  if (userMessage) {
    sections.push(userMessage);
  }

  const contextLines: string[] = [];

  if (queryContext.category) {
    contextLines.push(`Kategorie-Kontext: ${queryContext.category}`);
  }

  if (queryContext.tags.length > 0) {
    contextLines.push(`Tag-Kontext: ${queryContext.tags.join(', ')}`);
  }

  if (formData.budget.trim()) {
    contextLines.push(`Budget: ${formData.budget.trim()}`);
  }

  if (contextLines.length > 0) {
    sections.push(`Kontext:\n${contextLines.join('\n')}`);
  }

  return sections.join('\n\n');
}

function buildWhatsAppMessage(
  formData: InquiryFormData,
  pageUrl: string,
  primaryProduct: ProductSummary | null,
  queryContext: QueryContext
): string {
  const lines: string[] = [
    'Hallo CF Veranstaltungstechnik,',
    'ich moechte ein Angebot anfragen.',
  ];

  if (primaryProduct) {
    lines.push(`Produkt: ${primaryProduct.name}`);
  }

  if (formData.eventDate.trim()) {
    lines.push(`Datum: ${formData.eventDate.trim()}`);
  }

  if (formData.eventLocation.trim()) {
    lines.push(`Ort: ${formData.eventLocation.trim()}`);
  }

  if (queryContext.category) {
    lines.push(`Kategorie: ${queryContext.category}`);
  }

  if (queryContext.tags.length > 0) {
    lines.push(`Tags: ${queryContext.tags.join(', ')}`);
  }

  lines.push(`Name: ${formData.name.trim() || '-'}`);

  if (formData.phone.trim()) {
    lines.push(`Telefon: ${formData.phone.trim()}`);
  } else if (formData.email.trim()) {
    lines.push(`E-Mail: ${formData.email.trim()}`);
  }

  if (formData.message.trim()) {
    lines.push(`Nachricht: ${formData.message.trim()}`);
  }

  lines.push(`Seitenlink: ${pageUrl}`);
  return lines.join('\n');
}

export default function InquiryPage() {
  const [inquiryList, setInquiryList] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [prefilledProduct, setPrefilledProduct] = useState<ProductSummary | null>(null);
  const [formData, setFormData] = useState<InquiryFormData>(INITIAL_FORM_DATA);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasWhatsAppClick, setHasWhatsAppClick] = useState(false);

  const hasTrackedStartQuote = useRef(false);
  const { setSEO } = useSEO();

  const pageUrl = useMemo(
    () => (typeof window !== 'undefined' ? window.location.href : ''),
    []
  );

  const queryContext = useMemo(
    () => parseQueryContext(typeof window !== 'undefined' ? window.location.search : ''),
    []
  );

  const validationErrors = useMemo(() => validateInquiryForm(formData), [formData]);
  const primaryProduct = prefilledProduct ?? products[0] ?? null;

  const whatsappHref = useMemo(() => {
    const phoneNumber = COMPANY_INFO.contact.phone.replace(/\D/g, '');
    if (!phoneNumber) {
      return null;
    }

    const message = buildWhatsAppMessage(formData, pageUrl, primaryProduct, queryContext);
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }, [formData, pageUrl, primaryProduct, queryContext]);

  useEffect(() => {
    const baseUrl = getBaseUrl();
    const canonical = `${baseUrl}/mietshop/anfrage`;

    setSEO({
      title: 'Anfrage | CF Veranstaltungstechnik',
      description:
        'Senden Sie Ihre unverbindliche Anfrage fuer Veranstaltungstechnik. Wir erstellen ein passendes Angebot fuer Ihr Event.',
      canonical,
      ogImage: '/images/og-cf-veranstaltungstechnik.jpg',
      schemaData: {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Anfrage',
        description:
          'Anfrageformular fuer Mietshop-Produkte und Veranstaltungstechnik in Berlin und Brandenburg.',
        url: canonical,
      },
    });
  }, [setSEO]);

  useEffect(() => {
    let isMounted = true;

    const resolveProductFromParam = async (value: string): Promise<ProductSummary | null> => {
      const candidate = value.trim();
      if (!candidate) {
        return null;
      }

      const baseQuery = supabase
        .from('products')
        .select('id, slug, name, image_url, categories(name)')
        .eq('is_active', true)
        .limit(1);

      const { data, error } = UUID_PATTERN.test(candidate)
        ? await baseQuery.eq('id', candidate).maybeSingle()
        : await baseQuery.eq('slug', candidate).maybeSingle();

      if (error || !data) {
        return null;
      }

      return mapProductRow(data as ProductLookupRow);
    };

    const loadProductsByIds = async (ids: string[]): Promise<ProductSummary[]> => {
      if (ids.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, slug, name, image_url, categories(name)')
        .in('id', ids)
        .eq('is_active', true);

      if (error || !data) {
        return [];
      }

      const mapped = (data as ProductLookupRow[]).map(mapProductRow);
      const byId = new Map(mapped.map((product) => [product.id, product]));
      return ids.map((id) => byId.get(id)).filter((item): item is ProductSummary => Boolean(item));
    };

    const initialize = async () => {
      const savedIds = parseStoredInquiryList(localStorage.getItem('inquiryList'));
      const resolvedProduct = queryContext.productParam
        ? await resolveProductFromParam(queryContext.productParam)
        : null;

      const mergedIds =
        resolvedProduct && !savedIds.includes(resolvedProduct.id)
          ? [resolvedProduct.id, ...savedIds]
          : savedIds;

      const loadedProducts = await loadProductsByIds(mergedIds);

      if (!isMounted) {
        return;
      }

      setPrefilledProduct(resolvedProduct);
      setInquiryList(mergedIds);
      setProducts(loadedProducts);
      localStorage.setItem('inquiryList', JSON.stringify(mergedIds));
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [queryContext.productParam]);

  const markStartQuote = () => {
    if (hasTrackedStartQuote.current) {
      return;
    }

    hasTrackedStartQuote.current = true;
    track('start_quote', {
      source_route: window.location.pathname,
      product_slug: primaryProduct?.slug ?? queryContext.productParam ?? '',
      product_id: primaryProduct?.id ?? '',
      has_prefill_product: Boolean(primaryProduct || queryContext.productParam),
    });
  };

  const updateField = (field: keyof InquiryFormData, value: string) => {
    markStartQuote();
    setTouchedFields((current) => {
      const next = { ...current, [field]: true };
      if (field === 'email' || field === 'phone') {
        next.contact = true;
      }
      return next;
    });
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleBlur = (field: keyof InquiryFormData | 'contact') => {
    setTouchedFields((current) => ({ ...current, [field]: true }));
  };

  const removeProduct = (productId: string) => {
    const nextIds = inquiryList.filter((id) => id !== productId);
    const nextProducts = products.filter((product) => product.id !== productId);

    setInquiryList(nextIds);
    setProducts(nextProducts);
    localStorage.setItem('inquiryList', JSON.stringify(nextIds));
    window.dispatchEvent(new Event('inquiry-updated'));
  };

  const handleWhatsAppClick = () => {
    setHasWhatsAppClick(true);
    track('whatsapp_click', {
      source_route: window.location.pathname,
      product_slug: primaryProduct?.slug ?? queryContext.productParam ?? '',
      product_id: primaryProduct?.id ?? '',
      has_message: formData.message.trim().length > 0,
      has_date: formData.eventDate.trim().length > 0,
      has_location: formData.eventLocation.trim().length > 0,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) {
      return;
    }
    setSubmitError(null);

    const hasValidationErrors = Object.keys(validationErrors).length > 0;
    if (hasValidationErrors) {
      setTouchedFields((current) => ({
        ...current,
        name: true,
        email: true,
        phone: true,
        contact: true,
        message: true,
      }));
      return;
    }

    setLoading(true);

    try {
      const selectedProductsData: Json = products.map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.categoryName,
      }));

      const messagePayload = buildMessagePayload(formData, queryContext);

      await inquiryRepository.createInquiry({
        inquiry_type: 'rental',
        name: formData.name.trim(),
        company: null,
        email: formData.email.trim() || '',
        phone: formData.phone.trim() || null,
        event_type: formData.eventType.trim() || null,
        event_date: formData.eventDate.trim() || null,
        event_location: formData.eventLocation.trim() || null,
        selected_products: products.length > 0 ? selectedProductsData : null,
        product_id: primaryProduct?.id ?? null,
        product_slug: primaryProduct?.slug ?? queryContext.productParam ?? null,
        product_name: primaryProduct?.name ?? null,
        source_url: pageUrl,
        utm_source: queryContext.utmSource,
        utm_medium: queryContext.utmMedium,
        utm_campaign: queryContext.utmCampaign,
        message: messagePayload || null,
        status: 'new',
      });

      localStorage.removeItem('inquiryList');
      window.dispatchEvent(new Event('inquiry-updated'));

      track('submit_quote', {
        source_route: window.location.pathname,
        product_id: primaryProduct?.id ?? '',
        product_slug: primaryProduct?.slug ?? queryContext.productParam ?? '',
        selected_products_count: products.length,
        has_whatsapp_click: hasWhatsAppClick,
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitError('Die Anfrage konnte nicht gesendet werden. Bitte pruefen Sie Ihre Angaben und versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-app-bg text-white min-h-screen flex items-center justify-center p-4">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Vielen Dank fuer Ihre Anfrage!</h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Wir haben Ihre Anfrage erhalten und melden uns in der Regel innerhalb von zwei Stunden mit den naechsten Schritten.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <a
                href="/mietshop"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium"
              >
                Zurueck zum Shop
              </a>
              <a
                href="/"
                className="px-6 py-3 bg-card-hover text-white rounded-lg hover:bg-gray-700 transition-all font-medium"
              >
                Zur Startseite
              </a>
            </div>
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all font-medium"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Rueckfrage per WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-bg text-white min-h-screen py-14 md:py-20">
      <div className="container mx-auto px-4">
        <BackButton href="/mietshop" label="Zurueck zum Shop" className="mb-8" />

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Angebotsanfrage</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 md:mb-12">
            Fuenf Felder reichen fuer den Start. Wir melden uns schnell mit einer passenden Loesung fuer Ihr Event.
          </p>

          {prefilledProduct && (
            <div className="bg-card-bg border border-blue-500/30 rounded-xl p-4 md:p-5 mb-6">
              <p className="text-sm text-blue-300 mb-3">Du fragst an fuer:</p>
              <div className="flex items-center gap-4">
                <img
                  src={resolveImageUrl(prefilledProduct.image_url, 'product', prefilledProduct.slug ?? prefilledProduct.name)}
                  alt={prefilledProduct.name}
                  className="w-20 h-20 rounded-lg object-cover border border-gray-700"
                  loading="lazy"
                />
                <div>
                  <p className="text-lg font-semibold">{prefilledProduct.name}</p>
                  <p className="text-sm text-gray-400">{prefilledProduct.categoryName || 'Mietshop Produkt'}</p>
                </div>
              </div>
            </div>
          )}

          {(queryContext.category || queryContext.tags.length > 0) && (
            <div className="bg-card-bg border border-gray-800 rounded-xl p-4 mb-6 text-sm text-gray-300">
              {queryContext.category && <p>Kategorie-Kontext: {queryContext.category}</p>}
              {queryContext.tags.length > 0 && <p>Tags-Kontext: {queryContext.tags.join(', ')}</p>}
            </div>
          )}

          {products.length > 0 && (
            <div className="bg-card-bg border border-gray-800 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Ausgewaehlte Produkte ({products.length})</h2>
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card-hover rounded-lg p-4"
                  >
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-400">{product.categoryName || 'Mietshop Produkt'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      aria-label="Produkt entfernen"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} onFocusCapture={markStartQuote} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  onBlur={() => handleBlur('name')}
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
                {touchedFields.name && validationErrors.name && (
                  <p className="text-sm text-red-300 mt-2">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-Mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  onBlur={() => handleBlur('email')}
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
                {touchedFields.email && validationErrors.email && (
                  <p className="text-sm text-red-300 mt-2">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Datum (optional)</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(event) => updateField('eventDate', event.target.value)}
                  onBlur={() => handleBlur('eventDate')}
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ort (optional)</label>
                <input
                  type="text"
                  value={formData.eventLocation}
                  onChange={(event) => updateField('eventLocation', event.target.value)}
                  onBlur={() => handleBlur('eventLocation')}
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="z. B. Berlin, Halle 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Eventtyp (optional)</label>
                <input
                  type="text"
                  value={formData.eventType}
                  onChange={(event) => updateField('eventType', event.target.value)}
                  onBlur={() => handleBlur('eventType')}
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="z. B. Firmenfeier, Hochzeit"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Budget (optional)</label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(event) => updateField('budget', event.target.value)}
                  onBlur={() => handleBlur('budget')}
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="z. B. 2.000 - 3.000 EUR"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Nachricht *</label>
                <textarea
                  value={formData.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  onBlur={() => handleBlur('message')}
                  rows={6}
                  placeholder="Was wird benoetigt, wie viele Personen, welche Besonderheiten?"
                  className="w-full px-4 py-3 bg-card-bg border border-gray-800 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                />
                {touchedFields.message && validationErrors.message && (
                  <p className="text-sm text-red-300 mt-2">{validationErrors.message}</p>
                )}
              </div>
            </div>

            {(touchedFields.contact || touchedFields.email || touchedFields.phone) && validationErrors.contact && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-300">{validationErrors.contact}</p>
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                Unverbindlich und schnell: Wir antworten in der Regel innerhalb von 2 Stunden.
              </p>
            </div>

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4" role="alert" aria-live="polite">
                <p className="text-sm text-red-300">{submitError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'Wird gesendet...' : 'Angebot anfragen (Antwort i.d.R. in 2h)'}</span>
              </button>

              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                  className="w-full px-6 py-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all font-semibold text-base flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Schnell per WhatsApp</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <a
                  href={COMPANY_INFO.contact.phoneLink}
                  className="w-full px-6 py-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all font-semibold text-base flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Schnell per WhatsApp</span>
                </a>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
