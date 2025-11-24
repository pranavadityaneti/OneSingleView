# Vercel Environment Variables Setup

## Issue
Vercel deployment is failing with the error:
```
Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
```

## Solution
You need to add these environment variables to your Vercel project settings.

## Steps to Fix

### 1. Get Your Supabase Credentials

Your local `.env.local` file already has these values. You need to copy them to Vercel.

Run this command to see your values (keep them secret!):
```bash
cat .env.local | grep NEXT_PUBLIC_SUPABASE
```

### 2. Add to Vercel Dashboard

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to: https://vercel.com/dashboard
2. Click on your **OneSingleView** project
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Add these two variables:

   **Variable 1:**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://xhfcwpckvoqhoohpgvmd.supabase.co` (your Supabase project URL)
   - Environment: Select all (Production, Preview, Development)
   
   **Variable 2:**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your anon key from `.env.local` (starts with `eyJ...`)
   - Environment: Select all (Production, Preview, Development)

6. Click **Save** for each variable

### 3. Redeploy

After saving the environment variables:
- Go to **Deployments** tab
- Click on the latest failed deployment
- Click **Redeploy** button

The build should now succeed! ✅

## Verification

Once deployed successfully:
1. Visit your Vercel deployment URL
2. Try to login/signup
3. Check that Supabase connections work

## Important Notes

⚠️ **NEVER commit `.env.local` to Git** - it's already in `.gitignore`, keep it that way!

🔒 **Keep your ANON_KEY secret** - don't share it publicly, but it's safe to add to Vercel's environment variables (they handle it securely).
