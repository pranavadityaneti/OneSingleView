-- Add policy_type column to motor_policies table
-- This column tracks whether the policy is Comprehensive or Third Party (TP)

ALTER TABLE motor_policies 
ADD COLUMN IF NOT EXISTS policy_type TEXT DEFAULT 'Comprehensive'
CHECK (policy_type IN ('Comprehensive', 'TP'));

-- Comment explaining the field
COMMENT ON COLUMN motor_policies.policy_type IS 'Type of motor insurance: Comprehensive or TP (Third Party)';
