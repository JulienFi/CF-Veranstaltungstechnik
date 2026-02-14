/*
  Extend inquiries with lead context fields for conversion tracking.
  This migration is additive and idempotent.
*/

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS product_id uuid,
  ADD COLUMN IF NOT EXISTS product_slug text,
  ADD COLUMN IF NOT EXISTS product_name text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text;

UPDATE public.inquiries
SET status = 'new'
WHERE status IS NULL;
