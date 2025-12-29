-- Migration: Add missing columns to motor_policies table
-- Date: 2025-12-29
-- Issue: Motor Policy save error due to missing columns

-- 1. Add ownership_type column
ALTER TABLE motor_policies 
ADD COLUMN IF NOT EXISTS ownership_type TEXT DEFAULT 'Individual' 
CHECK (ownership_type IN ('Individual', 'Company'));

-- 2. Add policy_type column (for Comprehensive, TP, OD)
ALTER TABLE motor_policies 
ADD COLUMN IF NOT EXISTS policy_type TEXT DEFAULT 'Comprehensive' 
CHECK (policy_type IN ('Comprehensive', 'TP', 'OD'));

-- 3. Add status column
ALTER TABLE motor_policies 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active' 
CHECK (status IN ('Active', 'Expired', 'Cancelled', 'Renewed'));

-- 4. Add renewed_from_policy_id column for tracking renewals
ALTER TABLE motor_policies 
ADD COLUMN IF NOT EXISTS renewed_from_policy_id UUID REFERENCES motor_policies(id);

-- 5. Update number_plate_type CHECK constraint to include 'Others'
-- First, drop the existing constraint
ALTER TABLE motor_policies DROP CONSTRAINT IF EXISTS motor_policies_number_plate_type_check;

-- Then add the updated constraint
ALTER TABLE motor_policies 
ADD CONSTRAINT motor_policies_number_plate_type_check 
CHECK (number_plate_type IN ('White', 'Yellow', 'EV', 'Others'));

-- 6. Add index on status for performance
CREATE INDEX IF NOT EXISTS idx_motor_policies_status ON motor_policies(status);

-- Success message
-- Run this SQL in Supabase SQL Editor to fix the motor policy save error
