// Supabase Configuration
// Replace Firebase with Supabase

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

// Prevent crash if credentials are missing
const createMockClient = () => {
    const mockBuilder = {
        select: () => mockBuilder,
        insert: () => mockBuilder,
        update: () => mockBuilder,
        delete: () => mockBuilder,
        eq: () => mockBuilder,
        in: () => mockBuilder,
        order: () => mockBuilder,
        limit: () => mockBuilder,
        single: () => Promise.resolve({ data: null, error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        then: (resolve: any) => resolve({ data: [], error: null, count: 0 }),
    };

    return {
        from: () => mockBuilder,
        auth: {
            signUp: () => Promise.resolve({ data: {}, error: null }),
            signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
            signOut: () => Promise.resolve({ error: null }),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
        }
    } as any;
};

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createMockClient();

export default supabase;
