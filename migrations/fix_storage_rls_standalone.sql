-- Fix Storage RLS for Avatars
-- 1. Create the 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create policies for the 'avatars' bucket
-- Note: We skip ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY as it requires owner permissions
-- and is usually enabled by default on Supabase storage.

-- Create policy to allow authenticated users to upload avatars
DROP POLICY IF EXISTS "Allow authenticated uploads to avatars bucket" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to avatars bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- Allow users to read their own avatars (or public read?)
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
CREATE POLICY "Allow public read access to avatars"
ON storage.objects
FOR SELECT
TO public
USING ( bucket_id = 'avatars' );

-- Allow users to update their own avatars
DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;
CREATE POLICY "Allow users to update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND owner = auth.uid() )
WITH CHECK ( bucket_id = 'avatars' AND owner = auth.uid() );
