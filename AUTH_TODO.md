# Authentication - To Be Implemented Later

## Current Status: **Auth Bypassed for Development**

Authentication has been temporarily disabled to allow development of core features. A mock user is currently used.

---

## What's Bypassed:

✅ **Mock User Active**:
- Email: pranav.n@ideaye.in
- Name: Pranav N  
- Role: Individual
- UID: mock-user-id

✅ **Modified Files**:
- `app/(customer)/layout.tsx` - Using mock user instead of Supabase auth
- `app/page.tsx` - Landing page CTAs go to /dashboard directly

---

## To Re-Enable Authentication Later:

### 1. Supabase Configuration

**Fix Email Confirmation** (if not done):
1. Go to: https://supabase.com/dashboard/project/xhfcwpckvoqhoohpgvmd/auth/providers
2. Click on **Email** provider
3. Toggle OFF **"Confirm email"** (for development)
4. Click **Save**

**Fix RLS Policies**:
```sql
-- Re-enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Ensure correct policies exist
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

CREATE POLICY "Enable insert for authenticated users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

### 2. Restore Auth Code

Revert these files to use actual Supabase auth:

**`app/(customer)/layout.tsx`**:
- Remove mock user
- Restore `useEffect` with `supabase.auth.getSession()`
- Restore `onAuthStateChange` listener
- Re-add redirect to `/login` if no session

**`app/page.tsx`**:
- Change "Go to Dashboard" → "Get Started" → `/login`
- Change "View Features" → "Sign Up Free" → `/signup`

### 3. Test Authentication Flow

1. Visit http://localhost:3000/signup
2. Sign up with test credentials
3. Verify redirect to /dashboard works
4. Test logout functionality
5. Test login with existing credentials

---

## Known Issues to Fix:

1. **Email Confirmation**: Supabase has email confirmation enabled by default
   - Disable for development OR implement confirmation flow
   
2. **RLS Policy Timing**: Foreign key constraint violation
   - Fixed with 500ms delay in `lib/auth.ts`
   - May need better solution (check if user exists first)

3. **Session Handling**: Ensure auth state persists across page refreshes

---

## Files Related to Auth:

- `/lib/auth.ts` - Auth functions (signup, signin, getCurrentUser)
-`/lib/supabase.ts` - Supabase client initialization
- `/app/login/page.tsx` - Login page
- `/app/signup/page.tsx` - Signup page
- `/app/(customer)/layout.tsx` - Auth guard for dashboard
- `/components/layout/Header.tsx` - Sign out button
- `/supabase_schema.sql` - Database schema with RLS policies
- `/supabase_fix_rls.sql` - RLS policy fixes

---

**Priority**: Implement authentication after core features (forms, CRUD operations) are complete.
