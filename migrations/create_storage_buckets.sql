-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('policy-documents', 'policy-documents', true),
  ('claim-documents', 'claim-documents', true),
  ('avatars', 'avatars', true),
  ('quote-documents', 'quote-documents', true)
ON CONFLICT (id) DO NOTHING;

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
