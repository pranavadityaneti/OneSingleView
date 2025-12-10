import { supabase } from './supabase';

export interface DuplicatePolicyResult {
    exists: boolean;
    policy?: any;
    policyType?: string;
    policyId?: string;
}

/**
 * Check if policy number already exists for user across all policy tables
 */
export async function checkDuplicatePolicyAcrossTypes(
    userId: string,
    policyNumber: string
): Promise<DuplicatePolicyResult> {
    const tables = [
        { name: 'motor_policies', type: 'motor' },
        { name: 'health_policies', type: 'health' },
        { name: 'commercial_policies', type: 'commercial' },
        { name: 'travel_policies', type: 'travel' },
        { name: 'life_policies', type: 'life' },
        { name: 'cyber_policies', type: 'cyber' },
    ];

    for (const table of tables) {
        const { data, error } = await supabase
            .from(table.name)
            .select('*')
            .eq('user_id', userId)
            .eq('policy_number', policyNumber)
            .maybeSingle();

        if (data && !error) {
            return {
                exists: true,
                policy: data,
                policyType: table.type,
                policyId: data.id,
            };
        }
    }

    return { exists: false };
}
