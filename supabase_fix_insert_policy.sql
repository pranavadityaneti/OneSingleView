-- Missing INSERT Policy for Users Table
-- Run this in Supabase SQL Editor

-- Allow new users to insert their own row during signup
CREATE POLICY "Users can insert their own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
