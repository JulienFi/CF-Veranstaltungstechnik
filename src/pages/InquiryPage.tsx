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
import { createInquiry } from '../services/inquiryService';
import {
  getActiveProductLookupByReference,
  listActiveProductLookupsByIds,
} from '../repositories/productRepository';

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
    errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
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
    'ich möchte ein Angebot anfragen.',
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
        'Senden Sie Ihre Anfrage für Mietshop oder Full-Service. Wir antworten in der Regel innerhalb von 24 Stunden.',
      canonical,
      ogImage: '/images/og-cf-veranstaltungstechnik.jpg',
      schemaData: {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Anfrage',
        description:
          'Anfrageformular für Mietshop und Full-Service – deutschlandweit verfügbar, Schwerpunkt Berlin/Brandenburg.',
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

      const { data, error } = await getActiveProductLookupByReference(supabase, candidate);

      if (error || !data) {
        return null;
      }

      return mapProductRow(data as ProductLookupRow);
    };

    const loadProductsByIds = async (ids: string[]): Promise<ProductSummary[]> => {
      if (ids.length === 0) {
        return [];
      }

      const { data, error } = await listActiveProductLookupsByIds(supabase, ids);

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

      await createInquiry({
        source: 'shop',
        inquiry_type: 'rental',
        name: formData.name.trim(),
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
      setSubmitError('Die Anfrage konnte nicht gesendet werden. Bitte prüfen Sie Ihre Angaben und versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const fieldClassName = 'field-control focus-ring';
  const fieldErrorClassName = 'field-control field-control--error focus-ring';

  if (submitted) {
    return (
      <div className="bg-app-bg text-white min-h-screen flex items-center justify-center p-4">
        <div className="content-container">
          <div className="glass-panel card mx-auto max-w-2xl px-6 py-10 text-center md:px-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="icon-std icon-std--lg text-green-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Vielen Dank für Ihre Anfrage!</h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Wir haben Ihre Anfrage erhalten und melden uns in der Regel innerhalb von 24 Stunden mit den nächsten Schritten.
            </p>
            <div className="mb-4 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/mietshop"
                className="btn-primary focus-ring tap-target interactive"
              >
                Zurück zum Shop
              </a>
              <a
                href="/"
                className="btn-secondary focus-ring tap-target interactive"
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
                className="focus-ring tap-target interactive inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/70 bg-emerald-500 px-6 py-3 font-medium text-white hover:bg-emerald-600"
              >
                <MessageCircle className="icon-std" />
                <span>Rückfrage per WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell bg-app-bg text-white min-h-screen">
      <div className="content-container">
        <BackButton href="/mietshop" label="Zurück zum Shop" className="mb-6 md:mb-8" />

        <div className="mx-auto max-w-4xl">
          <h1 className="section-title mb-4 font-bold">Angebotsanfrage</h1>
          <p className="section-copy mb-8 text-gray-200 md:mb-12">
            Wenige Angaben reichen für den Start. Wir melden uns mit einer passenden Lösung für Miete oder Full-Service.
          </p>

          {prefilledProduct && (
            <div className="glass-panel card border-blue-500/30 p-4 md:p-5 mb-6">
              <p className="text-sm text-blue-300 mb-3">Ihre aktuelle Anfrageposition:</p>
              <div className="flex items-center gap-4">
                <img
                  src={resolveImageUrl(prefilledProduct.image_url, 'product', prefilledProduct.slug ?? prefilledProduct.name)}
                  alt={prefilledProduct.name}
                  className="card-inner border-subtle h-20 w-20 object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="text-lg font-semibold">{prefilledProduct.name}</p>
                  <p className="text-sm text-gray-300">{prefilledProduct.categoryName || 'Mietshop Produkt'}</p>
                </div>
              </div>
            </div>
          )}

          {(queryContext.category || queryContext.tags.length > 0) && (
            <div className="glass-panel--soft card-inner p-4 mb-6 text-sm text-gray-200">
              {queryContext.category && <p>Kategorie-Kontext: {queryContext.category}</p>}
              {queryContext.tags.length > 0 && <p>Tags-Kontext: {queryContext.tags.join(', ')}</p>}
            </div>
          )}

          {products.length > 0 && (
            <div className="glass-panel card p-5 md:p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Ausgewählte Produkte ({products.length})</h2>
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="glass-panel--soft card-inner flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-300">{product.categoryName || 'Mietshop Produkt'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="focus-ring tap-target interactive inline-flex items-center justify-center rounded-lg text-gray-300 hover:text-red-300"
                      aria-label="Produkt entfernen"
                    >
                      <X className="icon-std" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} onFocusCapture={markStartQuote} className="glass-panel card p-5 space-y-6 md:p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <div>
                <label htmlFor="inquiry-name" className="mb-2 block text-sm font-medium">Name *</label>
                <input
                  id="inquiry-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={touchedFields.name && validationErrors.name ? fieldErrorClassName : fieldClassName}
                  aria-invalid={touchedFields.name && Boolean(validationErrors.name)}
                  aria-describedby={touchedFields.name && validationErrors.name ? 'inquiry-name-error' : undefined}
                />
                {touchedFields.name && validationErrors.name && (
                  <p id="inquiry-name-error" className="mt-2 text-sm text-red-300">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="inquiry-email" className="mb-2 block text-sm font-medium">E-Mail</label>
                <input
                  id="inquiry-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  value={formData.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={touchedFields.email && validationErrors.email ? fieldErrorClassName : fieldClassName}
                  aria-invalid={touchedFields.email && Boolean(validationErrors.email)}
                  aria-describedby={touchedFields.email && validationErrors.email ? 'inquiry-email-error' : undefined}
                />
                {touchedFields.email && validationErrors.email && (
                  <p id="inquiry-email-error" className="mt-2 text-sm text-red-300">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="inquiry-phone" className="mb-2 block text-sm font-medium">Telefon</label>
                <input
                  id="inquiry-phone"
                  type="tel"
                  name="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="inquiry-date" className="mb-2 block text-sm font-medium">Datum (optional)</label>
                <input
                  id="inquiry-date"
                  type="date"
                  name="event-date"
                  autoComplete="off"
                  value={formData.eventDate}
                  onChange={(event) => updateField('eventDate', event.target.value)}
                  onBlur={() => handleBlur('eventDate')}
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="inquiry-location" className="mb-2 block text-sm font-medium">Ort (optional)</label>
                <input
                  id="inquiry-location"
                  type="text"
                  name="address-level2"
                  autoComplete="address-level2"
                  value={formData.eventLocation}
                  onChange={(event) => updateField('eventLocation', event.target.value)}
                  onBlur={() => handleBlur('eventLocation')}
                  className={fieldClassName}
                  placeholder="z. B. Berlin, Halle 3"
                />
              </div>

              <div>
                <label htmlFor="inquiry-eventtype" className="mb-2 block text-sm font-medium">Eventtyp (optional)</label>
                <input
                  id="inquiry-eventtype"
                  type="text"
                  name="event-type"
                  autoComplete="off"
                  value={formData.eventType}
                  onChange={(event) => updateField('eventType', event.target.value)}
                  onBlur={() => handleBlur('eventType')}
                  className={fieldClassName}
                  placeholder="z. B. Firmenfeier, Hochzeit"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="inquiry-budget" className="mb-2 block text-sm font-medium">Budget (optional)</label>
                <input
                  id="inquiry-budget"
                  type="text"
                  name="budget"
                  autoComplete="off"
                  value={formData.budget}
                  onChange={(event) => updateField('budget', event.target.value)}
                  onBlur={() => handleBlur('budget')}
                  className={fieldClassName}
                  placeholder="z. B. 2.000 - 3.000 EUR"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="inquiry-message" className="mb-2 block text-sm font-medium">Nachricht *</label>
                <textarea
                  id="inquiry-message"
                  name="message"
                  autoComplete="off"
                  value={formData.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  onBlur={() => handleBlur('message')}
                  rows={6}
                  placeholder="Was wird benötigt, wie viele Personen, welche Besonderheiten?"
                  className={`${touchedFields.message && validationErrors.message ? fieldErrorClassName : fieldClassName} resize-none`}
                  aria-invalid={touchedFields.message && Boolean(validationErrors.message)}
                  aria-describedby={touchedFields.message && validationErrors.message ? 'inquiry-message-error' : undefined}
                />
                {touchedFields.message && validationErrors.message && (
                  <p id="inquiry-message-error" className="mt-2 text-sm text-red-300">{validationErrors.message}</p>
                )}
              </div>
            </div>

            {(touchedFields.contact || touchedFields.email || touchedFields.phone) && validationErrors.contact && (
              <div className="card-inner rounded-lg border border-red-500/40 bg-red-500/10 p-4" role="alert" aria-live="polite">
                <p className="text-sm text-red-300">{validationErrors.contact}</p>
              </div>
            )}

            <div className="glass-panel--soft card-inner border-blue-400/25 p-4">
              <p className="text-sm text-gray-300">
                Unverbindlich und klar: Wir antworten in der Regel innerhalb von 24 Stunden.
              </p>
            </div>

            {submitError && (
              <div className="card-inner rounded-lg border border-red-500/30 bg-red-500/10 p-4" role="alert" aria-live="polite">
                <p className="text-sm text-red-300">{submitError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary focus-ring tap-target interactive inline-flex w-full items-center justify-center gap-2 text-base disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="icon-std" />
                <span>{loading ? 'Wird gesendet...' : 'Angebot anfragen (Antwort in der Regel innerhalb von 24 Stunden)'}</span>
              </button>

              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                  className="focus-ring tap-target interactive inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/70 bg-emerald-500 px-6 py-4 text-base font-semibold text-white hover:bg-emerald-600"
                >
                  <MessageCircle className="icon-std" />
                  <span>Per WhatsApp abstimmen</span>
                  <ExternalLink className="icon-std icon-std--sm" />
                </a>
              ) : (
                <a
                  href={COMPANY_INFO.contact.phoneLink}
                  className="focus-ring tap-target interactive inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/70 bg-emerald-500 px-6 py-4 text-base font-semibold text-white hover:bg-emerald-600"
                >
                  <MessageCircle className="icon-std" />
                  <span>Per WhatsApp abstimmen</span>
                </a>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


