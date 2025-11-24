-- Migration: Drop existing health_policies RLS policies that may already exist
-- Run this before re‑creating the policies
DROP POLICY IF EXISTS "Users can view their own health policies" ON health_policies;
DROP POLICY IF EXISTS "Users can insert their own health policies" ON health_policies;
DROP POLICY IF EXISTS "Users can update their own health policies" ON health_policies;
DROP POLICY IF EXISTS "Users can delete their own health policies" ON health_policies;
DROP POLICY IF EXISTS "Admins can view all health policies" ON health_policies;
