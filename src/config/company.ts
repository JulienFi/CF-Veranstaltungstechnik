/**
 * Zentrale Konfiguration für Unternehmensstammdaten
 *
 * Hier können alle Firmendaten zentral verwaltet werden.
 * Änderungen an dieser Datei wirken sich automatisch auf die gesamte Website aus.
 */

export const COMPANY_INFO = {
  name: 'CF Veranstaltungstechnik',
  legalName: 'CF Veranstaltungstechnik',

  address: {
    street: 'Dorfstraße 1A',
    postalCode: '16567',
    city: 'Mühlenbecker Land',
    country: 'Deutschland',
    full: 'Dorfstraße 1A, 16567 Mühlenbecker Land'
  },

  contact: {
    phone: '+49 172 5780502',
    phoneLink: 'tel:+491725780502',
    email: 'info@cf-veranstaltungstechnik.de',
    emailLink: 'mailto:info@cf-veranstaltungstechnik.de'
  },

  serviceArea: [
    {
      type: 'City',
      name: 'Berlin'
    },
    {
      type: 'State',
      name: 'Brandenburg'
    }
  ],

  businessHours: {
    weekdays: 'Mo–Fr: 9:00–18:00 Uhr',
    weekend: 'Sa: Nach Vereinbarung',
    note: 'Termine außerhalb der Geschäftszeiten nach Absprache möglich'
  },

  social: {
    facebook: '',
    instagram: '',
    linkedin: ''
  },

  seo: {
    defaultTitle: 'CF Veranstaltungstechnik – Professionelle Eventtechnik mieten',
    defaultDescription: 'CF Veranstaltungstechnik vermietet professionelle Veranstaltungstechnik für Hochzeiten, Firmenfeiern und Events in Mühlenbecker Land und Umgebung. Jetzt Angebot anfordern!',
    keywords: 'Veranstaltungstechnik mieten, Eventtechnik, Mühlenbecker Land, Hochzeit, Firmenevent'
  }
} as const;
