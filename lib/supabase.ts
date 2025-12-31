// Supabase Configuration
// Replace Firebase with Supabase

import { createClient as createBrowserClient } from '@/lib/supabase/client';

// Re-export the singleton instance for backward compatibility
// but prefer using createClient() from '@/lib/supabase/client' in client components
export const supabase = createBrowserClient();

export default supabase;
