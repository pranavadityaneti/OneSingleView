-- Enable RLS on all tables (idempotent)
ALTER TABLE IF EXISTS motor_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS health_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS travel_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS commercial_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS life_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cyber_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quote_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (optional, but safer for clean slate)
DROP POLICY IF EXISTS "Users can view their own motor policies" ON motor_policies;
DROP POLICY IF EXISTS "Users can insert their own motor policies" ON motor_policies;
DROP POLICY IF EXISTS "Users can update their own motor policies" ON motor_policies;

-- Create comprehensive policies for Motor Policies
CREATE POLICY "Users can view their own motor policies"
ON motor_policies FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own motor policies"
ON motor_policies FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own motor policies"
ON motor_policies FOR UPDATE
USING (auth.uid() = user_id);

-- Health Policies
CREATE POLICY "Users can view their own health policies"
ON health_policies FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health policies"
ON health_policies FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health policies"
ON health_policies FOR UPDATE
USING (auth.uid() = user_id);

-- Travel Policies
CREATE POLICY "Users can view their own travel policies"
ON travel_policies FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own travel policies"
ON travel_policies FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel policies"
ON travel_policies FOR UPDATE
USING (auth.uid() = user_id);

-- Commercial Policies
CREATE POLICY "Users can view their own commercial policies"
ON commercial_policies FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own commercial policies"
ON commercial_policies FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own commercial policies"
ON commercial_policies FOR UPDATE
USING (auth.uid() = user_id);

-- Life Policies
CREATE POLICY "Users can view their own life policies"
ON life_policies FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own life policies"
ON life_policies FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own life policies"
ON life_policies FOR UPDATE
USING (auth.uid() = user_id);

-- Cyber Policies
CREATE POLICY "Users can view their own cyber policies"
ON cyber_policies FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cyber policies"
ON cyber_policies FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cyber policies"
ON cyber_policies FOR UPDATE
USING (auth.uid() = user_id);

-- Claims
CREATE POLICY "Users can view their own claims"
ON claims FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own claims"
ON claims FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claims"
ON claims FOR UPDATE
USING (auth.uid() = user_id);

-- Quote Requests
CREATE POLICY "Users can view their own quote requests"
ON quote_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quote requests"
ON quote_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quote requests"
ON quote_requests FOR UPDATE
USING (auth.uid() = user_id);

-- Ensure Users table allows update (re-applying to be safe)
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Ensure Users table allows select (usually public, but good to ensure)
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid() = id);
