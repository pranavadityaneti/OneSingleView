-- Update existing customer IDs to new format (1SV-XXXXXX)
-- This will update all users who have the old OSV format

UPDATE users
SET customer_id = '1SV-' || SUBSTRING(customer_id FROM 4)
WHERE customer_id LIKE 'OSV%';

-- For users without customer_id, generate new ones
UPDATE users
SET customer_id = '1SV-' || UPPER(SUBSTRING(md5(random()::text || id::text) FROM 1 FOR 6))
WHERE customer_id IS NULL OR customer_id = '';
