-- Allow 'Health' in lob_type check constraint for claims table
ALTER TABLE claims DROP CONSTRAINT IF EXISTS claims_lob_type_check;
ALTER TABLE claims ADD CONSTRAINT claims_lob_type_check CHECK (lob_type IN ('Motor', 'Health', 'GMC', 'GPA', 'Fire', 'Other'));
