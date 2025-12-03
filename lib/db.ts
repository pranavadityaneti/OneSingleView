import { supabase } from './supabase';
import {
    MotorPolicy,
    HealthPolicy,
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
    UserPreferences,
    RMInfo,
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
 * Check for duplicate policy number
 */
async function checkDuplicatePolicy(table: string, userId: string, policyNumber: string): Promise<void> {
    const { data, error } = await supabase
        .from(table)
        .select('id')
        .eq('user_id', userId)
        .eq('policy_number', policyNumber)
        .maybeSingle();

    if (data) {
        throw new Error('This policy number already exists in your account');
    }
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

        return (data || []).map((row: any) => ({
            ...convertDates(row),
            id: row.id,
            user_id: row.user_id,
        })) as MotorPolicy[];
    } catch (error: any) {
        console.error('Error fetching motor policies:', error.message, error.details, error.hint);
        return [];
    }
}

/**
 * Get all GMC policies for a user
 */
export async function getUserHealthPolicies(userId: string): Promise<HealthPolicy[]> {
    try {
        const { data, error } = await supabase
            .from('health_policies')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row: any) => convertDates(row)) as HealthPolicy[];
    } catch (error: any) {
        console.error('Error fetching health policies:', error.message, error.details, error.hint);
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

        return (data || []).map((row: any) => convertDates(row)) as CommercialPolicy[];
    } catch (error: any) {
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

        return (data || []).map((row: any) => convertDates(row)) as Claim[];
    } catch (error: any) {
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

        return (data || []).map((row: any) => convertDates(row)) as QuoteRequest[];
    } catch (error: any) {
        console.error('Error fetching quote requests:', error);
        return [];
    }
}

/**
 * Add a motor policy
 */
export async function addMotorPolicy(policy: Omit<MotorPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
        await checkDuplicatePolicy('motor_policies', policy.user_id, policy.policy_number);

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
export async function addHealthPolicy(policy: Omit<HealthPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
        await checkDuplicatePolicy('health_policies', policy.user_id, policy.policy_number);

        const { data, error } = await supabase
            .from('health_policies')
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
        console.error('Error adding health policy:', error);
        throw new Error(error.message || 'Failed to add health policy');
    }
}

/**
 * Add a commercial policy
 */
export async function addCommercialPolicy(policy: Omit<CommercialPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
        await checkDuplicatePolicy('commercial_policies', policy.user_id, policy.policy_number);

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
export async function updateHealthPolicy(id: string, updates: Partial<HealthPolicy>): Promise<void> {
    try {
        const { error } = await supabase
            .from('health_policies')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error updating health policy:', error);
        throw new Error(error.message || 'Failed to update health policy');
    }
}

/**
 * Delete a GMC policy
 */
export async function deleteHealthPolicy(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('health_policies')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error deleting health policy:', error);
        throw new Error(error.message || 'Failed to delete health policy');
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

        return (data || []).map((row: any) => convertDates(row)) as Referral[];
    } catch (error: any) {
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
    } catch (error: any) {
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

        return (data || []).map((row: any) => convertDates(row)) as User[];
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
            .from('user_audit_log')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row: any) => convertDates(row)) as AuditLog[];
    } catch (error: any) {
        console.error('Error fetching audit logs:', error.message || error);
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

        return (data || []).map((row: any) => ({
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
export async function getAllHealthPolicies(): Promise<HealthPolicy[]> {
    try {
        const { data, error } = await supabase
            .from('health_policies')
            .select('*, users(name, email)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row: any) => ({
            ...convertDates(row),
            user_name: row.users?.name,
            user_email: row.users?.email
        })) as HealthPolicy[];
    } catch (error: any) {
        console.error('Error fetching all health policies:', error);
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

        return (data || []).map((row: any) => ({
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

        return (data || []).map((row: any) => ({
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

        return (data || []).map((row: any) => ({
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

        return (data || []).map((row: any) => convertDates(row)) as AppSetting[];
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

        return (data || []).map((row: any) => convertDates(row)) as Banner[];
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

        return (data || []).map((row: any) => convertDates(row)) as Garage[];
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

// ============================================
// PROFILE MANAGEMENT FUNCTIONS
// ============================================

/**
 * Update user profile information
 */
export async function updateUserProfile(
    userId: string,
    updates: {
        name?: string;
        mobile?: string;
        company_name?: string;
        address?: string;
    }
): Promise<User> {
    try {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return convertDates(data) as User;
    } catch (error: any) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

/**
 * Get Relationship Manager (RM) details for a user
 */
export async function getUserRM(userId: string): Promise<RMInfo | null> {
    try {
        // First get the user's rm_id
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('rm_id')
            .eq('id', userId)
            .single();

        if (userError) {
            // If user not found or error, return default RM for demo
            console.log('Error fetching user for RM, returning default:', userError);
            return {
                name: 'Amit Sharma',
                email: 'amit.sharma@onesingleview.com',
                mobile: '+91 98765 43210'
            };
        }

        if (!user?.rm_id) {
            // Return default RM if none assigned
            return {
                name: 'Amit Sharma',
                email: 'amit.sharma@onesingleview.com',
                mobile: '+91 98765 43210'
            };
        }

        // Then get the RM's details
        const { data: rm, error: rmError } = await supabase
            .from('users')
            .select('name, email, mobile')
            .eq('id', user.rm_id)
            .single();

        if (rmError) throw rmError;
        return rm as RMInfo;
    } catch (error: any) {
        console.error('Error fetching user RM:', error);
        // Return default RM on error to ensure UI shows something
        return {
            name: 'Amit Sharma',
            email: 'amit.sharma@onesingleview.com',
            mobile: '+91 98765 43210'
        };
    }
}

/**
 * Get user preferences, creating defaults if none exist
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // No preferences yet, create default
            return await createDefaultPreferences(userId);
        }

        if (error) throw error;
        return convertDates(data) as UserPreferences;
    } catch (error: any) {
        console.error('Error fetching user preferences:', error);
        throw error;
    }
}

/**
 * Create default preferences for a user
 */
async function createDefaultPreferences(userId: string): Promise<UserPreferences> {
    try {
        const defaultPrefs = {
            user_id: userId,
            email_notifications: true,
            sms_notifications: false,
            policy_expiry_alerts: true,
            claim_updates: true,
        };

        const { data, error } = await supabase
            .from('user_preferences')
            .insert(defaultPrefs)
            .select()
            .single();

        if (error) throw error;
        return convertDates(data) as UserPreferences;
    } catch (error: any) {
        console.error('Error creating default preferences:', error);
        throw error;
    }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
    userId: string,
    preferences: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserPreferences> {
    try {
        const { data, error } = await supabase
            .from('user_preferences')
            .upsert({
                user_id: userId,
                ...preferences,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return convertDates(data) as UserPreferences;
    } catch (error: any) {
        console.error('Error updating user preferences:', error);
        throw error;
    }
}

// Life Policies
export async function getUserLifePolicies(userId: string) {
    const { data, error } = await supabase
        .from('life_policies')
        .select('*')
        .eq('user_id', userId)
        .order('policy_end_date', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => convertDates(row));
}

export async function addLifePolicy(policy: any) {
    await checkDuplicatePolicy('life_policies', policy.user_id, policy.policy_number);
    const { data, error } = await supabase
        .from('life_policies')
        .insert([policy])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Travel Policies
export async function getUserTravelPolicies(userId: string) {
    const { data, error } = await supabase
        .from('travel_policies')
        .select('*')
        .eq('user_id', userId)
        .order('policy_end_date', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => convertDates(row));
}

export async function addTravelPolicy(policy: any) {
    await checkDuplicatePolicy('travel_policies', policy.user_id, policy.policy_number);
    const { data, error } = await supabase
        .from('travel_policies')
        .insert([policy])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get company's GMC policy by company name
 * Used by corporate employees to find their company's group health policy
 */
export async function getCompanyGMCPolicy(companyName: string) {
    const { data, error } = await supabase
        .from('health_policies')
        .select('*')
        .eq('company_name', companyName)
        .maybeSingle();

    if (error) throw error;
    return data ? convertDates(data) : null;
}

// Cyber Policies
export async function getUserCyberPolicies(userId: string) {
    const { data, error } = await supabase
        .from('cyber_policies')
        .select('*')
        .eq('user_id', userId)
        .order('policy_end_date', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => convertDates(row));
}

export async function addCyberPolicy(policy: any) {
    await checkDuplicatePolicy('cyber_policies', policy.user_id, policy.policy_number);
    const { data, error } = await supabase
        .from('cyber_policies')
        .insert([policy])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Notifications
export async function getUserNotifications(userId: string) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) throw error;
    return (data || []).map((row: any) => convertDates(row));
}

export async function markNotificationAsRead(notificationId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    if (error) throw error;
}

export async function markAllNotificationsAsRead(userId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) throw error;
}
/**
 * Upload user avatar
 */
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload file
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        // Get public URL
        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Update user profile
        const { error: updateError } = await supabase
            .from('users')
            .update({ avatar_url: data.publicUrl })
            .eq('id', userId);

        if (updateError) {
            throw updateError;
        }

        return data.publicUrl;
    } catch (error: any) {
        console.error('Error uploading avatar:', error.message);
        return null;
    }
}
