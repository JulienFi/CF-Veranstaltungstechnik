/*
  # Projekte und Teammitglieder Tabellen

  1. Neue Tabellen
    - `projects`
      - `id` (uuid, primary key)
      - `title` (text) - Projekttitel
      - `description` (text) - Projektbeschreibung
      - `image_url` (text) - URL zum Projektbild
      - `location` (text, optional) - Projektstandort
      - `date` (text, optional) - Projektdatum
      - `category` (text, optional) - Projektkategorie
      - `created_at` (timestamptz) - Erstellungszeitpunkt
      - `updated_at` (timestamptz) - Aktualisierungszeitpunkt
      - `order_index` (integer) - Anzeigereihenfolge
    
    - `team_members`
      - `id` (uuid, primary key)
      - `name` (text) - Name des Teammitglieds
      - `role` (text) - Position/Rolle
      - `bio` (text, optional) - Biografische Information
      - `image_url` (text, optional) - URL zum Profilbild
      - `email` (text, optional) - E-Mail-Adresse
      - `phone` (text, optional) - Telefonnummer
      - `created_at` (timestamptz) - Erstellungszeitpunkt
      - `updated_at` (timestamptz) - Aktualisierungszeitpunkt
      - `order_index` (integer) - Anzeigereihenfolge

  2. Sicherheit
    - RLS auf beiden Tabellen aktivieren
    - Öffentlicher Lesezugriff für alle Benutzer
    - Nur authentifizierte Admin-Benutzer können erstellen, bearbeiten und löschen
*/

-- Projekte Tabelle erstellen
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  location text,
  date text,
  category text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Teammitglieder Tabelle erstellen
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text,
  image_url text,
  email text,
  phone text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS für projects aktivieren
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS für team_members aktivieren
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policies für projects: Öffentlicher Lesezugriff
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'projects'
      AND policyname = 'Anyone can view projects'
  ) THEN
    CREATE POLICY "Anyone can view projects"
      ON projects
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Policies für projects: Nur authentifizierte Benutzer können erstellen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'projects'
      AND policyname = 'Authenticated users can insert projects'
  ) THEN
    CREATE POLICY "Authenticated users can insert projects"
      ON projects
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Policies für projects: Nur authentifizierte Benutzer können aktualisieren
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'projects'
      AND policyname = 'Authenticated users can update projects'
  ) THEN
    CREATE POLICY "Authenticated users can update projects"
      ON projects
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Policies für projects: Nur authentifizierte Benutzer können löschen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'projects'
      AND policyname = 'Authenticated users can delete projects'
  ) THEN
    CREATE POLICY "Authenticated users can delete projects"
      ON projects
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Policies für team_members: Öffentlicher Lesezugriff
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'team_members'
      AND policyname = 'Anyone can view team members'
  ) THEN
    CREATE POLICY "Anyone can view team members"
      ON team_members
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Policies für team_members: Nur authentifizierte Benutzer können erstellen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'team_members'
      AND policyname = 'Authenticated users can insert team members'
  ) THEN
    CREATE POLICY "Authenticated users can insert team members"
      ON team_members
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Policies für team_members: Nur authentifizierte Benutzer können aktualisieren
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'team_members'
      AND policyname = 'Authenticated users can update team members'
  ) THEN
    CREATE POLICY "Authenticated users can update team members"
      ON team_members
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Policies für team_members: Nur authentifizierte Benutzer können löschen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'team_members'
      AND policyname = 'Authenticated users can delete team members'
  ) THEN
    CREATE POLICY "Authenticated users can delete team members"
      ON team_members
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Trigger für updated_at bei projects
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'update_projects_updated_at'
      AND n.nspname = 'public'
      AND c.relname = 'projects'
      AND NOT t.tgisinternal
  ) THEN
    CREATE TRIGGER update_projects_updated_at
      BEFORE UPDATE ON projects
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'update_team_members_updated_at'
      AND n.nspname = 'public'
      AND c.relname = 'team_members'
      AND NOT t.tgisinternal
  ) THEN
    CREATE TRIGGER update_team_members_updated_at
      BEFORE UPDATE ON team_members
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
