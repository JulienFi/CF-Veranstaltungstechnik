# Produktverwaltung Mietshop

## Übersicht

Der Mietshop enthält derzeit **21 Beispielprodukte** in 4 Kategorien:
- **Lichttechnik** (6 Produkte)
- **Tontechnik** (6 Produkte)
- **DJ-Equipment** (5 Produkte)
- **Bühnentechnik** (4 Produkte)

## Neues Produkt hinzufügen

### 1. Via Admin-Interface (empfohlen)

1. Login unter `/admin/login`
2. Navigation zu "Produkte verwalten"
3. Button "Neues Produkt" klicken
4. Formular ausfüllen:

#### Pflichtfelder
- **Name**: Produktbezeichnung (z.B. "LED Par 64 Set (4x)")
- **Slug**: URL-freundlicher Name (z.B. "led-par-64-set")
- **Kategorie**: Aus Dropdown wählen

#### Wichtige Felder
- **Kurzbeschreibung**: 1-2 Sätze für Produktkarten im Shop
- **Ausführliche Beschreibung**: Detaillierte Produktinfo für Detailseite
- **Technische Spezifikationen**: JSON-Array mit technischen Daten
- **Geeignet für**: Beschreibung der Anwendungsfälle
- **Lieferumfang**: Was ist im Mietpreis enthalten
- **Tags**: Schlagworte wie "Beliebt", "Indoor", "Einsteigerfreundlich"
- **Produkt ist aktiv**: Checkbox für Sichtbarkeit im Shop

### 2. Format für Technische Spezifikationen

Die technischen Spezifikationen müssen als JSON-Array eingegeben werden:

```json
[
  {"label": "Leistung", "value": "150W"},
  {"label": "Farben", "value": "RGBW"},
  {"label": "Abstrahlwinkel", "value": "25°"},
  {"label": "Lichtquelle", "value": "LED"},
  {"label": "Gewicht", "value": "3,5 kg pro Scheinwerfer"}
]
```

### 3. Beispiel für ein vollständiges Produkt

```
Name: LED Par 64 Set (4x)
Slug: led-par-64-set
Kategorie: Lichttechnik

Kurzbeschreibung:
Vielseitiges LED-Set mit 4 Scheinwerfern für stimmungsvolle Beleuchtung. RGBW-Farben, einfache Bedienung, perfekt für Privatfeiern und kleine Events.

Ausführliche Beschreibung:
Dieses Set bietet professionelle LED-Beleuchtung für kleinere bis mittelgroße Veranstaltungen. Die vier Par-64-Scheinwerfer erzeugen brillante RGBW-Farben und lassen sich sowohl standalone als auch per DMX-Steuerung nutzen. Ideal für Hochzeiten, Geburtstagsfeiern oder kleinere Firmenfeiern.

Technische Spezifikationen:
[
  {"label": "Leistung", "value": "4x 150W LED"},
  {"label": "Farben", "value": "RGBW (Rot, Grün, Blau, Weiß)"},
  {"label": "Abstrahlwinkel", "value": "25°"},
  {"label": "Steuerung", "value": "DMX, Master/Slave, Standalone"},
  {"label": "Anschlüsse", "value": "PowerCon, DMX In/Out, 3-Pin XLR"},
  {"label": "Gewicht", "value": "3,5 kg pro Scheinwerfer"}
]

Geeignet für:
Hochzeiten, Geburtstagsfeiern, kleine Firmenfeiern (bis 100 Personen), DJ-Sets in Bars und kleinen Clubs, Indoor-Veranstaltungen in Festsälen

Lieferumfang:
4x LED Par 64 Scheinwerfer, 4x Bodenstative, 4x Stromkabel (5m), 2x DMX-Kabel (5m), 1x Transporttasche, 1x Schnellanleitung

Tags: Beliebt, Indoor, Einsteigerfreundlich
```

## Produktkategorien

### Lichttechnik
Perfekt für: Hochzeiten, Firmenfeiern, Club-Events, Stadtfeste
Beispiele: LED-Scheinwerfer, Moving Heads, Outdoor-Fluter, LED Bars

### Tontechnik
Perfekt für: Präsentationen, Konzerte, Firmenfeiern, Open-Air
Beispiele: PA-Anlagen, Mischpulte, Mikrofone, Monitore

### DJ-Equipment
Perfekt für: Hochzeiten, Privatfeiern, Club-Events
Beispiele: DJ-Controller, CDJs, Mischpulte, Kopfhörer

### Bühnentechnik
Perfekt für: Theater, Konzerte, Messen, Stadtfeste
Beispiele: Bühnenpodeste, Traversensysteme, Vorhänge

## Tags für bessere Auffindbarkeit

Empfohlene Tags:
- **Beliebt**: Bestseller-Produkte
- **Einsteigerfreundlich**: Einfach zu bedienen
- **Indoor**: Für Innenräume geeignet
- **Outdoor**: Wetterfest für Open-Air
- **Für große Events**: Ab 200+ Personen
- **Premium**: Hochwertige Profi-Ausstattung
- **Komplett-Set**: Alles in einem Paket

## Produkte aktivieren/deaktivieren

- **Aktiv**: Produkt ist im Shop sichtbar und kann angefragt werden
- **Inaktiv**: Produkt ist ausgeblendet (z.B. bei Wartung, ausgebucht)

Tipp: Nutze "Inaktiv" statt Löschen, um saisonale Produkte temporär auszublenden.

## Produkte nach Kategorie filtern

Im Admin-Bereich:
1. Nutze die Filter-Buttons über der Produkttabelle
2. Wähle "Alle" oder eine spezifische Kategorie
3. Die Anzahl der Produkte wird angezeigt

## Best Practices

### Kurzbeschreibung
- Max. 2 Sätze
- Fokus auf Hauptvorteil
- Zielgruppe erwähnen

### Technische Spezifikationen
- 4-6 wichtigste Specs
- Verständliche Labels
- Konkrete Werte (mit Einheit)

### Tags
- 2-4 Tags pro Produkt
- Relevante Schlagworte
- Konsistent über alle Produkte

### Slug
- Kleinbuchstaben
- Bindestriche statt Leerzeichen
- Aussagekräftig (z.B. "led-par-64-set")
- Einmalig (keine Duplikate)

## Troubleshooting

**Produkt erscheint nicht im Shop**
- Prüfe, ob "Produkt ist aktiv" aktiviert ist
- Prüfe, ob eine Kategorie zugewiesen ist

**Technische Spezifikationen werden nicht angezeigt**
- JSON-Format prüfen (korrekte Anführungszeichen)
- Online JSON-Validator nutzen

**Slug-Fehler beim Speichern**
- Slug muss einmalig sein
- Nur Kleinbuchstaben, Zahlen und Bindestriche

## Datenmodell

```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  short_description: string;
  full_description: string;
  specs: TechnicalSpec[];  // JSON-Array
  suitable_for: string;
  scope_of_delivery: string;
  tags: string[];          // String-Array
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface TechnicalSpec {
  label: string;  // z.B. "Leistung"
  value: string;  // z.B. "150W"
}
```

## Support

Bei Fragen zur Produktverwaltung:
- Admin-Interface unter `/admin/login`
- Code-Dokumentation in `src/pages/admin/ProductsPage.tsx`
- Datentypen in `src/types/shop.types.ts`
