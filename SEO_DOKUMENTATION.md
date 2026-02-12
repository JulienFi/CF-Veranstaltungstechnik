# SEO-Dokumentation â€“ CF Veranstaltungstechnik

## Ãœbersicht

Die Website von CF Veranstaltungstechnik ist vollstÃ¤ndig fÃ¼r Suchmaschinen optimiert mit:

âœ… **Dynamische Meta-Tags** pro Seite (Title, Description, Keywords)
âœ… **Open Graph** fÃ¼r Social Media Sharing
âœ… **Twitter Cards** fÃ¼r Twitter
âœ… **Schema.org JSON-LD** (LocalBusiness)
âœ… **Sitemap.xml** fÃ¼r Suchmaschinen-Crawling
âœ… **robots.txt** fÃ¼r Crawler-Steuerung

## Architektur

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  index.html (Default Meta-Tags)    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚
               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Router (SEOHead Integration)      â”‚
â”‚  - Setzt pageKey pro Route         â”‚
â”‚  - Ãœbergibt Schema.org Daten       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚
               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  SEOHead Component                  â”‚
â”‚  - Liest Meta-Konfiguration        â”‚
â”‚  - Setzt dynamische Meta-Tags      â”‚
â”‚  - Injiziert JSON-LD               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚
               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  lib/seo.ts (Zentrale Konfig)      â”‚
â”‚  - PAGE_META: Alle Seiten-Metas   â”‚
â”‚  - Schema.org Generatoren          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## Dateien und Verantwortlichkeiten

### 1. Zentrale SEO-Konfiguration

**Datei**: `src/lib/seo.ts`

**EnthÃ¤lt**:
- `PAGE_META` - Objekt mit Meta-Daten fÃ¼r alle Seiten
- `getPageMeta(pageKey)` - Holt Meta-Daten fÃ¼r eine Seite
- `generateLocalBusinessSchema()` - Generiert Schema.org LocalBusiness
- `generateProductSchema()` - Generiert Schema.org Product (spÃ¤ter)
- `generateEventSchema()` - Generiert Schema.org Event (spÃ¤ter)

**Beispiel**:
```typescript
export const PAGE_META: Record<string, PageMeta> = {
  home: {
    title: 'CF Veranstaltungstechnik â€“ Licht, Ton & BÃ¼hne...',
    description: 'CF Veranstaltungstechnik bietet...',
    keywords: 'Veranstaltungstechnik, Berlin, Brandenburg...',
    ogImage: '/og-image-cf-veranstaltungstechnik.jpg',
    ogType: 'website',
  },
  // ... weitere Seiten
};
```

### 2. SEOHead Component

**Datei**: `src/components/SEOHead.tsx`

**Aufgabe**:
- Dynamisches Setzen von Meta-Tags im `<head>`
- Open Graph Tags
- Twitter Card Tags
- Schema.org JSON-LD

**Usage**:
```tsx
<SEOHead
  pageKey="home"
  schemaData={generateLocalBusinessSchema()}
/>
```

**Features**:
- Aktualisiert `document.title`
- Erstellt/aktualisiert Meta-Tags dynamisch
- Injiziert JSON-LD Scripts
- Setzt Canonical URLs

### 3. Router Integration

**Datei**: `src/Router.tsx`

**Integration**:
```tsx
let seoPageKey = 'home';
let schemaData = null;

if (currentPath === '/') {
  content = <HomePage />;
  seoPageKey = 'home';
  schemaData = generateLocalBusinessSchema();
}

return (
  <>
    <SEOHead pageKey={seoPageKey} schemaData={schemaData} />
    <Layout>{content}</Layout>
  </>
);
```

### 4. Sitemap

**Datei**: `public/sitemap.xml`

**EnthÃ¤lt**:
- Alle Ã¶ffentlichen Seiten
- Letzte Ã„nderung (lastmod)
- PrioritÃ¤t (0.3 - 1.0)
- Ã„nderungshÃ¤ufigkeit

**Wichtig**: Bei neuen Seiten muss `sitemap.xml` manuell aktualisiert werden!

### 5. Robots.txt

**Datei**: `public/robots.txt`

**Konfiguration**:
```
User-agent: *
Allow: /

Disallow: /admin
Disallow: /admin/*

Sitemap: https://www.cf-veranstaltungstechnik.berlin/sitemap.xml
```

## Seiten-spezifische Meta-Tags

### Startseite (`/`)
```
Title: CF Veranstaltungstechnik â€“ Licht, Ton & BÃ¼hne fÃ¼r Events in Berlin & Brandenburg
Description: CF Veranstaltungstechnik bietet professionelle Veranstaltungstechnik, Mietshop, technische Planung, Aufbau, Betreuung und Werkstattservice fÃ¼r Events in Berlin und Brandenburg.
Keywords: Veranstaltungstechnik, Berlin, Brandenburg, MÃ¼hlenbecker Land, Eventtechnik, Lichttechnik, Tontechnik, DJ Equipment, BÃ¼hnentechnik, Mieten
Schema: LocalBusiness
```

### Mietshop (`/mietshop`)
```
Title: Mietshop fÃ¼r Veranstaltungstechnik â€“ Licht, Ton, DJ & BÃ¼hne | CF Veranstaltungstechnik
Description: Mieten Sie professionelle Veranstaltungstechnik bei CF Veranstaltungstechnik. Von Lichttechnik Ã¼ber Tontechnik bis DJ-Equipment â€“ alles fÃ¼r Ihr Event in Berlin & Brandenburg.
Keywords: Veranstaltungstechnik mieten, Lichttechnik mieten, Tontechnik mieten, DJ Equipment mieten, BÃ¼hnentechnik mieten, Berlin, Brandenburg
```

### Dienstleistungen (`/dienstleistungen`)
```
Title: Technische Planung & Betreuung fÃ¼r Ihr Event | CF Veranstaltungstechnik
Description: Professionelle Veranstaltungsplanung und technische Betreuung fÃ¼r Events in Berlin & Brandenburg. Von der Konzeption bis zur DurchfÃ¼hrung â€“ alles aus einer Hand.
Keywords: Veranstaltungsplanung, technische Betreuung, Event-Service, Veranstaltungstechnik Service, Berlin, Brandenburg
```

### Werkstatt (`/werkstatt`)
```
Title: Werkstatt fÃ¼r Veranstaltungstechnik â€“ Reparatur, Wartung & Sicherheit | CF Veranstaltungstechnik
Description: Professionelle Werkstatt fÃ¼r Veranstaltungstechnik. Reparatur, Wartung, SicherheitsprÃ¼fung und technischer Support in MÃ¼hlenbecker Land bei Berlin.
Keywords: Veranstaltungstechnik Werkstatt, Reparatur, Wartung, SicherheitsprÃ¼fung, technischer Support, Berlin, Brandenburg
```

### Weitere Seiten
- **Projekte**: Referenzen & erfolgreiche Events
- **Team**: Erfahrene Techniker & Spezialisten
- **Kontakt**: Angebot anfordern & Beratung

## Schema.org LocalBusiness

**Implementiert auf**: Startseite (`/`)

**JSON-LD Output**:
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "CF Veranstaltungstechnik",
  "image": "https://www.cf-veranstaltungstechnik.berlin/og-image-cf-veranstaltungstechnik.jpg",
  "@id": "https://www.cf-veranstaltungstechnik.berlin",
  "url": "https://www.cf-veranstaltungstechnik.berlin",
  "telephone": "+49 172 5780502",
  "email": "info@cf-veranstaltungstechnik.de",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "DorfstraÃŸe 1A",
    "addressLocality": "MÃ¼hlenbecker Land",
    "postalCode": "16567",
    "addressCountry": "DE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 52.6333,
    "longitude": 13.3833
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Berlin"
    },
    {
      "@type": "State",
      "name": "Brandenburg"
    }
  ],
  "priceRange": "$$",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ]
}
```

**Vorteile**:
- âœ… Erscheint in Google Maps
- âœ… Rich Snippets in Suchergebnissen
- âœ… Lokale Suchanfragen bevorzugt
- âœ… Strukturierte Daten fÃ¼r Suchmaschinen

## Open Graph & Twitter Cards

**Automatisch auf allen Seiten:**

```html
<!-- Open Graph -->
<meta property="og:title" content="Seitentitel" />
<meta property="og:description" content="Beschreibung" />
<meta property="og:url" content="https://www.cf-veranstaltungstechnik.berlin/seite" />
<meta property="og:type" content="website" />
<meta property="og:image" content="https://www.cf-veranstaltungstechnik.berlin/og-image.jpg" />
<meta property="og:locale" content="de_DE" />
<meta property="og:site_name" content="CF Veranstaltungstechnik" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Seitentitel" />
<meta name="twitter:description" content="Beschreibung" />
<meta name="twitter:image" content="https://www.cf-veranstaltungstechnik.berlin/og-image.jpg" />
```

**OG-Image**:
- Standard: `/og-image-cf-veranstaltungstechnik.jpg`
- GrÃ¶ÃŸe: Empfohlen 1200Ã—630 px
- Format: JPG oder PNG
- Design: Dark Mode mit hellblauem Akzent (CF-Branding)

**TODO**: OG-Image erstellen und in `public/` ablegen!

## Wartung & Updates

### Neue Seite hinzufÃ¼gen

**1. Meta-Daten definieren** (`src/lib/seo.ts`):
```typescript
export const PAGE_META: Record<string, PageMeta> = {
  // ...
  newpage: {
    title: 'Neue Seite | CF Veranstaltungstechnik',
    description: 'Beschreibung der neuen Seite...',
    keywords: 'Keywords, getrennt, durch, Kommas',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },
};
```

**2. Router anpassen** (`src/Router.tsx`):
```typescript
} else if (currentPath === '/newpage') {
  content = <NewPage />;
  seoPageKey = 'newpage';
}
```

**3. Sitemap aktualisieren** (`public/sitemap.xml`):
```xml
<url>
  <loc>https://www.cf-veranstaltungstechnik.berlin/newpage</loc>
  <lastmod>2024-11-26</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

### Meta-Tags Ã¤ndern

**Datei**: `src/lib/seo.ts`

Einfach den Eintrag in `PAGE_META` anpassen:
```typescript
home: {
  title: 'Neuer Titel...',
  description: 'Neue Beschreibung...',
}
```

Ã„nderung ist sofort aktiv!

### Schema.org erweitern

**Produkt-Schema hinzufÃ¼gen:**
```typescript
// In ProductDetailPage.tsx
const productSchema = generateProductSchema(product);

<SEOHead
  pageKey="mietshop"
  schemaData={productSchema}
/>
```

**Event-Schema hinzufÃ¼gen:**
```typescript
// In ProjectsPage.tsx
const eventSchema = generateEventSchema(project);

<SEOHead
  pageKey="projekte"
  schemaData={eventSchema}
/>
```

## SEO-Best-Practices

### âœ… Was ist implementiert:

1. **Unique Titles** - Jede Seite hat einen eindeutigen Titel
2. **Meta Descriptions** - 150-160 Zeichen pro Seite
3. **Keywords** - Relevante Keywords pro Seite
4. **Canonical URLs** - Vermeidet Duplicate Content
5. **Structured Data** - Schema.org LocalBusiness
6. **Open Graph** - Social Media Preview
7. **Sitemap** - Alle Seiten fÃ¼r Crawler
8. **robots.txt** - Admin-Bereich geschÃ¼tzt
9. **Mobile-Friendly** - Responsive Design
10. **Deutsch** - Alle Inhalte auf Deutsch

### ðŸ”„ Was noch gemacht werden sollte:

1. **OG-Image erstellen**
   - GrÃ¶ÃŸe: 1200Ã—630 px
   - Design: CF-Branding (Dark + Hellblau)
   - Ablegen: `public/og-image-cf-veranstaltungstechnik.jpg`

2. **Google Search Console einrichten**
   - Sitemap einreichen
   - Domain verifizieren
   - Crawling-Fehler prÃ¼fen

3. **Google My Business**
   - Eintrag erstellen/beanspruchen
   - Adresse & Ã–ffnungszeiten pflegen
   - Fotos hochladen

4. **Local SEO**
   - Branchenverzeichnisse eintragen
   - Lokale Backlinks aufbauen
   - Reviews sammeln

5. **Produkt-Schema**
   - Schema.org Product fÃ¼r Mietshop-Produkte
   - VerfÃ¼gbarkeit & Preise (wenn Ã¶ffentlich)

6. **Performance**
   - Bilder optimieren (WebP)
   - Lazy Loading
   - Core Web Vitals optimieren

## Testing

### SEO-Tools zum Testen:

**1. Google Rich Results Test**
```
https://search.google.com/test/rich-results
```
â†’ Testet Schema.org JSON-LD

**2. Facebook Sharing Debugger**
```
https://developers.facebook.com/tools/debug/
```
â†’ Testet Open Graph Tags

**3. Twitter Card Validator**
```
https://cards-dev.twitter.com/validator
```
â†’ Testet Twitter Cards

**4. Google PageSpeed Insights**
```
https://pagespeed.web.dev/
```
â†’ Testet Performance & Core Web Vitals

**5. Sitemap Validator**
```
https://www.xml-sitemaps.com/validate-xml-sitemap.html
```
â†’ Validiert sitemap.xml

### Manuelle Tests:

```bash
# 1. Sitemap erreichbar
curl https://www.cf-veranstaltungstechnik.berlin/sitemap.xml

# 2. robots.txt erreichbar
curl https://www.cf-veranstaltungstechnik.berlin/robots.txt

# 3. Meta-Tags prÃ¼fen
curl -s https://www.cf-veranstaltungstechnik.berlin/ | grep "<meta"

# 4. Schema.org prÃ¼fen
curl -s https://www.cf-veranstaltungstechnik.berlin/ | grep "application/ld+json"
```

### Browser DevTools:

```javascript
// Im Browser Console:

// 1. Alle Meta-Tags anzeigen
document.querySelectorAll('meta');

// 2. Schema.org JSON-LD anzeigen
document.querySelector('script[type="application/ld+json"]').textContent;

// 3. Canonical URL
document.querySelector('link[rel="canonical"]').href;

// 4. Title
document.title;
```

## HÃ¤ufige Fragen

### F: Warum werden Meta-Tags nicht aktualisiert?

**A**: SPAs (Single Page Applications) laden die Seite einmal. Meta-Tags mÃ¼ssen dynamisch aktualisiert werden. Das macht `SEOHead` automatisch bei Route-Wechsel.

### F: Wie teste ich SEO lokal?

**A**:
1. `npm run build`
2. Server starten (z.B. `npx serve dist`)
3. Browser Ã¶ffnen
4. DevTools â†’ Elements â†’ `<head>` prÃ¼fen

### F: Muss ich sitemap.xml manuell pflegen?

**A**: Ja, bei neuen Seiten muss `public/sitemap.xml` manuell aktualisiert werden. FÃ¼r groÃŸe Sites: Automatische Sitemap-Generierung implementieren.

### F: Wie Ã¤ndere ich die Domain?

**A**: In `src/lib/seo.ts`:
```typescript
export const SITE_URL = 'https://ihre-domain.de';
```

Und in `public/sitemap.xml` alle URLs anpassen.

## Support

Bei Fragen zur SEO-Implementierung:
- Konfiguration: `src/lib/seo.ts`
- Component: `src/components/SEOHead.tsx`
- Router: `src/Router.tsx`
- Sitemap: `public/sitemap.xml`
- Robots: `public/robots.txt`
- Diese Dokumentation: `SEO_DOKUMENTATION.md`

---

**Stand**: VollstÃ¤ndige SEO-Struktur implementiert und dokumentiert âœ…

