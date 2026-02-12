# Unternehmensstammdaten - CF Veranstaltungstechnik

## Zentrale Konfiguration

Alle Unternehmensstammdaten werden zentral in einer Konfigurationsdatei verwaltet:

**`/src/config/company.ts`**

```typescript
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

  businessHours: {
    weekdays: 'Mo–Fr: 9:00–18:00 Uhr',
    weekend: 'Sa: Nach Vereinbarung',
    note: 'Termine außerhalb der Geschäftszeiten nach Absprache möglich'
  },

  // ... weitere Konfigurationen
}
```

## Vorteile der zentralen Verwaltung

✅ **Einfache Änderungen**: Änderungen an einem Ort wirken sich automatisch auf die gesamte Website aus
✅ **Konsistenz**: Keine unterschiedlichen Schreibweisen oder veraltete Daten
✅ **Wartbarkeit**: Schnelle Anpassungen ohne Suchen in allen Dateien
✅ **Typsicherheit**: TypeScript-Konstante verhindert Tippfehler

## Verwendung in Komponenten

So verwenden Sie die Stammdaten in Ihren Komponenten:

```typescript
import { COMPANY_INFO } from '../config/company';

// Firmenname verwenden
<h1>{COMPANY_INFO.name}</h1>

// Telefonnummer als klickbarer Link
<a href={COMPANY_INFO.contact.phoneLink}>
  {COMPANY_INFO.contact.phone}
</a>

// E-Mail als klickbarer Link
<a href={COMPANY_INFO.contact.emailLink}>
  {COMPANY_INFO.contact.email}
</a>

// Adresse anzeigen
<p>{COMPANY_INFO.address.full}</p>
```

## Geänderte Dateien

### 1. Neue Dateien
- ✅ `/src/config/company.ts` - Zentrale Konfiguration
- ✅ `/src/pages/ImpressumPage.tsx` - Impressum mit Stammdaten
- ✅ `/src/pages/DatenschutzPage.tsx` - Datenschutzerklärung mit Stammdaten

### 2. Aktualisierte Komponenten

#### Header (`/src/components/Header.tsx`)
- Logo-Text: "CF" statt "ET"
- Firmenname: "CF Veranstaltungstechnik"
- Telefonnummer: +49 172 5780502 (klickbar)
- Verwendet: `COMPANY_INFO.name`, `COMPANY_INFO.contact.phoneLink`

#### Footer (`/src/components/Footer.tsx`)
- Logo: "CF" statt "ET"
- Firmenname: "CF Veranstaltungstechnik"
- Adresse: Dorfstraße 1A, 16567 Mühlenbecker Land
- Telefon: +49 172 5780502 (klickbar: tel:+491725780502)
- E-Mail: info@cf-veranstaltungstechnik.de (klickbar)
- Öffnungszeiten: Mo–Fr: 9:00–18:00 Uhr, Sa: Nach Vereinbarung
- Copyright: "© 2024 CF Veranstaltungstechnik"
- Verwendet: Alle `COMPANY_INFO`-Felder

#### Kontaktseite (`/src/pages/ContactPage.tsx`)
- Hero-Text erwähnt "CF Veranstaltungstechnik"
- Kontaktboxen mit allen Stammdaten:
  - Telefon: +49 172 5780502 (klickbar)
  - E-Mail: info@cf-veranstaltungstechnik.de (klickbar)
  - Adresse: Dorfstraße 1A, 16567 Mühlenbecker Land
  - Öffnungszeiten: Aus COMPANY_INFO
- CTA-Button mit Telefonnummer
- Verwendet: Alle `COMPANY_INFO`-Felder

#### Startseite (`/src/pages/HomePage.tsx`)
- Telefon-Button im Hero-Bereich: +49 172 5780502
- Verwendet: `COMPANY_INFO.contact.phone`

### 3. Meta-Tags und SEO (`/index.html`)
- `<html lang="de">` - Sprache auf Deutsch gesetzt
- `<title>`: "CF Veranstaltungstechnik – Professionelle Eventtechnik mieten"
- Meta Description: Erwähnt CF Veranstaltungstechnik und Mühlenbecker Land
- Meta Keywords: Veranstaltungstechnik mieten, Mühlenbecker Land, etc.
- Open Graph Tags aktualisiert
- Twitter Card Tags aktualisiert

### 4. Router (`/src/Router.tsx`)
- Routen für `/impressum` und `/datenschutz` hinzugefügt
- Verwendet neue Seiten-Komponenten

## Wie Sie Stammdaten ändern können

### Szenario 1: Telefonnummer ändern

**Datei öffnen**: `/src/config/company.ts`

```typescript
contact: {
  phone: '+49 172 5780502',           // HIER ÄNDERN
  phoneLink: 'tel:+491725780502',     // HIER ÄNDERN (ohne Leerzeichen/Sonderzeichen)
  // ...
}
```

**Wichtig**: `phoneLink` muss ohne Leerzeichen und Sonderzeichen sein!

### Szenario 2: Adresse ändern

**Datei öffnen**: `/src/config/company.ts`

```typescript
address: {
  street: 'Neue Straße 123',          // HIER ÄNDERN
  postalCode: '12345',                 // HIER ÄNDERN
  city: 'Neue Stadt',                  // HIER ÄNDERN
  country: 'Deutschland',
  full: 'Neue Straße 123, 12345 Neue Stadt'  // HIER ÄNDERN (Volltext)
}
```

### Szenario 3: E-Mail-Adresse ändern

**Datei öffnen**: `/src/config/company.ts`

```typescript
contact: {
  // ...
  email: 'neue-email@firma.de',              // HIER ÄNDERN
  emailLink: 'mailto:neue-email@firma.de',   // HIER ÄNDERN
}
```

### Szenario 4: Öffnungszeiten ändern

**Datei öffnen**: `/src/config/company.ts`

```typescript
businessHours: {
  weekdays: 'Mo–Fr: 8:00–17:00 Uhr',    // HIER ÄNDERN
  weekend: 'Sa: 10:00–14:00 Uhr',       // HIER ÄNDERN
  note: 'Ihr individueller Hinweis'     // HIER ÄNDERN
}
```

### Szenario 5: Firmenname ändern

**Datei öffnen**: `/src/config/company.ts`

```typescript
name: 'Neuer Firmenname',              // HIER ÄNDERN
legalName: 'Neuer Firmenname GmbH',    // HIER ÄNDERN (für rechtliche Texte)
```

## Nach Änderungen

Nach jeder Änderung an `/src/config/company.ts`:

1. **Speichern** Sie die Datei
2. **Neu bauen**: `npm run build`
3. **Prüfen**: Alle Seiten kontrollieren (Header, Footer, Kontakt, Impressum)

Die Änderungen werden automatisch überall übernommen!

## Checkliste: Wo werden Stammdaten verwendet?

- ✅ **Header** - Logo, Firmenname, Telefon
- ✅ **Footer** - Logo, Firmenname, Adresse, Kontakt, Öffnungszeiten, Copyright
- ✅ **Kontaktseite** - Alle Kontaktdaten, Öffnungszeiten
- ✅ **Startseite** - Telefonnummer im CTA
- ✅ **Impressum** - Firmenname, Adresse, Kontakt
- ✅ **Datenschutz** - Verantwortliche Stelle mit Stammdaten
- ✅ **Meta-Tags** - Title, Description (in index.html)

## Wichtige Hinweise

### Telefonnummer-Format

**Anzeige** (mit Leerzeichen): `+49 172 5780502`
**Link** (ohne Leerzeichen): `tel:+491725780502`

Die Link-Version muss alle Leerzeichen und Bindestriche entfernen!

### E-Mail-Format

**Anzeige**: `info@cf-veranstaltungstechnik.de`
**Link**: `mailto:info@cf-veranstaltungstechnik.de`

### Rechtliche Platzhalter

⚠️ **Wichtig**: Die Seiten für Impressum und Datenschutz enthalten deutlich markierte Platzhalter!

**Impressum**: Fehlende Angaben sind gelb markiert:
- Vertretungsberechtigte Person
- Umsatzsteuer-ID (falls vorhanden)

**Datenschutz**: Ist ein unvollständiger Platzhalter und muss durch eine DSGVO-konforme Datenschutzerklärung ersetzt werden.

**Empfehlung**: Konsultieren Sie einen Rechtsanwalt oder Datenschutzbeauftragten!

## SEO-Optimierung

Die `COMPANY_INFO` enthält auch SEO-relevante Daten:

```typescript
seo: {
  defaultTitle: 'CF Veranstaltungstechnik – Professionelle Eventtechnik mieten',
  defaultDescription: '...',
  keywords: '...'
}
```

Diese werden derzeit in `index.html` verwendet. Für eine Single-Page-Application sollten Sie einen Meta-Tag-Manager verwenden, um Title und Description pro Seite anzupassen.

## Support

Bei Fragen zur Verwendung der Stammdaten:
- Zentrale Konfiguration: `/src/config/company.ts`
- Beispiele in allen Komponenten (Header, Footer, ContactPage)
- Diese Dokumentation: `/STAMMDATEN.md`
