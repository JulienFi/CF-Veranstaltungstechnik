/**
 * SEO-Konfiguration für CF Veranstaltungstechnik
 *
 * Zentrale Verwaltung von Meta-Tags, Open Graph, Twitter Cards und Schema.org.
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
 * Standard-OG-Bild
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
    title: 'CF Veranstaltungstechnik | Eventtechnik in Berlin & Brandenburg',
    description:
      'Eventtechnik mieten oder Full-Service buchen: Wir planen, liefern und betreuen Ihr Event in Berlin, Brandenburg und deutschlandweit. Jetzt unverbindlich anfragen.',
    keywords:
      'Eventtechnik, Veranstaltungstechnik, Mietshop, Full-Service, Berlin, Brandenburg, deutschlandweit',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  mietshop: {
    title: 'Mietshop | Professionelle Veranstaltungstechnik leihen',
    description:
      'Professionelle Licht-, Ton- und B\u00fchnentechnik flexibel leihen. Transparent kalkuliert, schnell verf\u00fcgbar und pers\u00f6nlich beraten. Jetzt passende Technik finden.',
    keywords:
      'Mietshop Eventtechnik, Veranstaltungstechnik mieten, Lichttechnik, Tontechnik, Bühnentechnik',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  dienstleistungen: {
    title: 'Full-Service für Veranstaltungen | CF Veranstaltungstechnik',
    description:
      'Technikplanung, Aufbau, Betrieb und Abbau aus einer Hand. Aufbau nach festen Timings – pünktlich zum Einlass.',
    keywords: 'Full-Service Eventtechnik, Technikplanung, Veranstaltungsservice, Berlin, Brandenburg',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  werkstatt: {
    title: 'Werkstatt-Service für Eventtechnik | CF Veranstaltungstechnik',
    description:
      'Reparatur, Wartung und Sicherheitsprüfungen für verlässliche Veranstaltungstechnik im laufenden Einsatz.',
    keywords: 'Werkstatt Eventtechnik, Reparatur, Wartung, Sicherheitsprüfung',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  projekte: {
    title: 'Projekte & Referenzen | CF Veranstaltungstechnik',
    description:
      'Ausgewählte Referenzen aus realen Produktionen. Seit 2014 im Einsatz, rund 90 Events pro Jahr.',
    keywords: 'Referenzen Eventtechnik, Projekte Veranstaltungstechnik, Berlin, Brandenburg',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  team: {
    title: 'Team | CF Veranstaltungstechnik',
    description:
      'Kernteam mit ca. 6 Personen, je nach Eventgröße skalierbar mit eingespielter Crew.',
    keywords: 'Team Eventtechnik, Crew Veranstaltungstechnik',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  kontakt: {
    title: 'Kontakt & Angebot | CF Veranstaltungstechnik',
    description: `Unverbindlich anfragen: In der Regel erhalten Sie innerhalb von 24 Stunden eine Rückmeldung. Telefon: ${COMPANY_INFO.contact.phone}.`,
    keywords: 'Kontakt Eventtechnik, Angebot anfragen, Berlin, Brandenburg',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  anfrage: {
    title: 'Anfrage | CF Veranstaltungstechnik',
    description:
      'Anfrage für Mietshop oder Full-Service. Wir antworten in der Regel innerhalb von 24 Stunden.',
    keywords: 'Anfrage Eventtechnik, Mietshop Anfrage, Full-Service Anfrage',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },

  impressum: {
    title: 'Impressum | CF Veranstaltungstechnik',
    description:
      'Impressum und rechtliche Informationen von CF Veranstaltungstechnik.',
    noindex: true,
  },

  datenschutz: {
    title: 'Datenschutzerklärung | CF Veranstaltungstechnik',
    description:
      'Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.',
    noindex: true,
  },

  admin: {
    title: 'Admin-Bereich | CF Veranstaltungstechnik',
    description: 'Geschützter Verwaltungsbereich.',
    noindex: true,
  },

  notfound: {
    title: 'Seite nicht gefunden | CF Veranstaltungstechnik',
    description: 'Die angeforderte Seite konnte nicht gefunden werden.',
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
      // Social-Media-Links optional ergänzen
      // COMPANY_INFO.social.facebook,
      // COMPANY_INFO.social.instagram,
    ],
  };
}

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
