-- Migration: add_new_policy_tables.sql
-- Add tables for Home, Travel, and Life policies

-- Home Policies
CREATE TABLE IF NOT EXISTS home_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy_number TEXT NOT NULL,
  policy_start_date DATE NOT NULL,
  policy_end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active','Expired','Cancelled')) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Travel Policies
CREATE TABLE IF NOT EXISTS travel_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy_number TEXT NOT NULL,
  policy_start_date DATE NOT NULL,
  policy_end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active','Expired','Cancelled')) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Life Policies
CREATE TABLE IF NOT EXISTS life_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy_number TEXT NOT NULL,
  policy_start_date DATE NOT NULL,
  policy_end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active','Expired','Cancelled')) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
