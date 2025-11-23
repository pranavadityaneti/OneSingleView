-- DEVELOPMENT ONLY: Enable public access to all tables
-- Run this in Supabase SQL Editor to fix "permission denied" errors when using mock users

-- 1. Users
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON users FOR UPDATE USING (true);

-- 2. Motor Policies
DROP POLICY IF EXISTS "Users can view own policies, admins can view all" ON motor_policies;
DROP POLICY IF EXISTS "Users can insert own policies" ON motor_policies;
DROP POLICY IF EXISTS "Users can update own policies" ON motor_policies;
DROP POLICY IF EXISTS "Users can delete own policies" ON motor_policies;
CREATE POLICY "Enable all access for motor_policies" ON motor_policies FOR ALL USING (true);

-- 3. GMC Policies
DROP POLICY IF EXISTS "Users can view own GMC policies" ON gmc_policies;
DROP POLICY IF EXISTS "Users can insert own GMC policies" ON gmc_policies;
DROP POLICY IF EXISTS "Users can update own GMC policies" ON gmc_policies;
DROP POLICY IF EXISTS "Users can delete own GMC policies" ON gmc_policies;
CREATE POLICY "Enable all access for gmc_policies" ON gmc_policies FOR ALL USING (true);

-- 4. Commercial Policies
DROP POLICY IF EXISTS "Users can view own commercial policies" ON commercial_policies;
DROP POLICY IF EXISTS "Users can insert own commercial policies" ON commercial_policies;
DROP POLICY IF EXISTS "Users can update own commercial policies" ON commercial_policies;
DROP POLICY IF EXISTS "Users can delete own commercial policies" ON commercial_policies;
CREATE POLICY "Enable all access for commercial_policies" ON commercial_policies FOR ALL USING (true);

-- 5. Claims
DROP POLICY IF EXISTS "Users can view own claims" ON claims;
DROP POLICY IF EXISTS "Users can insert own claims" ON claims;
DROP POLICY IF EXISTS "Users can update own claims" ON claims;
CREATE POLICY "Enable all access for claims" ON claims FOR ALL USING (true);

-- 6. Referrals
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can insert own referrals" ON referrals;
CREATE POLICY "Enable all access for referrals" ON referrals FOR ALL USING (true);

-- 7. Quote Requests
DROP POLICY IF EXISTS "Users can view own quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Users can insert own quote requests" ON quote_requests;
CREATE POLICY "Enable all access for quote_requests" ON quote_requests FOR ALL USING (true);
