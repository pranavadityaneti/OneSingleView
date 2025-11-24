-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('policy-documents', 'policy-documents', true),
  ('claim-documents', 'claim-documents', true),
  ('avatars', 'avatars', true),
  ('quote-documents', 'quote-documents', true),
  ('rc-copies', 'rc-copies', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Claims" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload claims" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Quotes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload quotes" ON storage.objects;
DROP POLICY IF EXISTS "Public Access RC Copies" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload RC copies" ON storage.objects;

-- Set up security policies for policy-documents
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'policy-documents' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'policy-documents' AND auth.role() = 'authenticated' );

-- Set up security policies for claim-documents
CREATE POLICY "Public Access Claims"
ON storage.objects FOR SELECT
USING ( bucket_id = 'claim-documents' );

CREATE POLICY "Authenticated users can upload claims"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'claim-documents' AND auth.role() = 'authenticated' );

-- Set up security policies for quote-documents
CREATE POLICY "Public Access Quotes"
ON storage.objects FOR SELECT
USING ( bucket_id = 'quote-documents' );

CREATE POLICY "Authenticated users can upload quotes"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'quote-documents' AND auth.role() = 'authenticated' );

-- Set up security policies for rc-copies
CREATE POLICY "Public Access RC Copies"
ON storage.objects FOR SELECT
USING ( bucket_id = 'rc-copies' );

CREATE POLICY "Authenticated users can upload RC copies"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'rc-copies' AND auth.role() = 'authenticated' );
