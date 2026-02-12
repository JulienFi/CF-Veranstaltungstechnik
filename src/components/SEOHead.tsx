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
import { getPageMeta, SITE_URL } from '../lib/seo';
import { setupAnalyticsScript } from '../lib/analytics';

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
  const meta = getPageMeta(pageKey);
  const title = customTitle || meta.title;
  const description = customDescription || meta.description;
  const image = customImage || meta.ogImage || '/og-default.jpg';
  const canonicalUrl = meta.canonicalUrl || `${SITE_URL}${window.location.pathname}`;

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
    setMetaTag('og:image', `${SITE_URL}${image}`, 'property');
    setMetaTag('og:locale', 'de_DE', 'property');
    setMetaTag('og:site_name', 'CF Veranstaltungstechnik', 'property');

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', `${SITE_URL}${image}`);

    // Schema.org JSON-LD
    if (schemaData) {
      setJSONLD('schema-org', schemaData);
    }
  }, [pageKey, title, description, image, canonicalUrl, meta, schemaData]);

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
  let element = document.getElementById(id);

  if (!element) {
    element = document.createElement('script');
    element.id = id;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(data, null, 2);
}
