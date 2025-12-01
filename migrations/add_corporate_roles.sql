-- Migration: Add Corporate Roles and Schema Alignment
-- This migration ensures the database supports corporate dashboard features

-- Add corporate user roles support
-- Update role check constraint to include corporate roles
DO $$ 
BEGIN
    -- Drop existing role constraint if it exists
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    
    -- Add updated check constraint with corporate roles
    ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('individual', 'corporate_employee', 'corporate_admin', 'admin', 'rm'));
END $$;

-- Ensure company_name field exists in users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Ensure health_policies table has required fields for corporate
ALTER TABLE health_policies ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE health_policies ADD COLUMN IF NOT EXISTS no_of_lives INTEGER;

-- Ensure claims table has policy_id for linking
ALTER TABLE claims ADD COLUMN IF NOT EXISTS policy_id UUID;

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'claims_policy_id_fkey'
    ) THEN
        ALTER TABLE claims ADD CONSTRAINT claims_policy_id_fkey 
            FOREIGN KEY (policy_id) REFERENCES health_policies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for faster corporate policy lookups
CREATE INDEX IF NOT EXISTS idx_health_policies_company_name 
    ON health_policies(company_name) WHERE company_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_company_name 
    ON users(company_name) WHERE company_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_claims_policy_id 
    ON claims(policy_id) WHERE policy_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.company_name IS 'Company name for corporate employees and admins';
COMMENT ON COLUMN health_policies.company_name IS 'Company name for group medical coverage (GMC) policies';
COMMENT ON COLUMN health_policies.no_of_lives IS 'Number of employees covered under GMC policy';
COMMENT ON COLUMN claims.policy_id IS 'Reference to the policy (health_policies) this claim is for';
