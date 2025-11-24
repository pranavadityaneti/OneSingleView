# Supabase Setup Guide - One Single View

## Quick Setup Instructions

### Step 1: Create Supabase Project
1. Visit: https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Project name: `one-single-view`
   - Database password: *Choose a strong password*
   - Region: *Select closest region*
4. Wait ~2 minutes for project creation

### Step 2: Get Credentials
1. Go to: **Project Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 3: Update Environment
Run this command (replace with your actual credentials):
```bash
bash update_supabase_env.sh "https://your-project.supabase.co" "eyJhbGc..."
```

Or manually edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Step 4: Run Database Migration
1. Open Supabase Dashboard → **SQL Editor**
2. Click "New Query"
3. Copy-paste entire contents of `supabase_schema.sql`
4. Click **Run** button
5. Verify success (should see "Success. No rows returned")

### Step 5: Verify Tables
1. Go to: **Table Editor**
2. Confirm all tables exist:
   - ✅ users
   - ✅ motor_policies
   - ✅ gmc_policies
   - ✅ commercial_policies
   - ✅ claims
   - ✅ quote_requests
   - ✅ referrals
   - ✅ garages
   - ✅ settings
   - ✅ user_audit_log

### Step 6: Restart Development Server
```bash
# Stop current server (Ctrl+C in terminal)
npm run dev
```

### Step 7: Test Application
1. Open: http://localhost:3000
2. Click "Sign Up"
3. Create a test account
4. Verify:
   - No "Failed to fetch" errors
   - Redirect to dashboard works
   - User appears in Supabase → Authentication → Users

## Troubleshooting

### Issue: Still seeing "Failed to fetch"
- Verify `.env.local` has correct credentials
- Restart the dev server
- Check Supabase project is active (not paused)

### Issue: "foreign key violation" on signup
- Ensure `supabase_schema.sql` was run completely
- Check `users` table exists in Table Editor

### Issue: "Row Level Security policy violation"
- RLS policies are created by the migration
- Verify policies exist in Table Editor → Policies tab

## Next Steps After Setup
- Test adding a Motor policy
- Configure Storage bucket (for file uploads)
- Optionally: Set up email templates (for password reset)
