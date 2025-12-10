-- Create additional_documents table for user document storage
CREATE TABLE IF NOT EXISTS additional_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('aadhar_card', 'pan_card', 'gst_certificate', 'cin', 'moa', 'aoa', 'other')),
    document_name TEXT,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_additional_documents_user_id ON additional_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_additional_documents_type ON additional_documents(document_type);

-- Enable RLS
ALTER TABLE additional_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own additional documents"
    ON additional_documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own additional documents"
    ON additional_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own additional documents"
    ON additional_documents FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own additional documents"
    ON additional_documents FOR DELETE
    USING (auth.uid() = user_id);
