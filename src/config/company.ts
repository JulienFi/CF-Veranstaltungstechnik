/**
 * Zentrale Konfiguration für Unternehmensstammdaten.
 */

export const COMPANY_INFO = {
  name: 'CF Veranstaltungstechnik',
  legalName: 'CF Veranstaltungstechnik',

  address: {
    street: 'Dorfstraße 1A',
    postalCode: '16567',
    city: 'Mühlenbecker Land',
    country: 'Deutschland',
    full: 'Dorfstraße 1A, 16567 Mühlenbecker Land',
  },

  contact: {
    phone: '+49 172 5780502',
    phoneLink: 'tel:+491725780502',
    email: 'info@cf-veranstaltungstechnik.de',
    emailLink: 'mailto:info@cf-veranstaltungstechnik.de',
  },

  serviceArea: [
    {
      type: 'City',
      name: 'Berlin',
    },
    {
      type: 'State',
      name: 'Brandenburg',
    },
  ],

  businessHours: {
    weekdays: 'Mo–Fr: 9:00–18:00 Uhr',
    weekend: 'Sa: nach Vereinbarung',
    note: 'Termine außerhalb der Zeiten nach Absprache möglich',
  },

  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
  },

  seo: {
    defaultTitle: 'Eventtechnik, die einfach läuft | CF Veranstaltungstechnik',
    defaultDescription:
      'Seit 2014 im Einsatz: Mietshop und Full-Service für Veranstaltungen bis ca. 2.500 Personen – deutschlandweit verfügbar, Schwerpunkt Berlin/Brandenburg.',
    keywords: 'Eventtechnik mieten, Full-Service, Veranstaltungstechnik, Berlin, Brandenburg',
    localSeoRegion: 'Berlin und Brandenburg',
    localSeoPlaceholder: '[Stadt/Region]',
  },
} as const;
