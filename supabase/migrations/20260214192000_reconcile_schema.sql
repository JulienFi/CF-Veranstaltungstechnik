/*
  # Reconcile schema used by frontend repositories

  This migration is intentionally idempotent and keeps legacy columns to avoid
  data loss while aligning the schema with current application usage.
*/

-- products: pricing fields used by shop rendering
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS price_net integer,
  ADD COLUMN IF NOT EXISTS vat_rate numeric,
  ADD COLUMN IF NOT EXISTS show_price boolean DEFAULT false;

UPDATE public.products
SET show_price = false
WHERE show_price IS NULL;

-- projects: fields used by projectRepository/AdminProjectsPage
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS date text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

UPDATE public.projects
SET order_index = 0
WHERE order_index IS NULL;

-- team_members: fields used by teamRepository/AdminTeamPage
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'team_members'
      AND column_name = 'display_order'
  ) THEN
    EXECUTE '
      UPDATE public.team_members
      SET order_index = display_order
      WHERE order_index IS NULL
        AND display_order IS NOT NULL
    ';
  END IF;
END $$;

UPDATE public.team_members
SET order_index = 0
WHERE order_index IS NULL;
