/*
  # Create storage buckets for team and project images

  1. New Storage Buckets
    - `team-images` - For team member profile photos
    - `project-images` - For project gallery images
  
  2. Security
    - Both buckets are public (files can be read by anyone)
    - Authenticated users can upload files
    - Only authenticated users can update/delete files
*/

-- Create team-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-images', 'team-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create project-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for team-images bucket
CREATE POLICY "Anyone can view team images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team-images');

CREATE POLICY "Authenticated users can upload team images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'team-images');

CREATE POLICY "Authenticated users can update team images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'team-images');

CREATE POLICY "Authenticated users can delete team images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'team-images');

-- Policies for project-images bucket
CREATE POLICY "Anyone can view project images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can upload project images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can update project images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can delete project images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'project-images');