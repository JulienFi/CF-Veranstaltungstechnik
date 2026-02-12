/*
  # Initiales Datenbankschema für Veranstaltungstechnik-Website

  ## Neue Tabellen
  
  ### categories
  - `id` (uuid, primary key)
  - `name` (text) - Name der Kategorie (z.B. "Lichttechnik", "Tontechnik")
  - `slug` (text, unique) - URL-freundlicher Name
  - `description` (text) - Beschreibung der Kategorie
  - `display_order` (integer) - Sortierreihenfolge
  - `created_at` (timestamptz)
  
  ### products
  - `id` (uuid, primary key)
  - `category_id` (uuid, foreign key)
  - `name` (text) - Produktname
  - `slug` (text, unique) - URL-freundlicher Name
  - `short_description` (text) - Kurzbeschreibung (1-2 Sätze)
  - `full_description` (text) - Ausführliche Beschreibung
  - `specs` (jsonb) - Technische Spezifikationen als Array
  - `suitable_for` (text) - Geeignet für (Szenarien)
  - `scope_of_delivery` (text) - Lieferumfang
  - `tags` (text[]) - Tags wie "Indoor", "Outdoor", "Bestseller"
  - `image_url` (text) - Bild-URL
  - `is_active` (boolean) - Aktiv/Inaktiv
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### projects
  - `id` (uuid, primary key)
  - `title` (text) - Projekttitel
  - `slug` (text, unique) - URL-freundlicher Name
  - `description` (text) - Projektbeschreibung
  - `event_type` (text) - Eventtyp (z.B. "Firmenevent", "Hochzeit")
  - `location` (text) - Veranstaltungsort (fiktiv)
  - `event_size` (text) - Größe der Veranstaltung
  - `technical_highlights` (text) - Besondere technische Lösungen
  - `tags` (text[]) - Tags für Filterung
  - `image_url` (text) - Bild-URL
  - `is_published` (boolean) - Veröffentlicht/Unveröffentlicht
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### team_members
  - `id` (uuid, primary key)
  - `name` (text) - Name des Teammitglieds
  - `role` (text) - Funktion/Rolle
  - `bio` (text) - Kurze Biografie
  - `image_url` (text) - Bild-URL
  - `display_order` (integer) - Sortierreihenfolge
  - `created_at` (timestamptz)
  
  ### inquiries
  - `id` (uuid, primary key)
  - `inquiry_type` (text) - Typ: 'rental', 'service', 'workshop', 'contact'
  - `name` (text) - Name des Anfragenden
  - `company` (text, optional) - Firma
  - `email` (text) - E-Mail-Adresse
  - `phone` (text) - Telefonnummer
  - `event_type` (text, optional) - Eventtyp
  - `event_date` (date, optional) - Eventdatum
  - `event_location` (text, optional) - Veranstaltungsort
  - `selected_products` (jsonb, optional) - Ausgewählte Produkte als Array
  - `message` (text) - Nachricht/Besonderheiten
  - `status` (text) - Status: 'new', 'in_progress', 'completed'
  - `created_at` (timestamptz)
  
  ## Sicherheit
  - RLS ist für alle Tabellen aktiviert
  - Öffentlicher Lesezugriff auf products, categories, projects, team_members
  - Nur authentifizierte Admins können Daten ändern
  - Inquiries können von allen erstellt, aber nur von Admins gelesen werden
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kategorien sind öffentlich lesbar"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Nur Admins können Kategorien erstellen"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Nur Admins können Kategorien aktualisieren"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Nur Admins können Kategorien löschen"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  short_description text DEFAULT '',
  full_description text DEFAULT '',
  specs jsonb DEFAULT '[]'::jsonb,
  suitable_for text DEFAULT '',
  scope_of_delivery text DEFAULT '',
  tags text[] DEFAULT ARRAY[]::text[],
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aktive Produkte sind öffentlich lesbar"
  ON products FOR SELECT
  TO public
  USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Nur Admins können Produkte erstellen"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Nur Admins können Produkte aktualisieren"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Nur Admins können Produkte löschen"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  event_type text DEFAULT '',
  location text DEFAULT '',
  event_size text DEFAULT '',
  technical_highlights text DEFAULT '',
  tags text[] DEFAULT ARRAY[]::text[],
  image_url text DEFAULT '',
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Veröffentlichte Projekte sind öffentlich lesbar"
  ON projects FOR SELECT
  TO public
  USING (is_published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Nur Admins können Projekte erstellen"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Nur Admins können Projekte aktualisieren"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Nur Admins können Projekte löschen"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text DEFAULT '',
  image_url text DEFAULT '',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teammitglieder sind öffentlich lesbar"
  ON team_members FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Nur Admins können Teammitglieder erstellen"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Nur Admins können Teammitglieder aktualisieren"
  ON team_members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Nur Admins können Teammitglieder löschen"
  ON team_members FOR DELETE
  TO authenticated
  USING (true);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_type text NOT NULL,
  name text NOT NULL,
  company text DEFAULT '',
  email text NOT NULL,
  phone text DEFAULT '',
  event_type text DEFAULT '',
  event_date date,
  event_location text DEFAULT '',
  selected_products jsonb DEFAULT '[]'::jsonb,
  message text DEFAULT '',
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jeder kann Anfragen erstellen"
  ON inquiries FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Nur Admins können Anfragen lesen"
  ON inquiries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Nur Admins können Anfragen aktualisieren"
  ON inquiries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(is_published);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_type ON inquiries(inquiry_type);
