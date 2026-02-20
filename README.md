# EventTech - Veranstaltungstechnik Website

Eine moderne, professionelle Website für ein Unternehmen im Bereich Veranstaltungstechnik mit integriertem Mietshop und Admin-Bereich.

## 🚀 Features

### Öffentlicher Bereich

- **Homepage**: Hero-Sektion mit Hauptversprechen, Service-Übersicht und Vertrauenselemente
- **Mietshop**: Produktkatalog mit Kategorien (Lichttechnik, Tontechnik, DJ-Equipment, Bühnentechnik)
  - Produktdetailseiten mit technischen Spezifikationen
  - Anfrageliste-System (keine Preise, kein Warenkorb)
  - Angebotsanfrage-Formular
- **Dienstleistungen**: Technische Planung, Aufbau, Betreuung, Festinstallationen
- **Werkstatt**: Reparatur, Wartung, Modifikationen, Sicherheitsprüfungen
- **Projekte**: Referenzen mit Filteroptionen
- **Team**: Teammitglieder-Übersicht
- **Kontakt**: Kontaktformular mit Auswahl des Anfrage-Typs

### Admin-Bereich

- **Authentifizierung**: Supabase Auth mit Email/Passwort
- **Dashboard**: Übersicht über Produkte, Projekte, Team und Anfragen
- **Produkte verwalten**: Anlegen, Bearbeiten, Aktivieren/Deaktivieren, Löschen
- **Projekte verwalten**: (Struktur vorhanden, kann erweitert werden)
- **Team verwalten**: (Struktur vorhanden, kann erweitert werden)

## 🛠 Technologie-Stack

- **Framework**: React 18 mit TypeScript
- **Styling**: Tailwind CSS (Dark Mode)
- **Datenbank**: Supabase (PostgreSQL)
- **Authentifizierung**: Supabase Auth
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📦 Installation & Setup

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Supabase-Konfiguration

Die Supabase-Verbindung ist bereits in der `.env`-Datei konfiguriert:

```
VITE_SUPABASE_URL=https://ivbwnmecgezlgglbqdgu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2YndubWVjZ2V6bGdnbGJxZGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTgzOTIsImV4cCI6MjA4MDE3NDM5Mn0.0aFyPWRMQkrOMJ8eJLs8koS73tfEYsXhyvH3MVgw2UQ
```

### 3. Admin-Benutzer anlegen

Um sich im Admin-Bereich anzumelden, müssen Sie zunächst einen Benutzer in Supabase erstellen:

**Option A: Über Supabase Dashboard**
1. Öffnen Sie das Supabase Dashboard
2. Gehen Sie zu "Authentication" → "Users"
3. Klicken Sie auf "Add User"
4. Geben Sie E-Mail und Passwort ein
5. Bestätigen Sie die E-Mail-Adresse (falls erforderlich)

**Option B: Über SQL**
```sql
-- Im Supabase SQL Editor ausführen
-- Ersetzen Sie email@example.com und ihr-passwort
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  'admin@eventtech.de',
  crypt('IhrSicheresPasswort', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Die Website ist dann unter `http://localhost:5173` erreichbar.

### 5. Admin-Login

Navigieren Sie zu `/admin/login` und melden Sie sich mit den erstellten Zugangsdaten an.

## 📊 Datenbankstruktur

Die Datenbank enthält folgende Tabellen:

- **categories**: Produktkategorien
- **products**: Mietshop-Produkte
- **projects**: Referenzprojekte
- **team_members**: Team-Mitglieder
- **inquiries**: Kundenanfragen

Alle Tabellen haben Row Level Security (RLS) aktiviert:
- Öffentlicher Lesezugriff auf Produkte, Kategorien, Projekte und Team
- Nur authentifizierte Admins können Daten ändern
- Inquiries können von allen erstellt, aber nur von Admins gelesen werden

## 🎨 Design

Das Design verwendet einen modernen Dark Mode mit:
- Haupthintergrund: Fast-Schwarz (`bg-gray-950`)
- Inhaltskarten: Dunkles Grau (`bg-gray-900`)
- Akzentfarbe: Helles Blau (`#3B82F6` / `bg-blue-500`)
- Klare Typografie-Hierarchie
- Responsives Layout für Mobile, Tablet und Desktop

## 🔧 Admin-Bereich: Produkte verwalten

### Neues Produkt anlegen

1. Navigieren Sie zu `/admin/products`
2. Klicken Sie auf "Neues Produkt"
3. Füllen Sie das Formular aus:
   - **Name**: Produktname (z.B. "Moving Head LED 150W")
   - **Slug**: URL-freundlicher Name (z.B. "moving-head-led-150w")
   - **Kategorie**: Wählen Sie eine Kategorie aus
   - **Tags**: Kommagetrennte Liste (z.B. "Indoor, Outdoor, Bestseller")
   - **Kurzbeschreibung**: 1-2 Sätze für die Produktübersicht
   - **Ausführliche Beschreibung**: Detaillierte Beschreibung für die Produktdetailseite
   - **Technische Spezifikationen**: JSON-Array im Format:
     ```json
     [
       {"label": "Leistung", "value": "150W LED"},
       {"label": "Abstrahlwinkel", "value": "8-35° Zoom"}
     ]
     ```
   - **Geeignet für**: Beschreibung der Einsatzszenarien
   - **Lieferumfang**: Was ist im Lieferumfang enthalten
   - **Aktiv**: Checkbox, ob das Produkt sichtbar sein soll

4. Klicken Sie auf "Produkt erstellen"

### Produkt bearbeiten

1. Klicken Sie in der Produktliste auf das Bearbeiten-Symbol (Stift)
2. Nehmen Sie Ihre Änderungen vor
3. Klicken Sie auf "Änderungen speichern"

### Produkt aktivieren/deaktivieren

Klicken Sie auf das Augen-Symbol, um ein Produkt zu aktivieren oder zu deaktivieren.
Deaktivierte Produkte werden im Shop nicht angezeigt, sind aber weiterhin im Admin-Bereich sichtbar.

### Produkt löschen

Klicken Sie auf das Papierkorb-Symbol. Sie müssen die Löschung bestätigen.

## 🚢 Deployment

### Vite-Build erstellen

```bash
npm run build
```

Die Build-Dateien werden im `dist/`-Verzeichnis erstellt.

### Deployment auf Vercel

1. Verbinden Sie Ihr GitHub-Repository mit Vercel
2. Vercel erkennt automatisch das Vite-Projekt
3. Fügen Sie die Umgebungsvariablen hinzu:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deployen Sie das Projekt

### Deployment auf Netlify

1. Verbinden Sie Ihr GitHub-Repository mit Netlify
2. Build-Einstellungen:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
3. Fügen Sie die Umgebungsvariablen hinzu
4. Deployen Sie das Projekt

## 📝 Wichtige Hinweise

### Rechtliches

- **Impressum und Datenschutz**: Die Seiten `/impressum` und `/datenschutz` enthalten nur Platzhalter-Texte
- Diese müssen durch vollständige, rechtlich korrekte Texte ersetzt werden
- Empfehlung: Verwenden Sie einen professionellen Generator oder lassen Sie die Texte von einem Anwalt erstellen

### Bilder

**Empfohlener Standard: statische Assets aus /public**

- Produkte: /public/images/products/<slug>.jpg
- Projekte: /public/images/projects/<slug>.jpg
- Team: /public/images/team/<slug>.jpg
- Optional kann image_url explizit gesetzt werden:
  - /images/products/mh-110-wash.jpg
  - /images/projects/festival-2025.jpg
  - /images/team/max-mustermann.jpg

**URL-Aufloesung und Kompatibilitaet**

- resolveImageUrl(imageUrl, type, slug) arbeitet zentral fuer Produkte, Projekte und Team.
- image_url leer + slug vorhanden -> Standardpfad /images/<type>/<slug>.jpg.
- image_url leer + kein sinnvoller slug -> type-spezifischer Placeholder aus /public/images/....
- Relative Pfade (beginnend mit /) -> werden direkt verwendet.
- Absolute http/https-URLs -> werden unveraendert verwendet (Legacy-Supabase-URLs bleiben kompatibel).

**Empfohlener Workflow**

- Bilddatei nach Slug benennen und im passenden Ordner unter /public/images/... ablegen.
- image_url leer lassen, damit der Standardpfad automatisch aus dem Slug verwendet wird.
- Nur wenn noetig einen expliziten relativen Pfad oder eine absolute URL in image_url setzen.

**Optionaler Upload im Admin-Bereich**

- Upload zu Supabase Storage funktioniert weiterhin:
  - Produkte → `product-images` Bucket
  - Projekte → `project-images` Bucket
  - Team → `team-images` Bucket
- Beim Upload wird eine absolute URL gespeichert
- Maximale Dateigröße: 5 MB
- Unterstützte Formate: PNG, JPG, JPEG, WEBP

**Bildoptimierung:**

- Empfohlene Größe: 1200-1600px Breite
- Empfohlene Dateigröße: 150-400 KB
- Bilder sollten vor dem Upload optimiert werden für bessere Performance

**CLI-Bildoptimierung (automatisiert):**

- Rohbilder ablegen:
  - `assets/raw/products`
  - `assets/raw/projects`
  - `assets/raw/team`
- Dateien nach Slug benennen (z. B. `mh-110-wash.jpg`).
- Optimierung starten:
  - `npm run optimize:products`
  - `npm run optimize:projects`
  - `npm run optimize:team`
- Ausgabe liegt danach unter:
  - `public/images/products`
  - `public/images/projects`
  - `public/images/team`
- Die optimierten Bilder koennen direkt mit `resolveImageUrl(..., slug)` genutzt werden.

**Fallback-Bilder:**

- Wenn weder `image_url` noch ein auswertbarer Slug vorhanden ist, werden Placeholder-Bilder angezeigt
- Placeholder befinden sich in `/public/images/products/placeholder.png`, `/public/images/projects/placeholder.png` und `/public/images/team/placeholder.png`

### Kontaktdaten

- Telefonnummer, E-Mail und Adresse im Footer und auf der Kontaktseite sind Beispieldaten
- Ersetzen Sie diese durch Ihre echten Kontaktdaten in:
  - `src/components/Header.tsx`
  - `src/components/Footer.tsx`
  - `src/pages/ContactPage.tsx`

### E-Mail-Benachrichtigungen

Die Anfragen werden aktuell nur in der Datenbank gespeichert. Fuer automatische E-Mail-Benachrichtigungen koennen Sie:

1. **Supabase Edge Functions** verwenden, um E-Mails zu versenden
2. **Webhooks** einrichten, die bei neuen Anfragen ausgeloest werden
3. Einen **E-Mail-Service** (z.B. SendGrid, Mailgun) integrieren


### Web-Analytics (Plausible)

- Tracking wird nur in Production geladen (siehe `src/components/SEOHead.tsx` und `src/lib/analytics.ts`).
- Tragen Sie Ihre Domain in `VITE_PLAUSIBLE_DOMAIN` ein.
- Optional koennen Sie die Script-URL mit `VITE_PLAUSIBLE_SCRIPT_SRC` ueberschreiben.
- Beispiel `.env`:
  - `VITE_PLAUSIBLE_DOMAIN=www.cf-veranstaltungstechnik.berlin`
  - `VITE_PLAUSIBLE_SCRIPT_SRC=https://plausible.io/js/script.js`
- Bereits verdrahtete Events:
  - `Angebotsanfrage abgesendet` (aus `src/pages/InquiryPage.tsx`)
  - `Kontaktformular abgesendet` (aus `src/pages/ContactPage.tsx`)

## 🔒 Sicherheit

- Alle Passwörter werden von Supabase Auth sicher gehasht
- Row Level Security (RLS) ist für alle Tabellen aktiviert
- Sensible Daten werden nie im Client-Code exponiert
- API-Keys sind als Umgebungsvariablen konfiguriert

## 🆘 Support & Anpassungen

### Häufige Anpassungen

**Farben ändern**:
Bearbeiten Sie `tailwind.config.js` und passen Sie die Farbpalette an.

**Navigation erweitern**:
Bearbeiten Sie `src/components/Header.tsx` und fügen Sie neue Links hinzu.

**Neue Seiten hinzufügen**:
1. Erstellen Sie eine neue Komponente in `src/pages/`
2. Fügen Sie die Route in `src/Router.tsx` hinzu

**Admin-Bereiche erweitern**:
Die Struktur für Projekt- und Team-Verwaltung ist vorhanden.
Erstellen Sie nach dem Vorbild von `ProductsPage.tsx` neue Admin-Seiten.

## 📄 Lizenz

Dieses Projekt wurde für EventTech Veranstaltungstechnik erstellt.

---

**Viel Erfolg mit Ihrer neuen Website! 🎉**




## Stage 3 Production Notes

### Cloudflare Pages

- Deployment guide: `DEPLOY-CLOUDFLARE-PAGES.md`
- Build command: `npm ci && npm run build`
- Output directory: `dist`
- SPA fallback is handled via `public/_redirects`.

### Production ENV variables

Required:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL`
- `SITE_URL`

Optional:

- `VITE_ADMIN_EMAIL`
- `VITE_PLAUSIBLE_DOMAIN`
- `VITE_PLAUSIBLE_SCRIPT_URL` (preferred)
- `VITE_PLAUSIBLE_SCRIPT_SRC` (legacy fallback)

### Analytics (Plausible)

- Plausible script loads only in production.
- If `VITE_PLAUSIBLE_DOMAIN` is not set, no Plausible script is injected.
- Privacy text is documented in `src/pages/DatenschutzPage.tsx`.

### Legal pages

- Legal page metadata is centralized in `src/config/legal.ts`.
- Optional fields are rendered conditionally on `/impressum` and `/datenschutz`.

### Inquiry notifications

- Function: `supabase/functions/inquiry-notify/index.ts`
- Setup guide: `ADMIN-SETUP.md` section "Inquiries notifications".
- Secrets: `WEBHOOK_SECRET`, `DISCORD_WEBHOOK_URL`, optional `ADMIN_URL`.
