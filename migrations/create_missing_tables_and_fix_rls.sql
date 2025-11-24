-- Comprehensive Migration: Create Missing Tables and Fix RLS

-- 1. Create Commercial Policies Table
CREATE TABLE IF NOT EXISTS commercial_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lob_type TEXT NOT NULL CHECK (lob_type IN ('GPA', 'Fire', 'Other')),
    company_name TEXT,
    policy_holder_name TEXT,
    policy_number TEXT NOT NULL,
    insurer_name TEXT NOT NULL,
    premium_amount NUMERIC NOT NULL,
    sum_insured NUMERIC,
    expiry_date DATE NOT NULL,
    policy_docs TEXT[],
    status TEXT NOT NULL CHECK (status IN ('Active', 'Expiring Soon', 'Expired', 'Cancelled')) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create Travel Policies Table
CREATE TABLE IF NOT EXISTS travel_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_number TEXT NOT NULL,
    insurer_name TEXT,
    premium_amount NUMERIC,
    policy_start_date DATE NOT NULL,
    policy_end_date DATE NOT NULL,
    destination TEXT,
    trip_type TEXT,
    document_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Expiring Soon', 'Expired', 'Cancelled')) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create Life Policies Table
CREATE TABLE IF NOT EXISTS life_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_number TEXT NOT NULL,
    insurer_name TEXT,
    premium_amount NUMERIC,
    sum_assured NUMERIC,
    nominee_name TEXT,
    policy_start_date DATE NOT NULL,
    policy_end_date DATE NOT NULL,
    document_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Expiring Soon', 'Expired', 'Cancelled')) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create Cyber Policies Table
CREATE TABLE IF NOT EXISTS cyber_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_number TEXT NOT NULL,
    insurer_name TEXT NOT NULL,
    premium_amount NUMERIC NOT NULL,
    sum_insured NUMERIC,
    cyber_risk_type TEXT,
    policy_start_date DATE NOT NULL,
    policy_end_date DATE NOT NULL,
    document_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Expiring Soon', 'Expired', 'Cancelled')) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create Claims Table
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL,
    lob_type TEXT NOT NULL,
    claim_type TEXT NOT NULL,
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    supporting_docs TEXT[],
    status TEXT NOT NULL CHECK (status IN ('New', 'In Progress', 'Settled', 'Rejected')) DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Create Quote Requests Table
CREATE TABLE IF NOT EXISTS quote_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lob_type TEXT NOT NULL,
    details TEXT NOT NULL,
    uploaded_quote TEXT,
    has_better_quote BOOLEAN DEFAULT false,
    status TEXT NOT NULL CHECK (status IN ('New', 'Contacted', 'Closed')) DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Enable RLS on all tables
ALTER TABLE commercial_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cyber_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE motor_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_policies ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies

-- Commercial Policies
DROP POLICY IF EXISTS "Users can view their own commercial policies" ON commercial_policies;
CREATE POLICY "Users can view their own commercial policies" ON commercial_policies FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own commercial policies" ON commercial_policies;
CREATE POLICY "Users can insert their own commercial policies" ON commercial_policies FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own commercial policies" ON commercial_policies;
CREATE POLICY "Users can update their own commercial policies" ON commercial_policies FOR UPDATE USING (auth.uid() = user_id);

-- Travel Policies
DROP POLICY IF EXISTS "Users can view their own travel policies" ON travel_policies;
CREATE POLICY "Users can view their own travel policies" ON travel_policies FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own travel policies" ON travel_policies;
CREATE POLICY "Users can insert their own travel policies" ON travel_policies FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own travel policies" ON travel_policies;
CREATE POLICY "Users can update their own travel policies" ON travel_policies FOR UPDATE USING (auth.uid() = user_id);

-- Life Policies
DROP POLICY IF EXISTS "Users can view their own life policies" ON life_policies;
CREATE POLICY "Users can view their own life policies" ON life_policies FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own life policies" ON life_policies;
CREATE POLICY "Users can insert their own life policies" ON life_policies FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own life policies" ON life_policies;
CREATE POLICY "Users can update their own life policies" ON life_policies FOR UPDATE USING (auth.uid() = user_id);

-- Cyber Policies
DROP POLICY IF EXISTS "Users can view their own cyber policies" ON cyber_policies;
CREATE POLICY "Users can view their own cyber policies" ON cyber_policies FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cyber policies" ON cyber_policies;
CREATE POLICY "Users can insert their own cyber policies" ON cyber_policies FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cyber policies" ON cyber_policies;
CREATE POLICY "Users can update their own cyber policies" ON cyber_policies FOR UPDATE USING (auth.uid() = user_id);

-- Claims
DROP POLICY IF EXISTS "Users can view their own claims" ON claims;
CREATE POLICY "Users can view their own claims" ON claims FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own claims" ON claims;
CREATE POLICY "Users can insert their own claims" ON claims FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own claims" ON claims;
CREATE POLICY "Users can update their own claims" ON claims FOR UPDATE USING (auth.uid() = user_id);

-- Quote Requests
DROP POLICY IF EXISTS "Users can view their own quote requests" ON quote_requests;
CREATE POLICY "Users can view their own quote requests" ON quote_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own quote requests" ON quote_requests;
CREATE POLICY "Users can insert their own quote requests" ON quote_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own quote requests" ON quote_requests;
CREATE POLICY "Users can update their own quote requests" ON quote_requests FOR UPDATE USING (auth.uid() = user_id);

-- Motor Policies (Ensure policies exist)
DROP POLICY IF EXISTS "Users can view their own motor policies" ON motor_policies;
CREATE POLICY "Users can view their own motor policies" ON motor_policies FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own motor policies" ON motor_policies;
CREATE POLICY "Users can insert their own motor policies" ON motor_policies FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own motor policies" ON motor_policies;
CREATE POLICY "Users can update their own motor policies" ON motor_policies FOR UPDATE USING (auth.uid() = user_id);

-- Health Policies (Ensure policies exist)
DROP POLICY IF EXISTS "Users can view their own health policies" ON health_policies;
CREATE POLICY "Users can view their own health policies" ON health_policies FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own health policies" ON health_policies;
CREATE POLICY "Users can insert their own health policies" ON health_policies FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own health policies" ON health_policies;
CREATE POLICY "Users can update their own health policies" ON health_policies FOR UPDATE USING (auth.uid() = user_id);
