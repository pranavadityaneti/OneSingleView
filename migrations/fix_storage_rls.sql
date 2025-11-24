-- Migration: fix_storage_rls.sql
-- Create bucket if not exists and set RLS policies

-- Create bucket 'policy-documents' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('policy-documents', 'policy-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create bucket 'rc-copies' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('rc-copies', 'rc-copies', true)
ON CONFLICT (id) DO NOTHING;

-- Create bucket 'claim-documents' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('claim-documents', 'claim-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload files to 'policy-documents'
CREATE POLICY "Allow authenticated uploads to policy-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'policy-documents');

-- Allow authenticated users to select their own files or public files
CREATE POLICY "Allow authenticated select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'policy-documents');

-- Allow public access to read files (since buckets are public)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'policy-documents');

-- Repeat for rc-copies
CREATE POLICY "Allow authenticated uploads to rc-copies"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'rc-copies');

CREATE POLICY "Public Access rc-copies"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'rc-copies');

-- Repeat for claim-documents
CREATE POLICY "Allow authenticated uploads to claim-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'claim-documents');

CREATE POLICY "Public Access claim-documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'claim-documents');
