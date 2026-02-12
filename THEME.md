# Theme-System Dokumentation

## Übersicht

Das Projekt verwendet ein konsistentes Dark-Mode-Theme mit einer hellen Blau-Akzentfarbe. Alle Farben sind zentral in der Tailwind-Konfiguration und CSS-Datei definiert.

## Farbpalette

### Hintergrundfarben

| Verwendung | Tailwind-Klasse | Hex-Wert | Beschreibung |
|------------|----------------|----------|--------------|
| Haupt-Hintergrund | `bg-app-bg` | `#0a0a0a` | Fast-schwarzer Hintergrund für die gesamte Seite |
| Karten/Panels | `bg-card-bg` | `#1a1a1a` | Dunkles Grau für Karten und Content-Bereiche |
| Karten Hover | `bg-card-hover` | `#1f1f1f` | Etwas helleres Grau beim Hover über Karten |
| Dunkle Elemente | `bg-dark-800` | `#1f1f1f` | Für Buttons, Inputs und sekundäre Elemente |

### Akzentfarbe (Primary)

| Verwendung | Tailwind-Klasse | Hex-Wert |
|------------|----------------|----------|
| Primary | `bg-primary-500` / `text-primary-500` | `#38bdf8` |
| Primary Hover | `bg-primary-600` / `hover:bg-primary-600` | `#2563eb` |
| Primary Light | `text-primary-400` / `hover:text-primary-400` | `#60a5fa` |

### Ränder

| Verwendung | Tailwind-Klasse | Hex-Wert |
|------------|----------------|----------|
| Standard-Rand | `border-card` | `#2a2a2a` |
| Primary-Rand | `border-primary-500` | `#38bdf8` |

## Anpassung der Farben

### 1. Tailwind-Konfiguration

Die Hauptfarben werden in `tailwind.config.js` definiert:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Vollständige Farbpalette von 50 bis 900
        500: '#38bdf8',  // <- Haupt-Akzentfarbe hier ändern
        600: '#2563eb',  // <- Hover-Zustand hier ändern
      },
      dark: {
        950: '#0a0a0a',  // <- Dunkelster Hintergrund
        900: '#121212',
        850: '#1a1a1a',  // <- Karten-Hintergrund
        800: '#1f1f1f',  // <- Hover & sekundäre Elemente
      }
    },
    backgroundColor: {
      'app-bg': '#0a0a0a',    // <- Haupt-Hintergrund
      'card-bg': '#1a1a1a',   // <- Karten-Hintergrund
      'card-hover': '#1f1f1f', // <- Hover-Zustand
    },
    borderColor: {
      'card': '#2a2a2a',      // <- Standard-Rand
    },
  },
}
```

### 2. CSS-Variablen

In `src/index.css` sind CSS-Variablen definiert, die Sie ändern können:

```css
:root {
  --color-app-bg: #0a0a0a;      /* Haupt-Hintergrund */
  --color-card-bg: #1a1a1a;     /* Karten-Hintergrund */
  --color-card-hover: #1f1f1f;  /* Hover-Zustand */
  --color-border: #2a2a2a;      /* Ränder */
  --color-primary: #38bdf8;     /* Akzentfarbe */
  --color-primary-hover: #2563eb; /* Akzentfarbe Hover */
}
```

## Vordefinierte Komponenten-Klassen

Verwenden Sie diese Utility-Klassen für konsistentes Styling:

### Sections

```html
<!-- Standard Section mit Padding -->
<section class="section">...</section>

<!-- Alternative Section mit leicht anderem Hintergrund -->
<section class="section-alt">...</section>
```

### Karten

```html
<!-- Standard-Karte -->
<div class="card">...</div>

<!-- Karte mit Hover-Effekt -->
<div class="card-hover">...</div>
```

### Buttons

```html
<!-- Primary Button -->
<button class="btn-primary">Speichern</button>

<!-- Secondary Button -->
<button class="btn-secondary">Abbrechen</button>
```

### Input-Felder

```html
<input type="text" class="input-field" placeholder="Name" />
```

### Hero-Gradient

```html
<section class="hero-gradient">
  <!-- Hero-Content -->
</section>
```

## React-Komponenten

### Button-Komponente

```tsx
import Button from './components/Button';

// Primary Button
<Button variant="primary" size="lg" href="/kontakt">
  Anfrage senden
</Button>

// Secondary Button
<Button variant="secondary" size="md" onClick={handleClick}>
  Abbrechen
</Button>

// Outline Button
<Button variant="outline" size="sm">
  Details
</Button>
```

### Card-Komponente

```tsx
import Card from './components/Card';

// Einfache Karte
<Card>
  <h3>Titel</h3>
  <p>Content...</p>
</Card>

// Karte mit Hover-Effekt
<Card hover>
  <h3>Titel</h3>
  <p>Content...</p>
</Card>
```

## Typografie

### Überschriften

Alle Überschriften (`h1` - `h6`) sind automatisch weiß und fett durch globale Styles.

### Text-Farben

| Verwendung | Klasse | Farbe |
|------------|--------|-------|
| Standard-Text | `text-gray-100` | Hell für gute Lesbarkeit |
| Sekundärer Text | `text-gray-300` | Etwas dunkler |
| Dezenter Text | `text-gray-400` / `text-gray-500` | Für weniger wichtige Infos |
| Highlight | `text-primary-400` | Akzentfarbe für Links/Highlights |
| Weißer Text | `text-white` | Für wichtige Überschriften |

## Beispiel: Eigenes Farbschema

Wenn Sie z.B. ein grünes Farbschema möchten:

### 1. Tailwind Config anpassen

```js
colors: {
  primary: {
    400: '#4ade80',
    500: '#22c55e',  // <- Neues Grün
    600: '#16a34a',  // <- Dunkleres Grün für Hover
  }
}
```

### 2. CSS-Variablen anpassen

```css
:root {
  --color-primary: #22c55e;
  --color-primary-hover: #16a34a;
}
```

### 3. Build neu erstellen

```bash
npm run build
```

Das war's! Alle Buttons, Links und Akzente verwenden jetzt automatisch das grüne Farbschema.

## Responsiveness

Alle Komponenten sind vollständig responsiv:

- Mobile-first Ansatz
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Container mit automatischer Padding-Anpassung
- Mobile Navigation mit Hamburger-Menü

## Best Practices

1. **Verwenden Sie die vordefinierten Klassen**: `card`, `btn-primary`, etc.
2. **Nutzen Sie die Button/Card-Komponenten** für maximale Konsistenz
3. **Halten Sie sich an die Farbpalette** - keine willkürlichen Hex-Werte
4. **Testen Sie auf verschiedenen Bildschirmgrößen**
5. **Achten Sie auf ausreichende Kontraste** für gute Lesbarkeit

## Unterstützung

Bei Fragen zur Theme-Anpassung:
- Siehe `tailwind.config.js` für Farb-Definitionen
- Siehe `src/index.css` für CSS-Variablen und Utility-Klassen
- Siehe `src/components/Button.tsx` und `Card.tsx` für Komponenten-Beispiele
