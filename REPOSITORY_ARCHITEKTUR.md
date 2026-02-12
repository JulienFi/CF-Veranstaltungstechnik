# Repository-Architektur

## Übersicht

Das Projekt verwendet das **Repository Pattern** für saubere Trennung zwischen Geschäftslogik und Datenzugriff.

```
┌─────────────────────────────────────┐
│  Presentation Layer (React Pages)  │
│  - HomePage, ShopPage, etc.        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Domain Layer                       │
│  - Models (TypeScript Interfaces)  │
│  - Business Logic                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Repository Layer (Interfaces)      │
│  - IProductRepository               │
│  - IProjectRepository               │
│  - ITeamRepository                  │
│  - IOfferRequestRepository          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Data Access Layer                  │
│  - Supabase Implementation          │
│  - (später: Mock, In-Memory, etc.)  │
└─────────────────────────────────────┘
```

## Verzeichnisstruktur

```
src/
├── domain/
│   └── models.ts              # Domain Models (TypeScript Interfaces)
│
├── repositories/
│   ├── interfaces.ts          # Repository Interfaces (Contracts)
│   ├── index.ts              # Repository Container & Exports
│   └── supabase/             # Supabase-Implementierungen
│       ├── ProductRepository.ts
│       ├── CategoryRepository.ts
│       ├── ProjectRepository.ts
│       ├── TeamRepository.ts
│       └── OfferRequestRepository.ts
```

## Domain Models

**Datei**: `src/domain/models.ts`

Zentrale Datenmodelle für die gesamte Anwendung:

- `Product` - Produkte im Mietshop
- `ProductCategory` - Produktkategorien (Lichttechnik, Tontechnik, etc.)
- `Project` - Referenzprojekte
- `TeamMember` - Teammitglieder
- `OfferRequest` - Angebotsanfragen von Kunden

Diese Models verwenden **camelCase** für Properties (TypeScript-Konvention).

## Repository Interfaces

**Datei**: `src/repositories/interfaces.ts`

Definiert die Contracts für Datenzugriff:

```typescript
interface IProductRepository {
  findAllActive(): Promise<ProductWithCategory[]>;
  findBySlug(slug: string): Promise<ProductWithCategory | null>;
  findByCategoryId(categoryId: string): Promise<ProductWithCategory[]>;
  create(product: ...): Promise<Product>;
  update(id: string, product: ...): Promise<Product>;
  delete(id: string): Promise<void>;
}
```

Vorteile:
- ✅ Unabhängig von der Implementierung
- ✅ Testbar (Mock-Implementierungen)
- ✅ Austauschbar (andere Datenbanken)

## Supabase-Implementierung

**Verzeichnis**: `src/repositories/supabase/`

Konkrete Implementierung der Repository-Interfaces für Supabase PostgreSQL:

### Mapping zwischen Domain und Database

Die Repositories mappen zwischen **Domain Models (camelCase)** und **Database Schema (snake_case)**:

```typescript
// Domain Model (camelCase)
interface Product {
  categoryId: string;
  shortDescription: string;
  isActive: boolean;
}

// Database Schema (snake_case)
{
  category_id: string;
  short_description: string;
  is_active: boolean;
}
```

### Wichtige Methoden in jedem Repository:

- `mapFromDB()` - Konvertiert DB-Format zu Domain Model
- `mapToDB()` - Konvertiert Domain Model zu DB-Format

## Verwendung in der Anwendung

### 1. Repositories importieren

```typescript
import { repositories } from '../repositories';
```

### 2. Daten laden

```typescript
// Alle aktiven Produkte laden
const products = await repositories.products.findAllActive();

// Produkt nach Slug laden
const product = await repositories.products.findBySlug('led-par-64-set');

// Alle Projekte laden
const projects = await repositories.projects.findAllPublished();

// Alle Teammitglieder laden
const team = await repositories.team.findAll();
```

### 3. Daten erstellen

```typescript
// Neue Angebotsanfrage erstellen
const request = await repositories.offerRequests.create({
  source: 'rental',
  name: 'Max Mustermann',
  email: 'max@example.com',
  phone: '+49 123 456789',
  eventType: 'Hochzeit',
  eventDate: new Date('2024-12-31'),
  eventLocation: 'Berlin',
  selectedProducts: [
    { id: '...', name: 'LED Par 64 Set', category: 'Lichttechnik' }
  ],
  message: 'Ich benötige...',
});
```

### 4. Admin-Operationen

```typescript
// Produkt aktualisieren
await repositories.products.update(productId, {
  name: 'Neuer Name',
  isActive: false,
});

// Produkt löschen
await repositories.products.delete(productId);
```

## Beispiel: ShopPage Migration

### Vorher (Direkter Supabase-Zugriff):

```typescript
// Alte Implementierung
const { data } = await supabase
  .from('products')
  .select('*, categories(*)')
  .eq('is_active', true);
```

### Nachher (Repository Pattern):

```typescript
// Neue Implementierung
import { repositories } from '../repositories';

const products = await repositories.products.findAllActive();
```

Vorteile:
- ✅ Sauberer Code
- ✅ Typsicherheit
- ✅ Einfacher zu testen
- ✅ Konsistentes Naming (camelCase)

## Backend-Austausch

Dank des Repository Patterns kann das Backend einfach ausgetauscht werden:

### 1. Neue Implementierung erstellen

```typescript
// src/repositories/mock/ProductRepository.ts
export class MockProductRepository implements IProductRepository {
  private products: Product[] = [...];

  async findAllActive(): Promise<ProductWithCategory[]> {
    return this.products.filter(p => p.isActive);
  }

  // ... weitere Methoden
}
```

### 2. Container anpassen

```typescript
// src/repositories/index.ts
export function createMockRepositoryContainer(): IRepositoryContainer {
  return {
    products: new MockProductRepository(),
    categories: new MockCategoryRepository(),
    // ...
  };
}
```

### 3. In der App verwenden

```typescript
// Für Tests
const mockRepos = createMockRepositoryContainer();

// Für Produktion
const liveRepos = createRepositoryContainer();
```

## Datenpersistenz

### Aktuell: Supabase (PostgreSQL)

**Status**: ✅ Vollständig implementiert und konfiguriert

- Alle Daten werden persistent in Supabase gespeichert
- Admin-Änderungen bleiben dauerhaft erhalten
- Funktioniert auf allen Hosting-Plattformen (Netlify, Vercel, etc.)
- Keine Konfiguration notwendig (Credentials in `.env`)

### Vorteile gegenüber In-Memory:

✅ **Persistenz**: Daten bleiben nach Server-Restart erhalten
✅ **Skalierbarkeit**: Unterstützt hohe Zugriffszahlen
✅ **Backup**: Automatische Backups durch Supabase
✅ **Produktion-Ready**: Sofort einsatzbereit
✅ **Admin-Panel**: Änderungen werden gespeichert

### Wichtig für Deployment:

Die Supabase-Datenbank ist bereits vollständig konfiguriert und einsatzbereit:

```bash
# .env (bereits konfiguriert)
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

Es ist **keine weitere Konfiguration** notwendig!

## Error Handling

Alle Repository-Methoden können Fehler werfen. Best Practice:

```typescript
try {
  const products = await repositories.products.findAllActive();
  setProducts(products);
} catch (error) {
  console.error('Fehler beim Laden der Produkte:', error);
  // Fehlerbehandlung (z.B. Toast-Notification)
}
```

## TypeScript-Typen

Die Domain Models sind vollständig typsicher:

```typescript
// Auto-Completion funktioniert
const product = await repositories.products.findBySlug('...');

if (product) {
  console.log(product.shortDescription); // ✅ camelCase
  console.log(product.isActive);         // ✅ boolean
  console.log(product.category.name);    // ✅ mit Category
}
```

## Best Practices

### ✅ DO

```typescript
// Repository verwenden
const products = await repositories.products.findAllActive();

// Typen importieren
import type { Product, ProductWithCategory } from '../repositories';

// Error Handling
try {
  await repositories.products.create(newProduct);
} catch (error) {
  handleError(error);
}
```

### ❌ DON'T

```typescript
// Direkten Supabase-Zugriff vermeiden
const { data } = await supabase.from('products').select('*');

// Keine DB-Naming-Convention in Components
const { short_description } = product; // ❌

// Fehlende Error Handling
await repositories.products.create(newProduct); // ❌
```

## Testing

Mock-Implementierungen für Unit-Tests:

```typescript
// test/mocks/MockProductRepository.ts
export class MockProductRepository implements IProductRepository {
  private products: Product[] = [
    { id: '1', name: 'Test Product', /* ... */ }
  ];

  async findAllActive(): Promise<ProductWithCategory[]> {
    return this.products.filter(p => p.isActive);
  }
}
```

## Migration-Plan

### Phase 1: ✅ Abgeschlossen
- Repository-Schicht erstellt
- Supabase-Implementierung
- Domain Models definiert

### Phase 2: In Arbeit
- Bestehende Seiten auf Repositories umstellen
- `ShopPage`, `ProductDetailPage`, `InquiryPage`
- `ProjectsPage`, `TeamPage`
- Admin-Seiten

### Phase 3: Geplant
- Unit-Tests mit Mock-Repositories
- Performance-Optimierungen (Caching)
- Pagination für große Datenmengen

## Support

Bei Fragen zur Repository-Architektur:
- Domain Models: `src/domain/models.ts`
- Repository Interfaces: `src/repositories/interfaces.ts`
- Supabase Implementation: `src/repositories/supabase/`
- Usage Examples: Diese README
