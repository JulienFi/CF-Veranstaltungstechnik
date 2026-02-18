/*
  # Ensure product pricing columns exist (idempotent, additive)

  This migration is intentionally non-destructive:
  - adds missing columns only
  - backfills only NULL values
  - never overwrites existing non-null data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'price_net'
  ) THEN
    ALTER TABLE public.products
      ADD COLUMN price_net numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'vat_rate'
  ) THEN
    ALTER TABLE public.products
      ADD COLUMN vat_rate numeric DEFAULT 0.19;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'show_price'
  ) THEN
    ALTER TABLE public.products
      ADD COLUMN show_price boolean DEFAULT false;
  END IF;
END $$;

UPDATE public.products
SET show_price = false
WHERE show_price IS NULL;

UPDATE public.products
SET vat_rate = 0.19
WHERE vat_rate IS NULL;
