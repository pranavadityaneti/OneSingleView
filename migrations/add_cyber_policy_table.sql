-- Migration: add_cyber_policy_table.sql
-- Add table for Cyber policies

CREATE TABLE IF NOT EXISTS cyber_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy_number TEXT NOT NULL,
  insurer_name TEXT NOT NULL,
  premium_amount NUMERIC NOT NULL,
  policy_start_date DATE NOT NULL,
  policy_end_date DATE NOT NULL,
  sum_insured NUMERIC,
  cyber_risk_type TEXT,
  status TEXT NOT NULL CHECK (status IN ('Active','Expiring Soon','Expired','Cancelled')) DEFAULT 'Active',
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add missing columns to life and travel if they were created with minimal columns before
ALTER TABLE life_policies ADD COLUMN IF NOT EXISTS insurer_name TEXT;
ALTER TABLE life_policies ADD COLUMN IF NOT EXISTS premium_amount NUMERIC;
ALTER TABLE life_policies ADD COLUMN IF NOT EXISTS sum_assured NUMERIC;
ALTER TABLE life_policies ADD COLUMN IF NOT EXISTS nominee_name TEXT;
ALTER TABLE life_policies ADD COLUMN IF NOT EXISTS document_url TEXT;

ALTER TABLE travel_policies ADD COLUMN IF NOT EXISTS insurer_name TEXT;
ALTER TABLE travel_policies ADD COLUMN IF NOT EXISTS premium_amount NUMERIC;
ALTER TABLE travel_policies ADD COLUMN IF NOT EXISTS destination TEXT;
ALTER TABLE travel_policies ADD COLUMN IF NOT EXISTS trip_type TEXT;
ALTER TABLE travel_policies ADD COLUMN IF NOT EXISTS document_url TEXT;
