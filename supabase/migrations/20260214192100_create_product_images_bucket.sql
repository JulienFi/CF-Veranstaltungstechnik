/*
  # Create storage bucket for product images

  Adds a public `product-images` bucket and policies matching the existing
  team/project image bucket strategy.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Anyone can view product images'
  ) THEN
    CREATE POLICY "Anyone can view product images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'product-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated users can upload product images'
  ) THEN
    CREATE POLICY "Authenticated users can upload product images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated users can update product images'
  ) THEN
    CREATE POLICY "Authenticated users can update product images"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'product-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated users can delete product images'
  ) THEN
    CREATE POLICY "Authenticated users can delete product images"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'product-images');
  END IF;
END $$;
