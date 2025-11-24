-- Migration: Rename GMC to Health Insurance
-- This migration renames the gmc_policies table to health_policies
-- and updates all related constraints and indexes

-- Step 1: Rename the table
ALTER TABLE IF EXISTS gmc_policies RENAME TO health_policies;

-- Step 2: Recreate RLS policies with new table name
-- First, drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own GMC policies" ON health_policies;
DROP POLICY IF EXISTS "Users can insert their own GMC policies" ON health_policies;
DROP POLICY IF EXISTS "Users can update their own GMC policies" ON health_policies;
DROP POLICY IF EXISTS "Users can delete their own GMC policies" ON health_policies;

-- Create new RLS policies
CREATE POLICY "Users can view their own health policies"
ON health_policies FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health policies"
ON health_policies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health policies"
ON health_policies FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health policies"
ON health_policies FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Note: If you need to rollback this migration, run:
-- ALTER TABLE health_policies RENAME TO gmc_policies;
-- Then recreate the original RLS policies
