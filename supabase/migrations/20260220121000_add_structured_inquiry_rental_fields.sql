/*
  Add structured rental planning fields to inquiries for admin processing/filtering.
  Idempotent migration.
*/

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS handover_type text,
  ADD COLUMN IF NOT EXISTS guest_count integer,
  ADD COLUMN IF NOT EXISTS event_type text,
  ADD COLUMN IF NOT EXISTS event_location text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inquiries_handover_type_check'
      AND conrelid = 'public.inquiries'::regclass
  ) THEN
    ALTER TABLE public.inquiries
      ADD CONSTRAINT inquiries_handover_type_check
      CHECK (handover_type IS NULL OR handover_type IN ('pickup', 'delivery'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inquiries_date_range_check'
      AND conrelid = 'public.inquiries'::regclass
  ) THEN
    ALTER TABLE public.inquiries
      ADD CONSTRAINT inquiries_date_range_check
      CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);
  END IF;
END $$;
