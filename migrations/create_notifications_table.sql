-- Migration: create_notifications_table.sql

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'warning', 'success', 'error')) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: System can insert notifications (usually via triggers or server-side, but for now allow authenticated insert for testing if needed, or rely on service role)
-- For simplicity in this app, we'll allow authenticated insert so we can create test notifications
CREATE POLICY "Users can insert their own notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
