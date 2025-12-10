-- Add status column to all policy tables for tracking Active/Expired/History status

-- Motor Policies
ALTER TABLE motor_policies 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active'
CHECK (status IN ('Active', 'Expired', 'History'));

ALTER TABLE motor_policies 
ADD COLUMN IF NOT EXISTS renewed_from_policy_id UUID REFERENCES motor_policies(id);

-- Health Policies  
ALTER TABLE health_policies 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active'
CHECK (status IN ('Active', 'Expired', 'History'));

ALTER TABLE health_policies 
ADD COLUMN IF NOT EXISTS renewed_from_policy_id UUID REFERENCES health_policies(id);

-- Commercial Policies
ALTER TABLE commercial_policies 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active'
CHECK (status IN ('Active', 'Expired', 'History'));

ALTER TABLE commercial_policies 
ADD COLUMN IF NOT EXISTS renewed_from_policy_id UUID REFERENCES commercial_policies(id);

-- Travel Policies
ALTER TABLE travel_policies 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active'
CHECK (status IN ('Active', 'Expired', 'History'));

ALTER TABLE travel_policies 
ADD COLUMN IF NOT EXISTS renewed_from_policy_id UUID REFERENCES travel_policies(id);

-- Life Policies
ALTER TABLE life_policies 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active'
CHECK (status IN ('Active', 'Expired', 'History'));

ALTER TABLE life_policies 
ADD COLUMN IF NOT EXISTS renewed_from_policy_id UUID REFERENCES life_policies(id);

-- Cyber Policies
ALTER TABLE cyber_policies 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active'
CHECK (status IN ('Active', 'Expired', 'History'));

ALTER TABLE cyber_policies 
ADD COLUMN IF NOT EXISTS renewed_from_policy_id UUID REFERENCES cyber_policies(id);

-- Create index for faster queries on status
CREATE INDEX IF NOT EXISTS idx_motor_policies_status ON motor_policies(status);
CREATE INDEX IF NOT EXISTS idx_health_policies_status ON health_policies(status);
CREATE INDEX IF NOT EXISTS idx_commercial_policies_status ON commercial_policies(status);
CREATE INDEX IF NOT EXISTS idx_travel_policies_status ON travel_policies(status);
CREATE INDEX IF NOT EXISTS idx_life_policies_status ON life_policies(status);
CREATE INDEX IF NOT EXISTS idx_cyber_policies_status ON cyber_policies(status);
