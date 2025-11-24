-- Fix Dashboard Schema Mismatches
-- Run this SQL in Supabase SQL Editor to add missing columns

-- ============================================
-- 1. Add Status Column to Motor Policies
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'motor_policies' AND column_name = 'status'
  ) THEN
    ALTER TABLE motor_policies 
    ADD COLUMN status TEXT NOT NULL 
    CHECK (status IN ('Active', 'Expired', 'Cancelled')) 
    DEFAULT 'Active';
  END IF;
END $$;

-- ============================================
-- 2. Add Status and policy_end_date to GMC Policies
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gmc_policies' AND column_name = 'status'
  ) THEN
    ALTER TABLE gmc_policies 
    ADD COLUMN status TEXT NOT NULL 
    CHECK (status IN ('Active', 'Expired', 'Cancelled')) 
    DEFAULT 'Active';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gmc_policies' AND column_name = 'policy_end_date'
  ) THEN
    -- Copy data from expiry_date to policy_end_date
    ALTER TABLE gmc_policies 
    ADD COLUMN policy_end_date DATE;
    
    UPDATE gmc_policies 
    SET policy_end_date = expiry_date;
    
    -- Make it NOT NULL after copying data
    ALTER TABLE gmc_policies 
    ALTER COLUMN policy_end_date SET NOT NULL;
  END IF;
END $$;

-- ============================================
-- 3. Add Status and policy_end_date to Commercial Policies
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commercial_policies' AND column_name = 'status'
  ) THEN
    ALTER TABLE commercial_policies 
    ADD COLUMN status TEXT NOT NULL 
    CHECK (status IN ('Active', 'Expired', 'Cancelled')) 
    DEFAULT 'Active';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commercial_policies' AND column_name = 'policy_end_date'
  ) THEN
    -- Copy data from expiry_date to policy_end_date
    ALTER TABLE commercial_policies 
    ADD COLUMN policy_end_date DATE;
    
    UPDATE commercial_policies 
    SET policy_end_date = expiry_date;
    
    -- Make it NOT NULL after copying data
    ALTER TABLE commercial_policies 
    ALTER COLUMN policy_end_date SET NOT NULL;
  END IF;
END $$;

-- ============================================
-- 4. Add Indexes for Status Columns
-- ============================================
CREATE INDEX IF NOT EXISTS idx_motor_policies_status ON motor_policies(status);
CREATE INDEX IF NOT EXISTS idx_gmc_policies_status ON gmc_policies(status);
CREATE INDEX IF NOT EXISTS idx_commercial_policies_status ON commercial_policies(status);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- Schema fixes applied successfully!
-- The dashboard should now load without 400 errors.
