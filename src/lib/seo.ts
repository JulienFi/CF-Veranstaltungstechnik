/**
 * SEO-Konfiguration für CF Veranstaltungstechnik
 *
 * Zentrale Verwaltung aller Meta-Tags, Open Graph, Twitter Cards und Schema.org Daten
 */

import { COMPANY_INFO } from '../config/company';
import { getBaseUrl } from './site';

export interface PageMeta {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
}

/**
 * Standard-OG-Bild (CF Logo)
 */
export const DEFAULT_OG_IMAGE = '/images/og-cf-veranstaltungstechnik.jpg';

/**
 * Basis-URL der Website
 */
export const SITE_URL = getBaseUrl();

/**
 * Meta-Konfiguration für alle Seiten
 */
export const PAGE_META: Record<string, PageMeta> = {
  home: {
    title: 'CF Veranstaltungstechnik – Licht, Ton & Bühne für Events in Berlin & Brandenburg',
    description: 'CF Veranstaltungstechnik bietet professionelle Veranstaltungstechnik, Mietshop, technische Planung, Aufbau, Betreuung und Werkstattservice für Events in Berlin und Brandenburg.',
    keywords: 'Veranstaltungstechnik, Berlin, Brandenburg, Mühlenbecker Land, Eventtechnik, Lichttechnik, Tontechnik, DJ Equipment, Bühnentechnik, Mieten',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  mietshop: {
    title: 'Mietshop für Veranstaltungstechnik – Licht, Ton, DJ & Bühne | CF Veranstaltungstechnik',
    description: 'Mieten Sie professionelle Veranstaltungstechnik bei CF Veranstaltungstechnik. Von Lichttechnik über Tontechnik bis DJ-Equipment – alles für Ihr Event in Berlin & Brandenburg.',
    keywords: 'Veranstaltungstechnik mieten, Lichttechnik mieten, Tontechnik mieten, DJ Equipment mieten, Bühnentechnik mieten, Berlin, Brandenburg',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  dienstleistungen: {
    title: 'Technische Planung & Betreuung für Ihr Event | CF Veranstaltungstechnik',
    description: 'Professionelle Veranstaltungsplanung und technische Betreuung für Events in Berlin & Brandenburg. Von der Konzeption bis zur Durchführung – alles aus einer Hand.',
    keywords: 'Veranstaltungsplanung, technische Betreuung, Event-Service, Veranstaltungstechnik Service, Berlin, Brandenburg',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  werkstatt: {
    title: 'Werkstatt für Veranstaltungstechnik – Reparatur, Wartung & Sicherheit | CF Veranstaltungstechnik',
    description: 'Professionelle Werkstatt für Veranstaltungstechnik. Reparatur, Wartung, Sicherheitsprüfung und technischer Support in Mühlenbecker Land bei Berlin.',
    keywords: 'Veranstaltungstechnik Werkstatt, Reparatur, Wartung, Sicherheitsprüfung, technischer Support, Berlin, Brandenburg',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  projekte: {
    title: 'Projekte & Referenzen – CF Veranstaltungstechnik',
    description: 'Referenzprojekte von CF Veranstaltungstechnik: Hochzeiten, Firmenfeiern, Konzerte und Events in Berlin & Brandenburg. Sehen Sie unsere erfolgreichen Projekte.',
    keywords: 'Referenzen Veranstaltungstechnik, Event Projekte, Hochzeiten, Firmenfeiern, Konzerte, Berlin, Brandenburg',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  team: {
    title: 'Team – CF Veranstaltungstechnik',
    description: 'Lernen Sie das Team von CF Veranstaltungstechnik kennen. Erfahrene Techniker und Spezialisten für Ihre Veranstaltung in Berlin & Brandenburg.',
    keywords: 'Team Veranstaltungstechnik, Techniker, Event-Profis, Berlin, Brandenburg',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  kontakt: {
    title: 'Kontakt – CF Veranstaltungstechnik | Beratung & Angebot',
    description: `Kontaktieren Sie CF Veranstaltungstechnik für ein unverbindliches Angebot. Telefon: ${COMPANY_INFO.contact.phone} | ${COMPANY_INFO.address.full}`,
    keywords: 'Kontakt Veranstaltungstechnik, Angebot anfordern, Beratung, Berlin, Brandenburg, Mühlenbecker Land',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  anfrage: {
    title: 'Anfrage | CF Veranstaltungstechnik',
    description: 'Senden Sie Ihre unverbindliche Mietshop-Anfrage. Wir erstellen ein individuelles Angebot für Ihr Event in Berlin und Brandenburg.',
    keywords: 'Angebotsanfrage, Veranstaltungstechnik Anfrage, Mietshop Anfrage, Eventtechnik Berlin',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  impressum: {
    title: 'Impressum – CF Veranstaltungstechnik',
    description: 'Impressum und rechtliche Informationen von CF Veranstaltungstechnik, Mühlenbecker Land bei Berlin.',
    noindex: true,
  },

  datenschutz: {
    title: 'Datenschutzerklärung – CF Veranstaltungstechnik',
    description: 'Datenschutzerklärung von CF Veranstaltungstechnik. Informationen zur Datenverarbeitung gemäß DSGVO.',
    noindex: true,
  },
};

/**
 * Holt Meta-Daten für eine Seite
 */
export function getPageMeta(pageKey: string): PageMeta {
  return PAGE_META[pageKey] || PAGE_META.home;
}

/**
 * Generiert vollständigen Seitentitel mit Branding
 */
export function getFullTitle(pageTitle: string): string {
  if (pageTitle.includes('CF Veranstaltungstechnik')) {
    return pageTitle;
  }
  return `${pageTitle} | CF Veranstaltungstechnik`;
}

/**
 * Generiert Schema.org LocalBusiness JSON-LD
 */
export function generateLocalBusinessSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: COMPANY_INFO.name,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    '@id': SITE_URL,
    url: SITE_URL,
    telephone: COMPANY_INFO.contact.phone,
    email: COMPANY_INFO.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY_INFO.address.street,
      addressLocality: COMPANY_INFO.address.city,
      postalCode: COMPANY_INFO.address.postalCode,
      addressCountry: 'DE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 52.6333, // Mühlenbecker Land (ungefähr)
      longitude: 13.3833,
    },
    areaServed: COMPANY_INFO.serviceArea.map((area) => ({
      '@type': area.type,
      name: area.name,
    })),
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: [
      // Social Media Links (später hinzufügen)
      // COMPANY_INFO.social.facebook,
      // COMPANY_INFO.social.instagram,
    ],
  };
}

/**
 * Generiert Schema.org für Produkt-Seiten (später)
 */
interface ProductSchemaInput {
  name: string;
  description: string;
  imageUrl: string;
}

interface EventSchemaInput {
  title: string;
  description: string;
  location: string;
}

export function generateProductSchema(product: ProductSchemaInput, canonicalUrl?: string): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    brand: {
      '@type': 'Brand',
      name: COMPANY_INFO.name,
    },
  };

  if (canonicalUrl) {
    schema.url = canonicalUrl;
  }

  return schema;
}

/**
 * Generiert Schema.org für Events/Projekte (später)
 */
export function generateEventSchema(event: EventSchemaInput): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    location: {
      '@type': 'Place',
      name: event.location,
    },
    organizer: {
      '@type': 'Organization',
      name: COMPANY_INFO.name,
      url: SITE_URL,
    },
  };
}
