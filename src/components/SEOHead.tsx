/**
 * SEO Head Component
 *
 * Setzt dynamisch Meta-Tags, Open Graph, Twitter Cards und Schema.org JSON-LD
 * für jede Seite.
 *
 * Usage:
 * <SEOHead pageKey="home" />
 * <SEOHead pageKey="mietshop" />
 */

import { useEffect } from 'react';
import { useSEO } from '../contexts/seo-state';
import { getPageMeta, DEFAULT_OG_IMAGE } from '../lib/seo';
import { setupAnalyticsScript } from '../lib/analytics';
import { getBaseUrl, toAbsoluteUrl } from '../lib/site';

interface SEOHeadProps {
  pageKey: string;
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
  schemaData?: object;
}

export default function SEOHead({
  pageKey,
  customTitle,
  customDescription,
  customImage,
  schemaData,
}: SEOHeadProps) {
  const { seo } = useSEO();
  const meta = getPageMeta(pageKey);
  const baseUrl = getBaseUrl();
  const title = seo.title || customTitle || meta.title;
  const description = seo.description || customDescription || meta.description;
  const image = seo.ogImage || customImage || meta.ogImage || DEFAULT_OG_IMAGE;
  const canonicalUrl = seo.canonical || meta.canonicalUrl || `${baseUrl}${window.location.pathname}`;
  const effectiveSchemaData = seo.schemaData ?? schemaData;

  useEffect(() => {
    setupAnalyticsScript();
  }, []);

  useEffect(() => {
    // Title
    document.title = title;

    // Meta Description
    setMetaTag('description', description);

    // Keywords
    if (meta.keywords) {
      setMetaTag('keywords', meta.keywords);
    } else {
      removeMetaTag('keywords');
    }

    // Canonical URL
    setLinkTag('canonical', canonicalUrl);

    // Robots
    if (meta.noindex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow');
    }

    // Open Graph
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:description', description, 'property');
    setMetaTag('og:url', canonicalUrl, 'property');
    setMetaTag('og:type', meta.ogType || 'website', 'property');
    setMetaTag('og:image', toAbsoluteUrl(image), 'property');
    setMetaTag('og:locale', 'de_DE', 'property');
    setMetaTag('og:site_name', 'CF Veranstaltungstechnik', 'property');

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', toAbsoluteUrl(image));

    // Schema.org JSON-LD
    if (effectiveSchemaData) {
      setJSONLD('schema-org', effectiveSchemaData);
    } else {
      removeJSONLD('schema-org');
    }
  }, [pageKey, title, description, image, canonicalUrl, meta, effectiveSchemaData]);

  return null; // Dieser Component rendert nichts sichtbar
}

/**
 * Hilfsfunktion: Meta-Tag setzen oder aktualisieren
 */
function setMetaTag(
  name: string,
  content: string,
  attribute: 'name' | 'property' = 'name'
): void {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function removeMetaTag(name: string, attribute: 'name' | 'property' = 'name'): void {
  const element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (element) {
    element.remove();
  }
}

/**
 * Hilfsfunktion: Link-Tag setzen oder aktualisieren
 */
function setLinkTag(rel: string, href: string): void {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;

  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }

  element.href = href;
}

/**
 * Hilfsfunktion: JSON-LD Script setzen oder aktualisieren
 */
function setJSONLD(id: string, data: object): void {
  let element = document.getElementById(id) as HTMLScriptElement | null;

  if (!element) {
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
    element = script;
  }

  element.textContent = JSON.stringify(data, null, 2);
}

function removeJSONLD(id: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}
