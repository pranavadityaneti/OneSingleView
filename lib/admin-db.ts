import { supabase } from './supabase';
import { User, MotorPolicy, HealthPolicy, CommercialPolicy, Claim, QuoteRequest } from '@/types';
import { getAllUsers, getAllMotorPolicies, getAllHealthPolicies, getAllCommercialPolicies, getAllClaims, getAllQuoteRequests } from './db';

// --- Types for Admin Dashboard ---

export interface AdminMetrics {
    totalUsers: {
        total: number;
        individual: number;
        corporate: number;
    };
    policies: {
        total: number;
        active: number;
        expired: number;
        expiringSoon: number; // Next 20 days
    };
    claims: {
        raisedThisMonth: number;
        total: number;
        pending: number;
        settled: number;
        rejected: number;
    };
    quotes: {
        open: number;
        total: number;
        pending: number;
        completed: number;
    };
}

export interface ExpiryOverview {
    range0to7: number;
    range8to15: number;
    range16to20: number;
    topExpiring: Array<{
        id: string;
        policyNumber: string;
        customerName: string;
        lob: string;
        expiryDate: string;
        rmName: string;
    }>;
}

export interface ActivityLog {
    id: string;
    type: 'signup' | 'update' | 'upload';
    description: string;
    timestamp: string;
    userId: string;
    userName: string;
}

// --- Data Fetching Functions ---

export async function getAdminDashboardMetrics(): Promise<AdminMetrics> {
    try {
        // 1. Users
        const { data: users } = await supabase.from('users').select('role');
        const totalUsers = users?.length || 0;
        const individual = users?.filter((u: any) => u.role === 'customer').length || 0;
        const corporate = users?.filter((u: any) => u.role === 'corporate').length || 0;

        // 2. Policies (Aggregate from all tables)
        const { data: motor } = await supabase.from('motor_policies').select('status, policy_end_date');
        const { data: health } = await supabase.from('health_policies').select('status, policy_end_date');
        const { data: commercial } = await supabase.from('commercial_policies').select('status, policy_end_date');

        const allPolicies = [...(motor || []), ...(health || []), ...(commercial || [])];
        const totalPolicies = allPolicies.length;
        const active = allPolicies.filter(p => p.status === 'Active').length;
        const expired = allPolicies.filter(p => p.status === 'Expired').length;

        const today = new Date();
        const twentyDaysFromNow = new Date();
        twentyDaysFromNow.setDate(today.getDate() + 20);

        const expiringSoon = allPolicies.filter(p => {
            if (!p.policy_end_date) return false;
            const endDate = new Date(p.policy_end_date);
            return endDate >= today && endDate <= twentyDaysFromNow;
        }).length;

        // 3. Claims
        const { data: claims } = await supabase.from('claims').select('status, created_at');
        const totalClaims = claims?.length || 0;
        const pendingClaims = claims?.filter((c: any) => c.status === 'New' || c.status === 'In Progress').length || 0;
        const settledClaims = claims?.filter((c: any) => c.status === 'Settled').length || 0;
        const rejectedClaims = claims?.filter((c: any) => c.status === 'Rejected').length || 0;

        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const raisedThisMonth = claims?.filter((c: any) => new Date(c.created_at) >= firstDayOfMonth).length || 0;

        // 4. Quotes
        const { data: quotes } = await supabase.from('quote_requests').select('status');
        const totalQuotes = quotes?.length || 0;
        const openQuotes = quotes?.filter((q: any) => q.status === 'New' || q.status === 'In Progress').length || 0;
        const pendingQuotes = quotes?.filter((q: any) => q.status === 'New').length || 0;
        const completedQuotes = quotes?.filter((q: any) => q.status === 'Completed').length || 0;

        return {
            totalUsers: { total: totalUsers, individual, corporate },
            policies: { total: totalPolicies, active, expired, expiringSoon },
            claims: { total: totalClaims, pending: pendingClaims, settled: settledClaims, rejected: rejectedClaims, raisedThisMonth },
            quotes: { total: totalQuotes, open: openQuotes, pending: pendingQuotes, completed: completedQuotes }
        };
    } catch (error) {
        console.error('Error fetching admin metrics:', error);
        return {
            totalUsers: { total: 0, individual: 0, corporate: 0 },
            policies: { total: 0, active: 0, expired: 0, expiringSoon: 0 },
            claims: { total: 0, pending: 0, settled: 0, rejected: 0, raisedThisMonth: 0 },
            quotes: { total: 0, open: 0, pending: 0, completed: 0 }
        };
    }
}

export async function getExpiringPoliciesAdmin(): Promise<ExpiryOverview> {
    try {
        // Fetch all active policies with end dates
        const { data: motor } = await supabase.from('motor_policies').select('id, policy_number, policy_end_date, user_id').eq('status', 'Active');
        const { data: health } = await supabase.from('health_policies').select('id, policy_number, policy_end_date, user_id').eq('status', 'Active');
        const { data: commercial } = await supabase.from('commercial_policies').select('id, policy_number, policy_end_date, user_id').eq('status', 'Active');

        // Fetch all users to map names
        const { data: users } = await supabase.from('users').select('id, name');
        const userMap = new Map(users?.map((u: any) => [u.id, u.name]) || []);

        const formatPolicy = (p: any, type: string) => ({
            id: p.id,
            policyNumber: p.policy_number,
            customerName: userMap.get(p.user_id) || 'Unknown',
            lob: type,
            expiryDate: p.policy_end_date,
            rmName: 'Unassigned' // Mock for now
        });

        const allPolicies = [
            ...(motor || []).map((p: any) => formatPolicy(p, 'Motor')),
            ...(health || []).map((p: any) => formatPolicy(p, 'Health')),
            ...(commercial || []).map((p: any) => formatPolicy(p, 'Commercial'))
        ];

        const today = new Date();
        const day7 = new Date(today); day7.setDate(today.getDate() + 7);
        const day15 = new Date(today); day15.setDate(today.getDate() + 15);
        const day20 = new Date(today); day20.setDate(today.getDate() + 20);

        const range0to7 = allPolicies.filter((p: any) => {
            const d = new Date(p.expiryDate);
            return d >= today && d <= day7;
        }).length;

        const range8to15 = allPolicies.filter((p: any) => {
            const d = new Date(p.expiryDate);
            return d > day7 && d <= day15;
        }).length;

        const range16to20 = allPolicies.filter((p: any) => {
            const d = new Date(p.expiryDate);
            return d > day15 && d <= day20;
        }).length;

        // Top 5 expiring soon
        const topExpiring = allPolicies
            .filter(p => new Date(p.expiryDate) >= today)
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
            .slice(0, 5);

        return { range0to7, range8to15, range16to20, topExpiring };
    } catch (error) {
        console.error('Error fetching expiry overview:', error);
        return { range0to7: 0, range8to15: 0, range16to20: 0, topExpiring: [] };
    }
}

export async function getRecentActivity(): Promise<ActivityLog[]> {
    try {
        // Fetch recent user signups
        const { data: users } = await supabase
            .from('users')
            .select('id, name, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        // Fetch recent policy creations (if created_at exists on policies)
        // For now, mixing in user signups is a good start for "real" activity

        return (users || []).map((u: any) => ({
            id: u.id,
            type: 'signup',
            description: 'New user registration',
            timestamp: u.created_at,
            userId: u.id,
            userName: u.name || 'Unknown User'
        }));
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        return [];
    }
}

export async function getPoliciesByLOB() {
    try {
        const { count: motor } = await supabase.from('motor_policies').select('*', { count: 'exact', head: true });
        const { count: health } = await supabase.from('health_policies').select('*', { count: 'exact', head: true });
        const { count: commercial } = await supabase.from('commercial_policies').select('*', { count: 'exact', head: true });

        return [
            { name: 'Motor', value: motor || 0, fill: '#3B82F6' },
            { name: 'Health', value: health || 0, fill: '#10B981' },
            { name: 'Commercial', value: commercial || 0, fill: '#F59E0B' },
            { name: 'Others', value: 0, fill: '#6366F1' }
        ];
    } catch (error) {
        return [];
    }
}
// ... existing code ...

export async function getDuplicateAlerts() {
    try {
        // Check for duplicate vehicle numbers in Motor policies
        const { data: motorPolicies } = await supabase
            .from('motor_policies')
            .select('id, policy_number, vehicle_number, user_id')
            .eq('status', 'Active');

        if (!motorPolicies) return [];

        // Fetch users for names
        const userIds = [...new Set(motorPolicies.map((p: any) => p.user_id))];
        const { data: users } = await supabase.from('users').select('id, name').in('id', userIds);
        const userMap = new Map(users?.map((u: any) => [u.id, u.name]) || []);

        const vehicleMap = new Map();
        const duplicates: any[] = [];

        motorPolicies.forEach((p: any) => {
            const customerName = userMap.get(p.user_id) || 'Unknown';
            if (vehicleMap.has(p.vehicle_number)) {
                duplicates.push({
                    type: 'Vehicle Number',
                    value: p.vehicle_number,
                    policy1: vehicleMap.get(p.vehicle_number),
                    policy2: { id: p.id, policyNumber: p.policy_number, customerName }
                });
            } else {
                vehicleMap.set(p.vehicle_number, { id: p.id, policyNumber: p.policy_number, customerName });
            }
        });

        return duplicates;
    } catch (error) {
        console.error('Error checking duplicates:', error);
        return [];
    }
}

export async function getDocumentVerificationPending() {
    try {
        // Fetch policies that might need verification. 
        // Since we don't have a specific status, we'll look for recently created policies
        // This is a placeholder for "real" logic until a verification flow is built

        const { data: recentPolicies } = await supabase
            .from('motor_policies')
            .select('id, policy_number, user_id, created_at')
            .order('created_at', { ascending: false })
            .limit(3);

        if (!recentPolicies) return [];

        const userIds = recentPolicies.map((p: any) => p.user_id);
        const { data: users } = await supabase.from('users').select('id, name').in('id', userIds);
        const userMap = new Map(users?.map((u: any) => [u.id, u.name]) || []);

        return recentPolicies.map((p: any) => ({
            id: p.id,
            customerName: userMap.get(p.user_id) || 'Unknown',
            docType: 'Policy Document',
            lob: 'Motor',
            date: p.created_at
        }));
    } catch (error) {
        console.error('Error fetching doc verification:', error);
        return [];
    }
}

export async function getRMPerformance() {
    try {
        // Since we don't have RM profiles, we'll try to aggregate from users who have an rm_id
        // This is a best-effort fallback to show *some* real data structure

        // 1. Get all RMs (users with role 'rm' or 'admin')
        const { data: rms } = await supabase
            .from('users')
            .select('id, name')
            .in('role', ['rm', 'admin']);

        if (!rms || rms.length === 0) return null;

        // 2. For each RM, count their assigned users (as a proxy for performance)
        const rmStats = await Promise.all(rms.map(async (rm: any) => {
            const { count } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('rm_id', rm.id);

            return {
                name: rm.name,
                initials: rm.name ? rm.name.substring(0, 2).toUpperCase() : 'RM',
                policies: count || 0, // Using user count as proxy for policies for now
                claims: 0, // No direct link yet
                rating: 5.0 // Default
            };
        }));

        const sortedRMs = rmStats.sort((a, b) => b.policies - a.policies);
        const topPerformer = sortedRMs[0];

        return {
            topPerformer,
            allRMs: sortedRMs
        };

    } catch (error) {
        console.error('Error fetching RM performance:', error);
        return null;
    }
}
