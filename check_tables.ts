
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking tables...');
    const { data: auditLogs, error: auditError } = await supabase.from('audit_logs').select('*').limit(1);
    console.log('audit_logs:', auditError ? 'Error: ' + auditError.message : 'Exists');

    const { data: rmProfiles, error: rmError } = await supabase.from('rm_profiles').select('*').limit(1);
    console.log('rm_profiles:', rmError ? 'Error: ' + rmError.message : 'Exists');
}

checkTables();
