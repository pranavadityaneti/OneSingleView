-- Add avatar_url column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Refresh the schema cache (optional, but good practice if possible, though usually automatic)
-- NOTIFY pgrst, 'reload config'; -- This is for PostgREST, might not work directly in SQL editor depending on permissions
