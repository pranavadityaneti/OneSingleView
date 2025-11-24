
import { createClient } from '@supabase/supabase-js';
import {
    getAdminDashboardMetrics,
    getExpiringPoliciesAdmin,
    getRecentActivity,
    getPoliciesByLOB,
    getDuplicateAlerts,
    getDocumentVerificationPending,
    getRMPerformance
} from './lib/admin-db';

// Mock supabase client for the imported functions to use if they import it directly
// But wait, the functions import 'supabase' from './supabase'. 
// I need to make sure that './supabase' works in this script context.
// It likely uses process.env.

const measure = async (name: string, fn: () => Promise<any>) => {
    console.log(`Starting ${name}...`);
    const start = Date.now();
    try {
        await fn();
        console.log(`Finished ${name} in ${Date.now() - start}ms`);
    } catch (e) {
        console.error(`Failed ${name}:`, e);
    }
};

async function runDebug() {
    console.log("Debugging Dashboard Data Fetching...");

    await measure('getAdminDashboardMetrics', getAdminDashboardMetrics);
    await measure('getExpiringPoliciesAdmin', getExpiringPoliciesAdmin);
    await measure('getRecentActivity', getRecentActivity);
    await measure('getPoliciesByLOB', getPoliciesByLOB);
    await measure('getDuplicateAlerts', getDuplicateAlerts);
    await measure('getDocumentVerificationPending', getDocumentVerificationPending);
    await measure('getRMPerformance', getRMPerformance);

    console.log("Debug Complete");
}

runDebug();
