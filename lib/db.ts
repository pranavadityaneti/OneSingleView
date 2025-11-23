import { supabase } from './supabase';
import {
    MotorPolicy,
    GMCPolicy,
    CommercialPolicy,
    Claim,
    QuoteRequest,
    Referral,
    User,
    UserAuditLog,
    AuditLog,
    AppSetting,
    Banner,
    Garage,
} from '@/types';

// Helper to convert database rows to app types
function convertDates(data: any): any {
    const converted = { ...data };
    Object.keys(converted).forEach((key) => {
        if (converted[key] && typeof converted[key] === 'string') {
            // Try to parse as date
            const dateValue = new Date(converted[key]);
            if (!isNaN(dateValue.getTime()) && key.includes('date') || key.includes('_at')) {
                converted[key] = dateValue;
            }
        }
    });
    return converted;
}

/**
 * Get all motor policies for a user
 */
export async function getUserMotorPolicies(userId: string): Promise<MotorPolicy[]> {
    try {
        const { data, error } = await supabase
            .from('motor_policies')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row) => ({
            ...convertDates(row),
            id: row.id,
            user_id: row.user_id,
        })) as MotorPolicy[];
    } catch (error) {
        console.error('Error fetching motor policies:', error.message, error.details, error.hint);
        return [];
    }
}

/**
 * Get all GMC policies for a user
 */
export async function getUserGMCPolicies(userId: string): Promise<GMCPolicy[]> {
    try {
        const { data, error } = await supabase
            .from('gmc_policies')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row) => convertDates(row)) as GMCPolicy[];
    } catch (error) {
        console.error('Error fetching GMC policies:', error.message, error.details, error.hint);
        return [];
    }
}

/**
 * Get all commercial policies for a user
 */
export async function getUserCommercialPolicies(
    userId: string,
    lobType?: 'GPA' | 'Fire' | 'Other'
): Promise<CommercialPolicy[]> {
    try {
        let query = supabase
            .from('commercial_policies')
            .select('*')
            .eq('user_id', userId);

        if (lobType) {
            query = query.eq('lob_type', lobType);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row) => convertDates(row)) as CommercialPolicy[];
    } catch (error) {
        console.error('Error fetching commercial policies:', error.message, error.details, error.hint);
        return [];
    }
}

/**
 * Get all claims for a user
 */
export async function getUserClaims(userId: string): Promise<Claim[]> {
    try {
        const { data, error } = await supabase
            .from('claims')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row) => convertDates(row)) as Claim[];
    } catch (error) {
        console.error('Error fetching claims:', error.message, error.details, error.hint);
        return [];
    }
}

/**
 * Get all quote requests for a user
 */
export async function getUserQuoteRequests(userId: string): Promise<QuoteRequest[]> {
    try {
        const { data, error } = await supabase
            .from('quote_requests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row) => convertDates(row)) as QuoteRequest[];
    } catch (error) {
        console.error('Error fetching quote requests:', error);
        return [];
    }
}

/**
 * Add a motor policy
 */
export async function addMotorPolicy(policy: Omit<MotorPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
        const { data, error } = await supabase
            .from('motor_policies')
            .insert({
                user_id: policy.user_id,
                policy_number: policy.policy_number,
                vehicle_number: policy.vehicle_number,
                vehicle_type: policy.vehicle_type,
                manufacturer: policy.manufacturer,
                model: policy.model,
                fuel_type: policy.fuel_type,
                manufacturing_year: policy.manufacturing_year,
                number_plate_type: policy.number_plate_type,
                insurer_name: policy.insurer_name,
                premium_amount: policy.premium_amount,
                policy_start_date: policy.policy_start_date,
                policy_end_date: policy.policy_end_date,
                rc_docs: policy.rc_docs || [],
                previous_policy_docs: policy.previous_policy_docs || [],
                dl_docs: policy.dl_docs || [],
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error: any) {
        console.error('Error adding motor policy:', error);
        throw new Error(error.message || 'Failed to add motor policy');
    }
}

/**
 * Add a GMC policy
 */
export async function addGMCPolicy(policy: Omit<GMCPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
        const { data, error } = await supabase
            .from('gmc_policies')
            .insert({
                user_id: policy.user_id,
                company_name: policy.company_name,
                policy_number: policy.policy_number,
                insurer_name: policy.insurer_name,
                sum_insured: policy.sum_insured,
                premium_amount: policy.premium_amount,
                expiry_date: policy.expiry_date,
                policy_docs: policy.policy_docs || [],
                no_of_lives: policy.no_of_lives,
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error: any) {
        console.error('Error adding GMC policy:', error);
        throw new Error(error.message || 'Failed to add GMC policy');
    }
}

/**
 * Add a commercial policy
 */
export async function addCommercialPolicy(policy: Omit<CommercialPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
        const { data, error } = await supabase
            .from('commercial_policies')
            .insert({
                user_id: policy.user_id,
                lob_type: policy.lob_type,
                company_name: policy.company_name,
                policy_holder_name: policy.policy_holder_name,
                policy_number: policy.policy_number,
                insurer_name: policy.insurer_name,
                premium_amount: policy.premium_amount,
                sum_insured: policy.sum_insured,
                expiry_date: policy.expiry_date,
                policy_docs: policy.policy_docs || [],
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error: any) {
        console.error('Error adding commercial policy:', error);
        throw new Error(error.message || 'Failed to add commercial policy');
    }
}

/**
 * Update a motor policy
 */
export async function updateMotorPolicy(id: string, updates: Partial<MotorPolicy>): Promise<void> {
    try {
        const { error } = await supabase
            .from('motor_policies')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error updating motor policy:', error);
        throw new Error(error.message || 'Failed to update motor policy');
    }
}

/**
 * Delete a motor policy
 */
export async function deleteMotorPolicy(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('motor_policies')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error deleting motor policy:', error);
        throw new Error(error.message || 'Failed to delete motor policy');
    }
}

/**
 * Update a GMC policy
 */
export async function updateGMCPolicy(id: string, updates: Partial<GMCPolicy>): Promise<void> {
    try {
        const { error } = await supabase
            .from('gmc_policies')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error updating GMC policy:', error);
        throw new Error(error.message || 'Failed to update GMC policy');
    }
}

/**
 * Delete a GMC policy
 */
export async function deleteGMCPolicy(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('gmc_policies')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error deleting GMC policy:', error);
        throw new Error(error.message || 'Failed to delete GMC policy');
    }
}

/**
 * Update a commercial policy
 */
export async function updateCommercialPolicy(id: string, updates: Partial<CommercialPolicy>): Promise<void> {
    try {
        const { error } = await supabase
            .from('commercial_policies')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error updating commercial policy:', error);
        throw new Error(error.message || 'Failed to update commercial policy');
    }
}

/**
 * Delete a commercial policy
 */
export async function deleteCommercialPolicy(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('commercial_policies')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error deleting commercial policy:', error);
        throw new Error(error.message || 'Failed to delete commercial policy');
    }
}

/**
 * Add a claim
 */
export async function addClaim(claim: Omit<Claim, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
        const { data, error } = await supabase
            .from('claims')
            .insert({
                user_id: claim.user_id,
                policy_id: claim.policy_id,
                lob_type: claim.lob_type,
                claim_type: claim.claim_type,
                incident_date: claim.incident_date,
                description: claim.description,
                supporting_docs: claim.supporting_docs || [],
                status: claim.status,
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error: any) {
        console.error('Error adding claim:', error);
        throw new Error(error.message || 'Failed to add claim');
    }
}

/**
 * Update a claim
 */
export async function updateClaim(id: string, updates: Partial<Claim>): Promise<void> {
    try {
        const { error } = await supabase
            .from('claims')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error updating claim:', error);
        throw new Error(error.message || 'Failed to update claim');
    }
}

/**
 * Add a quote request
 */
export async function addQuoteRequest(quote: Omit<QuoteRequest, 'id' | 'created_at'>): Promise<string> {
    try {
        const { data, error } = await supabase
            .from('quote_requests')
            .insert({
                user_id: quote.user_id,
                lob_type: quote.lob_type,
                details: quote.details,
                uploaded_quote: quote.uploaded_quote,
                has_better_quote: quote.has_better_quote,
                status: quote.status,
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error: any) {
        console.error('Error adding quote request:', error);
        throw new Error(error.message || 'Failed to add quote request');
    }
}

/**
 * Update a quote request
 */
export async function updateQuoteRequest(id: string, updates: Partial<QuoteRequest>): Promise<void> {
    try {
        const { error } = await supabase
            .from('quote_requests')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error updating quote request:', error);
        throw new Error(error.message || 'Failed to update quote request');
    }
}

/**
 * Get all referrals for a user
 */
export async function getUserReferrals(userId: string): Promise<Referral[]> {
    try {
        const { data, error } = await supabase
            .from('referrals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row) => convertDates(row)) as Referral[];
    } catch (error) {
        console.error('Error fetching referrals:', error.message, error.details, error.hint);
        return [];
    }
}

/**
 * Add a referral
 */
export async function addReferral(referral: Omit<Referral, 'id' | 'created_at'>): Promise<string> {
    try {
        const { data, error } = await supabase
            .from('referrals')
            .insert({
                user_id: referral.user_id,
                friend_name: referral.friend_name,
                friend_mobile: referral.friend_mobile,
                friend_email: referral.friend_email,
                notes: referral.notes,
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error: any) {
        console.error('Error adding referral:', error);
        throw new Error(error.message || 'Failed to add referral');
    }
}

/**
 * Log user field change for audit
 */
export async function logUserChange(
    userId: string,
    field: 'email' | 'mobile',
    oldValue: string,
    newValue: string
): Promise<void> {
    try {
        const { error } = await supabase
            .from('user_audit_log')
            .insert({
                user_id: userId,
                field_changed: field,
                old_value: oldValue,
                new_value: newValue,
            });

        if (error) throw error;
    } catch (error) {
        console.error('Error logging user change:', error);
    }
}

// --- Admin: User Management ---

/**
 * Get all users (Admin only)
 */
export async function getAllUsers(): Promise<User[]> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row) => convertDates(row)) as User[];
    } catch (error: any) {
        console.error('Error fetching all users:', error);
        return [];
    }
}

/**
 * Get user details by ID (Admin)
 */
export async function getUserById(userId: string): Promise<User | null> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return convertDates(data) as User;
    } catch (error: any) {
        console.error('Error fetching user details:', error);
        return null;
    }
}

/**
 * Update user status (Disable/Enable) - Mock implementation as 'status' field might not exist yet
 * In a real scenario, we would update a 'status' or 'is_active' column.
 * For now, we'll assume there's an 'is_active' column or similar in the 'users' table or just log it.
 */
export async function updateUserStatus(userId: string, status: 'active' | 'disabled'): Promise<void> {
    try {
        // TODO: Ensure 'status' column exists in users table.
        // For now, we will just log this action as if it happened.
        console.log(`Updating user ${userId} status to ${status}`);

        // const { error } = await supabase
        //     .from('users')
        //     .update({ status })
        //     .eq('id', userId);
        // if (error) throw error;
    } catch (error: any) {
        console.error('Error updating user status:', error);
        throw error;
    }
}



// ... (keeping imports)

/**
 * Get audit logs for a user (Admin)
 */
export async function getUserAuditLogs(userId: string): Promise<AuditLog[]> {
    try {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row) => convertDates(row)) as AuditLog[];
    } catch (error: any) {
        console.error('Error fetching audit logs:', error);
        return [];
    }
}

// --- Admin: Policy Management ---

/**
 * Get all motor policies (Admin)
 */
export async function getAllMotorPolicies(): Promise<MotorPolicy[]> {
    try {
        const { data, error } = await supabase
            .from('motor_policies')
            .select('*, users(name, email)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row) => ({
            ...convertDates(row),
            user_name: row.users?.name,
            user_email: row.users?.email
        })) as MotorPolicy[];
    } catch (error: any) {
        console.error('Error fetching all motor policies:', error);
        return [];
    }
}

/**
 * Get all GMC policies (Admin)
 */
export async function getAllGMCPolicies(): Promise<GMCPolicy[]> {
    try {
        const { data, error } = await supabase
            .from('gmc_policies')
            .select('*, users(name, email)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row) => ({
            ...convertDates(row),
            user_name: row.users?.name,
            user_email: row.users?.email
        })) as GMCPolicy[];
    } catch (error: any) {
        console.error('Error fetching all GMC policies:', error);
        return [];
    }
}

/**
 * Get all commercial policies (Admin)
 */
export async function getAllCommercialPolicies(): Promise<CommercialPolicy[]> {
    try {
        const { data, error } = await supabase
            .from('commercial_policies')
            .select('*, users(name, email)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row) => ({
            ...convertDates(row),
            user_name: row.users?.name,
            user_email: row.users?.email
        })) as CommercialPolicy[];
    } catch (error: any) {
        console.error('Error fetching all commercial policies:', error);
        return [];
    }
}

// --- Admin: Operations ---

/**
 * Get all claims (Admin)
 */
export async function getAllClaims(): Promise<Claim[]> {
    try {
        const { data, error } = await supabase
            .from('claims')
            .select('*, users(name, email)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row) => ({
            ...convertDates(row),
            user_name: row.users?.name,
            user_email: row.users?.email
        })) as Claim[];
    } catch (error: any) {
        console.error('Error fetching all claims:', error);
        return [];
    }
}

/**
 * Get all quote requests (Admin)
 */
export async function getAllQuoteRequests(): Promise<QuoteRequest[]> {
    try {
        const { data, error } = await supabase
            .from('quote_requests')
            .select('*, users(name, email)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row) => ({
            ...convertDates(row),
            user_name: row.users?.name,
            user_email: row.users?.email
        })) as QuoteRequest[];
    } catch (error: any) {
        console.error('Error fetching all quote requests:', error);
        return [];
    }
}

// --- Admin: System Configuration ---

/**
 * Get all app settings
 */
export async function getAppSettings(): Promise<AppSetting[]> {
    try {
        const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .order('key');

        if (error) throw error;

        return (data || []).map((row) => convertDates(row)) as AppSetting[];
    } catch (error: any) {
        console.error('Error fetching app settings:', error);
        return [];
    }
}

/**
 * Update an app setting
 */
export async function updateAppSetting(key: string, value: any): Promise<void> {
    try {
        const { error } = await supabase
            .from('app_settings')
            .upsert({ key, value, updated_at: new Date() });

        if (error) throw error;
    } catch (error: any) {
        console.error('Error updating app setting:', error);
        throw error;
    }
}

/**
 * Get all banners
 */
export async function getAllBanners(): Promise<Banner[]> {
    try {
        const { data, error } = await supabase
            .from('banners')
            .select('*')
            .order('display_order');

        if (error) throw error;

        return (data || []).map((row) => convertDates(row)) as Banner[];
    } catch (error: any) {
        console.error('Error fetching banners:', error);
        return [];
    }
}

/**
 * Add a banner
 */
export async function addBanner(banner: Omit<Banner, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
        const { error } = await supabase
            .from('banners')
            .insert(banner);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error adding banner:', error);
        throw error;
    }
}

/**
 * Delete a banner
 */
export async function deleteBanner(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('banners')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error deleting banner:', error);
        throw error;
    }
}

/**
 * Get all garages
 */
export async function getAllGarages(): Promise<Garage[]> {
    try {
        const { data, error } = await supabase
            .from('garages')
            .select('*')
            .order('name');

        if (error) throw error;

        return (data || []).map((row) => convertDates(row)) as Garage[];
    } catch (error: any) {
        console.error('Error fetching garages:', error);
        return [];
    }
}

/**
 * Add a garage
 */
export async function addGarage(garage: Omit<Garage, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
        const { error } = await supabase
            .from('garages')
            .insert(garage);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error adding garage:', error);
        throw error;
    }
}

/**
 * Delete a garage
 */
export async function deleteGarage(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('garages')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error deleting garage:', error);
        throw error;
    }
}
