// Supabase Edge Function to check policy expiry and create notifications
// Deploy with: supabase functions deploy check-policy-expiry
// Trigger: External cron service (cron-job.org) or Supabase scheduled jobs

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Verify the request has the correct authorization
        // You should use a secret key in production
        const authHeader = req.headers.get('Authorization')
        const cronSecret = Deno.env.get('CRON_SECRET')

        // Allow if auth header matches service role key or cron secret
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            // For now, we'll allow unauthenticated access for testing
            // In production, enable this check:
            // return new Response('Unauthorized', { status: 401, headers: corsHeaders })
        }

        // Create Supabase client with service role key
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Call the check_policy_expiry_notifications function
        const { data, error } = await supabase.rpc('check_policy_expiry_notifications')

        if (error) {
            console.error('Error running policy expiry check:', error)
            return new Response(
                JSON.stringify({ success: false, error: error.message }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Log success
        console.log('Policy expiry check completed successfully')

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Policy expiry notifications checked',
                timestamp: new Date().toISOString()
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (err) {
        console.error('Unexpected error:', err)
        return new Response(
            JSON.stringify({ success: false, error: 'Internal server error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
