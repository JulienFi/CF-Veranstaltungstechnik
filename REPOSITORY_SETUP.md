# Repository Pattern - Setup Übersicht

## ✅ Was wurde implementiert?

Eine vollständige **Repository-Schicht** mit sauberer Trennung zwischen Geschäftslogik und Datenzugriff.

## 📁 Neue Dateistruktur

```
src/
├── domain/
│   └── models.ts                          # ✨ NEU: Domain Models
│
├── repositories/
│   ├── interfaces.ts                      # ✨ NEU: Repository Contracts
│   ├── index.ts                          # ✨ NEU: Container & Exports
│   └── supabase/                         # ✨ NEU: Supabase Implementation
│       ├── ProductRepository.ts
│       ├── CategoryRepository.ts
│       ├── ProjectRepository.ts
│       ├── TeamRepository.ts
│       └── OfferRequestRepository.ts
│
└── (bestehende Struktur)
```

## 🎯 Domain Models (`src/domain/models.ts`)

Zentrale Datenmodelle für die gesamte Anwendung:

### Produktbereich
- `ProductCategory` - Kategorien (Lichttechnik, Tontechnik, DJ-Equipment, Bühnentechnik)
- `Product` - Einzelprodukt mit allen Details
- `ProductWithCategory` - Produkt inkl. Kategorie-Infos
- `TechnicalSpec` - Technische Spezifikationen

### Weitere Domains
- `Project` - Referenzprojekte
- `TeamMember` - Teammitglieder
- `OfferRequest` - Kundenanfragen
- `CreateOfferRequestDTO` - DTO für neue Anfragen
- `UpdateOfferRequestDTO` - DTO für Updates

**Wichtig**: Alle Models verwenden **camelCase** (TypeScript-Konvention)!

## 🔌 Repository Interfaces (`src/repositories/interfaces.ts`)

Definiert die Contracts für alle Repositories:

### IProductRepository
```typescript
interface IProductRepository {
  findAllActive(): Promise<ProductWithCategory[]>;
  findBySlug(slug: string): Promise<ProductWithCategory | null>;
  findByCategoryId(categoryId: string): Promise<ProductWithCategory[]>;
  findRelated(productId: string, categoryId: string, limit?: number): Promise<ProductWithCategory[]>;
  create(product: ...): Promise<Product>;
  update(id: string, product: ...): Promise<Product>;
  toggleActive(id: string, isActive: boolean): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### Weitere Repositories
- `ICategoryRepository` - Kategorieverwaltung
- `IProjectRepository` - Projektverwaltung
- `ITeamRepository` - Teamverwaltung
- `IOfferRequestRepository` - Anfragenverwaltung

## 💾 Supabase Implementation

Vollständige Implementierung aller Repository-Interfaces für Supabase PostgreSQL:

### Features
✅ **Automatisches Mapping**: DB-Schema (snake_case) ↔ Domain Models (camelCase)
✅ **Typsicherheit**: Vollständige TypeScript-Unterstützung
✅ **Error Handling**: Wirft Exceptions bei DB-Fehlern
✅ **Konsistent**: Einheitliche API für alle Repositories

### Mapping-Beispiel

```typescript
// Database (snake_case)
{
  category_id: '123',
  short_description: 'Text',
  is_active: true
}

// Domain Model (camelCase)
{
  categoryId: '123',
  shortDescription: 'Text',
  isActive: true
}
```

Das Mapping erfolgt automatisch in den Repository-Implementierungen!

## 🚀 Verwendung

### 1. Repository importieren

```typescript
import { repositories } from '../repositories';
```

### 2. Daten laden

```typescript
// Produkte laden
const products = await repositories.products.findAllActive();
const product = await repositories.products.findBySlug('led-par-64-set');

// Projekte laden
const projects = await repositories.projects.findAllPublished();

// Team laden
const team = await repositories.team.findAll();
```

### 3. Daten erstellen

```typescript
import type { CreateOfferRequestDTO } from '../repositories';

const requestData: CreateOfferRequestDTO = {
  source: 'rental',
  name: 'Max Mustermann',
  email: 'max@example.com',
  eventType: 'Hochzeit',
  eventDate: new Date('2024-12-31'),
  message: 'Ich benötige...',
};

await repositories.offerRequests.create(requestData);
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

## 📚 Dokumentation

### Hauptdokumente

1. **`REPOSITORY_ARCHITEKTUR.md`** (ausführlich)
   - Architektur-Übersicht
   - Detaillierte Erklärungen
   - Best Practices
   - Error Handling

2. **`MIGRATION_BEISPIEL.md`** (praktisch)
   - Schritt-für-Schritt Migrationsanleitung
   - Vorher/Nachher Vergleiche
   - Häufige Fallstricke
   - Code-Beispiele

3. **`REPOSITORY_SETUP.md`** (diese Datei)
   - Schnellstart
   - Übersicht
   - Wichtigste Infos

## ✨ Vorteile des Repository Patterns

### Für Entwickler
✅ **Sauberer Code**: Trennung von Geschäftslogik und Datenzugriff
✅ **Typsicherheit**: Vollständige TypeScript-Unterstützung mit Auto-Completion
✅ **Konsistent**: Einheitliche API überall
✅ **Testbar**: Mock-Implementierungen für Unit-Tests

### Für das Projekt
✅ **Wartbar**: Änderungen nur im Repository nötig
✅ **Austauschbar**: Backend kann gewechselt werden (andere DB, Mock, etc.)
✅ **Skalierbar**: Einfache Erweiterung um neue Features
✅ **Dokumentiert**: Interfaces als Self-Documentation

## 🔄 Migration bestehender Seiten

Bestehende Seiten können schrittweise auf Repository Pattern umgestellt werden:

### Vorher (Direkter Supabase-Zugriff)
```typescript
const { data } = await supabase
  .from('products')
  .select('*, categories(*)')
  .eq('is_active', true);
```

### Nachher (Repository Pattern)
```typescript
const products = await repositories.products.findAllActive();
```

**Siehe**: `MIGRATION_BEISPIEL.md` für detaillierte Anleitung!

## 🎯 Status

### ✅ Implementiert

- [x] Domain Models definiert
- [x] Repository Interfaces definiert
- [x] Supabase-Implementierung komplett
- [x] Repository Container erstellt
- [x] TypeScript Compilation erfolgreich
- [x] Dokumentation erstellt

### 📋 Nächste Schritte (Optional)

- [ ] Bestehende Seiten auf Repositories umstellen
- [ ] Mock-Implementierung für Tests erstellen
- [ ] Performance-Optimierungen (Caching)
- [ ] Pagination für große Datenmengen

## 💡 Quick Start

**1. Repository verwenden:**
```typescript
import { repositories } from '../repositories';
```

**2. Typen importieren:**
```typescript
import type { Product, CreateOfferRequestDTO } from '../repositories';
```

**3. Daten laden:**
```typescript
const products = await repositories.products.findAllActive();
```

**4. Daten erstellen:**
```typescript
await repositories.offerRequests.create({
  source: 'rental',
  name: 'Test',
  email: 'test@example.com',
  message: 'Test',
});
```

## 🔧 Backend

### Aktuell: Supabase PostgreSQL

**Status**: ✅ Vollständig konfiguriert und einsatzbereit

- Alle Daten werden persistent gespeichert
- Admin-Änderungen bleiben dauerhaft erhalten
- Funktioniert auf allen Hosting-Plattformen
- Automatische Backups durch Supabase

**Konfiguration**: Bereits in `.env` hinterlegt - keine weitere Einrichtung nötig!

### Alternative Backends (möglich)

Dank Repository Pattern können später andere Backends eingebunden werden:
- In-Memory (für Tests)
- Mock (für Entwicklung)
- Andere Datenbanken (MySQL, MongoDB, etc.)

**Wichtig**: Interface bleibt gleich - nur die Implementierung ändert sich!

## 📦 Dependencies

Keine zusätzlichen Dependencies erforderlich!

Die Repository-Schicht nutzt nur:
- TypeScript (bereits vorhanden)
- Supabase Client (bereits konfiguriert)

## 🐛 Troubleshooting

### TypeScript-Fehler bei Import

```typescript
// ❌ FALSCH
import { repositories } from '../repositories/index';

// ✅ RICHTIG
import { repositories } from '../repositories';
```

### camelCase vs snake_case

```typescript
// ❌ FALSCH (DB-Schema)
product.short_description
product.is_active

// ✅ RICHTIG (Domain Model)
product.shortDescription
product.isActive
```

### Date-Konvertierung

```typescript
// ❌ FALSCH
eventDate: '2024-12-31' // String

// ✅ RICHTIG
eventDate: new Date('2024-12-31') // Date-Objekt
```

## 📞 Support

Bei Fragen:
1. **Architektur**: `REPOSITORY_ARCHITEKTUR.md`
2. **Migration**: `MIGRATION_BEISPIEL.md`
3. **Quick Reference**: Diese Datei
4. **Code**: `src/domain/models.ts` und `src/repositories/interfaces.ts`

---

**Stand**: Repository Pattern vollständig implementiert und einsatzbereit! ✅
