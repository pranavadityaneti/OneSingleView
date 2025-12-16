# Setting Up Daily Policy Expiry Notifications

This guide explains how to set up the daily scheduled job for checking policy expirations.

## Step 1: Deploy the Edge Function

First, you need to deploy the Edge Function to Supabase.

### Prerequisites
- Supabase CLI installed (`npm install -g supabase`)
- Logged in to Supabase CLI (`supabase login`)

### Deploy Command
```bash
cd /Users/apple/OneSingleView
supabase functions deploy check-policy-expiry --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your Supabase project reference (found in your project settings).

---

## Step 2: Set Up Daily Cron Job (Using cron-job.org - FREE)

1. Go to [https://cron-job.org](https://cron-job.org) and create a free account

2. Click **"CREATE CRONJOB"**

3. Fill in the details:
   - **Title**: `OneSingleView Policy Expiry Check`
   - **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-policy-expiry`
   - **Schedule**: 
     - Select "Extended" tab
     - Set to run at **8:00 AM daily** (or your preferred time)
     - Days of week: all selected
     - Days of month: all selected
     - Months: all selected
     - Hours: 8
     - Minutes: 0

4. Under **Advanced** settings:
   - **Request method**: POST
   - **Request headers** (Add these):
     ```
     Content-Type: application/json
     Authorization: Bearer YOUR_SUPABASE_ANON_KEY
     ```

5. Click **CREATE**

---

## Step 3: Test the Function

You can test the Edge Function manually:

### Using curl
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-policy-expiry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

### Using Supabase Dashboard
1. Go to Supabase Dashboard → Edge Functions
2. Find `check-policy-expiry`
3. Click "Test" and run it

---

## Alternative: Use pg_cron (If Available)

If your Supabase plan includes pg_cron:

```sql
-- Enable pg_cron extension (one-time)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily at 8 AM IST (2:30 AM UTC)
SELECT cron.schedule(
    'daily-policy-expiry-check',
    '30 2 * * *',
    $$SELECT check_policy_expiry_notifications()$$
);

-- To view scheduled jobs
SELECT * FROM cron.job;

-- To remove a job
SELECT cron.unschedule('daily-policy-expiry-check');
```

---

## What the Function Does

When triggered, it:
1. Scans all active policies (Motor, Health, etc.)
2. Checks if any expire in 30, 15, or 7 days
3. Creates appropriate notifications for users
4. Avoids duplicate notifications (checks within last 24 hours)

---

## Troubleshooting

### Function not working?
1. Check Edge Function logs in Supabase Dashboard
2. Verify the `check_policy_expiry_notifications` function exists in your database
3. Ensure RLS policies allow the function to create notifications

### No notifications appearing?
1. Make sure you have policies expiring within 30 days
2. Run the function manually to test: `SELECT check_policy_expiry_notifications();`
