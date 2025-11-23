-- Complete Fix for Users Table RLS Policies
-- Run this in Supabase SQL Editor

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;

-- Create comprehensive policies for users table

-- 1. Allow users to insert their own profile during signup
CREATE POLICY "Enable insert for authenticated users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. Allow users to read their own data (and admins can read all)
CREATE POLICY "Enable read access for users"
  ON users FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- 3. Allow users to update their own data  
CREATE POLICY "Enable update for users"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Allow users to delete their own data
CREATE POLICY "Enable delete for users"
  ON users FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
