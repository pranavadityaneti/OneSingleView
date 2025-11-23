-- Add customer_id column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS customer_id TEXT UNIQUE;

-- Generate customer_id for existing users (optional, simplistic approach)
UPDATE users 
SET customer_id = 'OSV' || UPPER(SUBSTRING(MD5(id::text) FROM 1 FOR 6))
WHERE customer_id IS NULL;
