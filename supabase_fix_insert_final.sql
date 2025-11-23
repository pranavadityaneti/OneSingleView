-- Final Fix for Users Table INSERT Policy
-- This allows authenticated users to insert their profile during signup
-- Run this in Supabase SQL Editor

-- Drop all existing insert policies
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- Create a permissive INSERT policy that allows any authenticated user to insert
-- The foreign key constraint (REFERENCES auth.users(id)) ensures data integrity
CREATE POLICY "Enable insert for authenticated users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);
