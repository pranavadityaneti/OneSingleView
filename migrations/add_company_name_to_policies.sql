-- Add company_name column to policy tables for corporate users
-- Run this migration in Supabase SQL Editor

-- Add company_name to motor_policies
ALTER TABLE motor_policies 
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Add company_name to travel_policies
ALTER TABLE travel_policies 
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Add company_name to life_policies  
ALTER TABLE life_policies 
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Add company_name to cyber_policies
ALTER TABLE cyber_policies 
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Note: gmc_policies (health) and commercial_policies already have company_name column
