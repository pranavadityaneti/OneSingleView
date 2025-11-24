#!/bin/bash

# Script to run all pending migrations in Supabase
# This combines the GMC to Health rename and user preferences table creation

echo "🔄 Running database migrations..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Source the environment variables
source .env.local

# Check if required variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Missing Supabase credentials in .env.local"
    exit 1
fi

echo "📋 Migrations to run:"
echo "  1. rename_gmc_to_health.sql - Rename gmc_policies table to health_policies"
echo "  2. add_user_preferences.sql - Create user_preferences table"
echo ""

# Combine all migrations into a single file
cat > /tmp/combined_migration.sql << 'EOF'
-- Migration 1: Rename GMC to Health
-- This renames the gmc_policies table to health_policies

ALTER TABLE IF EXISTS gmc_policies RENAME TO health_policies;

-- Update RLS policies for health_policies
DROP POLICY IF EXISTS "Users can view their own GMC policies" ON health_policies;
DROP POLICY IF EXISTS "Users can insert their own GMC policies" ON health_policies;
DROP POLICY IF EXISTS "Users can update their own GMC policies" ON health_policies;
DROP POLICY IF EXISTS "Users can delete their own GMC policies" ON health_policies;
DROP POLICY IF EXISTS "Admins can view all GMC policies" ON health_policies;

CREATE POLICY "Users can view their own health policies"
    ON health_policies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health policies"
    ON health_policies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health policies"
    ON health_policies FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health policies"
    ON health_policies FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all health policies"
    ON health_policies FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Migration 2: Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    policy_expiry_alerts BOOLEAN DEFAULT true,
    claim_updates BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;

CREATE POLICY "Users can view own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EOF

echo "📝 Combined migration file created at: /tmp/combined_migration.sql"
echo ""
echo "⚠️  IMPORTANT: You need to run this SQL in your Supabase SQL Editor"
echo ""
echo "Steps:"
echo "  1. Go to https://supabase.com/dashboard"
echo "  2. Select your project"
echo "  3. Go to SQL Editor"
echo "  4. Copy the contents from: /tmp/combined_migration.sql"
echo "  5. Paste and run the SQL"
echo ""
echo "Or use this command to copy to clipboard (macOS):"
echo "  cat /tmp/combined_migration.sql | pbcopy"
echo ""
echo "Then paste into Supabase SQL Editor and click 'Run'"

# Open the file in default editor
open /tmp/combined_migration.sql 2>/dev/null || cat /tmp/combined_migration.sql

echo ""
echo "✅ Migration file ready!"
