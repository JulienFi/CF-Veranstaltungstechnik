# Migration auf Repository Pattern - Beispiel

## Schritt-für-Schritt Anleitung

Dieses Dokument zeigt am Beispiel der `InquiryPage`, wie bestehende Seiten auf die neue Repository-Schicht migriert werden.

## Vorher: Direkter Supabase-Zugriff

```typescript
// src/pages/InquiryPage.tsx (ALT)
import { supabase } from '../lib/supabase';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const selectedProductsData = products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.categories.name
    }));

    const { error } = await supabase.from('inquiries').insert({
      inquiry_type: 'rental',
      name: formData.name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      event_type: formData.eventType,
      event_date: formData.eventDate || null,
      event_location: formData.eventLocation,
      selected_products: selectedProductsData,
      message: formData.message,
      status: 'new'
    });

    if (error) throw error;

    localStorage.removeItem('inquiryList');
    setSubmitted(true);
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    alert('Fehler beim Senden der Anfrage.');
  } finally {
    setLoading(false);
  }
};
```

### Probleme:

❌ **DB-Schema direkt im Code**: `inquiry_type`, `event_type`, `snake_case`
❌ **Keine Typsicherheit**: Feldnamen als Strings
❌ **Schwer testbar**: Direkter Supabase-Zugriff
❌ **Inkonsistent**: Verschiedene Stellen nutzen unterschiedliche Implementierungen

## Nachher: Repository Pattern

```typescript
// src/pages/InquiryPage.tsx (NEU)
import { repositories } from '../repositories';
import type { CreateOfferRequestDTO } from '../repositories';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const selectedProductsData = products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.categories.name
    }));

    const requestData: CreateOfferRequestDTO = {
      source: 'rental',
      name: formData.name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      eventType: formData.eventType,
      eventDate: formData.eventDate ? new Date(formData.eventDate) : undefined,
      eventLocation: formData.eventLocation,
      selectedProducts: selectedProductsData,
      message: formData.message,
    };

    await repositories.offerRequests.create(requestData);

    localStorage.removeItem('inquiryList');
    setSubmitted(true);
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    alert('Fehler beim Senden der Anfrage.');
  } finally {
    setLoading(false);
  }
};
```

### Vorteile:

✅ **Typsicherheit**: `CreateOfferRequestDTO` mit TypeScript-Validierung
✅ **Konsistentes Naming**: `camelCase` überall
✅ **Testbar**: Repository kann gemockt werden
✅ **Sauber**: Geschäftslogik getrennt von DB-Zugriff
✅ **Wartbar**: Änderungen nur im Repository nötig

## Migrations-Schritte

### 1. Imports anpassen

**Vorher:**
```typescript
import { supabase } from '../lib/supabase';
```

**Nachher:**
```typescript
import { repositories } from '../repositories';
import type { CreateOfferRequestDTO } from '../repositories';
```

### 2. Daten-Typ definieren

**Vorher:**
```typescript
// Inline-Objekt ohne Typ
const { error } = await supabase.from('inquiries').insert({
  inquiry_type: 'rental',
  name: formData.name,
  // ...
});
```

**Nachher:**
```typescript
// Typsicheres DTO
const requestData: CreateOfferRequestDTO = {
  source: 'rental',
  name: formData.name,
  // TypeScript prüft alle Felder!
};
```

### 3. Repository-Methode aufrufen

**Vorher:**
```typescript
const { error } = await supabase.from('inquiries').insert({...});
if (error) throw error;
```

**Nachher:**
```typescript
await repositories.offerRequests.create(requestData);
// Error Handling bereits im Repository
```

### 4. Naming-Convention anpassen

**Mapping-Tabelle:**

| DB-Feld (snake_case) | Domain Model (camelCase) |
|----------------------|---------------------------|
| `inquiry_type`       | `source`                  |
| `event_type`         | `eventType`               |
| `event_date`         | `eventDate`               |
| `event_location`     | `eventLocation`           |
| `selected_products`  | `selectedProducts`        |

Das Repository übernimmt automatisch das Mapping!

## Beispiel 2: ShopPage

### Vorher: Produkte laden

```typescript
// ShopPage.tsx (ALT)
const loadProducts = async () => {
  try {
    const { data } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) {
      setProducts(data as ProductWithCategory[]);
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
};
```

### Nachher: Repository verwenden

```typescript
// ShopPage.tsx (NEU)
import { repositories } from '../repositories';
import type { ProductWithCategory } from '../repositories';

const loadProducts = async () => {
  try {
    const products = await repositories.products.findAllActive();
    setProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
  }
};
```

**Vorteile:**
- 🎯 Weniger Code
- 🎯 Keine DB-Syntax
- 🎯 Automatisches Mapping
- 🎯 TypeScript Auto-Completion

## Beispiel 3: ProductDetailPage

### Vorher: Produkt nach Slug laden

```typescript
// ProductDetailPage.tsx (ALT)
const loadProduct = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      setProduct(data as Product);
      loadRelatedProducts(data.category_id, data.id);
    }
  } catch (error) {
    console.error('Error loading product:', error);
  }
};

const loadRelatedProducts = async (categoryId: string, currentProductId: string) => {
  try {
    const { data } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .neq('id', currentProductId)
      .limit(3);

    if (data) setRelatedProducts(data as Product[]);
  } catch (error) {
    console.error('Error loading related products:', error);
  }
};
```

### Nachher: Repository verwenden

```typescript
// ProductDetailPage.tsx (NEU)
import { repositories } from '../repositories';

const loadProduct = async () => {
  try {
    const product = await repositories.products.findBySlug(slug);

    if (product) {
      setProduct(product);
      const related = await repositories.products.findRelated(
        product.id,
        product.categoryId,
        3
      );
      setRelatedProducts(related);
    }
  } catch (error) {
    console.error('Error loading product:', error);
  }
};
```

**Drastische Vereinfachung:**
- ✨ 2 Funktionen → 1 Funktion
- ✨ 40 Zeilen → 15 Zeilen
- ✨ Klare Intent-basierte Methoden

## Testing mit Mock-Repositories

Ein großer Vorteil: Unit-Tests ohne echte Datenbank!

```typescript
// __tests__/InquiryPage.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import InquiryPage from '../pages/InquiryPage';
import { createMockRepositoryContainer } from '../repositories/mock';

// Mock-Repository erstellen
const mockRepos = createMockRepositoryContainer();
jest.mock('../repositories', () => ({
  repositories: mockRepos
}));

test('submits offer request successfully', async () => {
  const { getByLabelText, getByText } = render(<InquiryPage />);

  // Formular ausfüllen
  fireEvent.change(getByLabelText('Name'), { target: { value: 'Test' } });
  fireEvent.change(getByLabelText('E-Mail'), { target: { value: 'test@test.de' } });

  // Submit
  fireEvent.click(getByText('Anfrage absenden'));

  // Prüfen, ob Repository aufgerufen wurde
  await waitFor(() => {
    expect(mockRepos.offerRequests.create).toHaveBeenCalledWith({
      source: 'rental',
      name: 'Test',
      email: 'test@test.de',
      // ...
    });
  });
});
```

## Migrations-Checkliste

Beim Umstellen einer Seite auf Repository Pattern:

### ✅ Vorbereitung
- [ ] Bestehende Supabase-Queries identifizieren
- [ ] Benötigte Repository-Methoden prüfen (bereits vorhanden?)
- [ ] DTO-Typen überprüfen

### ✅ Code-Änderungen
- [ ] Import von `supabase` entfernen
- [ ] Import von `repositories` hinzufügen
- [ ] Typen importieren (`CreateOfferRequestDTO`, etc.)
- [ ] Supabase-Queries durch Repository-Calls ersetzen
- [ ] snake_case zu camelCase konvertieren
- [ ] Error Handling prüfen

### ✅ Testing
- [ ] Seite manuell testen
- [ ] Alle CRUD-Operationen prüfen
- [ ] Error Cases testen
- [ ] TypeScript Compilation erfolgreich

### ✅ Cleanup
- [ ] Alte Kommentare entfernen
- [ ] Nicht verwendete Imports entfernen
- [ ] Code-Formatierung prüfen

## Häufige Fallstricke

### ❌ Problem: Vergessenes Mapping

```typescript
// FALSCH
const product = await repositories.products.findBySlug(slug);
console.log(product.short_description); // ❌ Gibt's nicht!
```

```typescript
// RICHTIG
const product = await repositories.products.findBySlug(slug);
console.log(product.shortDescription); // ✅ camelCase
```

### ❌ Problem: Date-Konvertierung

```typescript
// FALSCH
eventDate: formData.eventDate, // String!
```

```typescript
// RICHTIG
eventDate: formData.eventDate ? new Date(formData.eventDate) : undefined,
```

### ❌ Problem: Fehlende Error Handling

```typescript
// FALSCH
const product = await repositories.products.findBySlug(slug);
setProduct(product);
```

```typescript
// RICHTIG
try {
  const product = await repositories.products.findBySlug(slug);
  if (product) {
    setProduct(product);
  }
} catch (error) {
  console.error('Error:', error);
  showErrorToast();
}
```

## Next Steps

Nach erfolgreicher Migration einer Seite:

1. ✅ Build testen: `npm run build`
2. ✅ Manuelle Tests durchführen
3. ✅ Nächste Seite migrieren
4. ✅ Dokumentation aktualisieren

## Support

Bei Fragen zur Migration:
- Repository-Architektur: `REPOSITORY_ARCHITEKTUR.md`
- Domain Models: `src/domain/models.ts`
- Repository Interfaces: `src/repositories/interfaces.ts`
- Dieses Beispiel: `MIGRATION_BEISPIEL.md`
