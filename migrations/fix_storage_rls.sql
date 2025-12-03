-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to upload avatars
-- We use a more permissive policy for now to ensure it works, but restrict to authenticated users
-- Ideally we should restrict by folder name (avatars/) and user_id in filename, but filename structure is dynamic
-- So we'll allow authenticated users to insert into 'avatars' bucket

CREATE POLICY "Allow authenticated uploads to avatars bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- Allow users to read their own avatars (or public read?)
-- Avatars are usually public. Let's allow public read for avatars.
CREATE POLICY "Allow public read access to avatars"
ON storage.objects
FOR SELECT
TO public
USING ( bucket_id = 'avatars' );

-- Allow users to update their own avatars (if they overwrite)
CREATE POLICY "Allow users to update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND owner = auth.uid() )
WITH CHECK ( bucket_id = 'avatars' AND owner = auth.uid() );
