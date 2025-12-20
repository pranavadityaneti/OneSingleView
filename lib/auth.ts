import { supabase } from './supabase';
import { User, UserRole } from '@/types';

/**
 * Sign up a new user with email and password
 */
export async function signUp(
    email: string,
    password: string,
    name: string,
    mobile: string,
    role: UserRole,
    company_name?: string
): Promise<User> {
    try {
        // Create auth user with Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No user returned from signup');

        // Generate unique customer ID (1SV- + 6 random alphanumeric characters)
        const customerId = '1SV-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create user profile object
        const newUser: Omit<User, 'created_at' | 'updated_at'> = {
            id: authData.user.id,
            email,
            mobile,
            name,
            company_name: (role === 'corporate_employee' || role === 'corporate_admin') ? company_name : undefined,
            role,
            customer_id: customerId,
        };

        // Retry logic for creating user profile to handle race conditions
        let retries = 3;
        while (retries > 0) {
            try {
                // Wait for auth user to be propagated
                await new Promise(resolve => setTimeout(resolve, 1000));

                const { error: dbError } = await supabase
                    .from('users')
                    .insert({
                        id: authData.user.id,
                        email: newUser.email,
                        mobile: newUser.mobile,
                        name: newUser.name,
                        company_name: newUser.company_name,
                        role: newUser.role,
                        customer_id: newUser.customer_id,
                    });

                if (dbError) {
                    // If foreign key violation, throw to catch block to retry
                    if (dbError.code === '23503') throw dbError;

                    // If unique violation (409), check if profile already exists
                    if (dbError.code === '23505') { // Postgres unique violation code

                        // Check if a profile exists with this email but different ID (orphaned)
                        const { data: existingProfile, error: fetchError } = await supabase
                            .from('users')
                            .select('*')
                            .eq('email', email)
                            .maybeSingle();

                        if (!fetchError && existingProfile) {
                            // If ID matches, it's a duplicate signup attempt, just return it
                            if (existingProfile.id === authData.user.id) {
                                return {
                                    ...existingProfile,
                                    created_at: new Date(existingProfile.created_at),
                                    updated_at: new Date(existingProfile.updated_at),
                                };
                            }

                            // If ID doesn't match, it's an orphaned profile. Update it with new Auth ID.
                            const { error: updateError } = await supabase
                                .from('users')
                                .update({
                                    id: authData.user.id,
                                    updated_at: new Date().toISOString()
                                })
                                .eq('email', email);

                            if (updateError) {
                                console.error('Failed to link orphaned profile:', updateError);
                                throw updateError;
                            }

                            // Return the updated profile
                            return {
                                ...existingProfile,
                                id: authData.user.id, // Use new ID
                                created_at: new Date(existingProfile.created_at),
                                updated_at: new Date(),
                            };
                        }
                    }

                    // Other errors, throw immediately
                    throw dbError;
                }

                // Success
                break;
            } catch (error: unknown) {
                retries--;
                if (retries === 0) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    console.error('Failed to create user profile after retries:', message);
                    throw new Error('Failed to create user profile. Please try again.');
                }
            }
        }

        return {
            ...newUser,
            created_at: new Date(),
            updated_at: new Date(),
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to sign up';
        throw new Error(message);
    }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/update-password` : 'http://localhost:3000/update-password',
        });
        if (error) throw error;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to send reset password email';
        throw new Error(message);
    }
}

/**
 * Sign in existing user with email and password
 */
export async function signIn(email: string, password: string): Promise<User> {
    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });


        if (authError) throw authError;
        if (!authData.user) {
            console.error('No user in authData:', authData);
            throw new Error('No user returned from sign in');
        }

        // Fetch user data from database
        const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

        if (dbError) throw dbError;
        if (!userData) throw new Error('User profile not found. Please contact support.');

        return {
            id: userData.id,
            email: userData.email,
            mobile: userData.mobile,
            name: userData.name,
            company_name: userData.company_name,
            role: userData.role,
            created_at: new Date(userData.created_at),
            updated_at: new Date(userData.updated_at),
            rm_id: userData.rm_id,
            customer_id: userData.customer_id,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to sign in';
        throw new Error(message);
    }
}

/**
 * Sign in with phone number - sends OTP
 */
export async function signInWithPhone(phone: string): Promise<void> {
    try {
        const { error } = await supabase.auth.signInWithOtp({
            phone,
        });
        if (error) throw error;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to send OTP';
        throw new Error(message);
    }
}

/**
 * Verify OTP and sign in
 */
export async function verifyOtp(phone: string, token: string): Promise<User> {
    try {
        const { data: authData, error: authError } = await supabase.auth.verifyOtp({
            phone,
            token,
            type: 'sms',
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No user returned from OTP verification');

        // Check if user profile exists
        const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('mobile', phone.replace('+91', '').replace('+', ''))
            .maybeSingle();

        if (dbError) throw dbError;

        // If no profile found, try by auth ID
        if (!userData) {
            const { data: userById, error: byIdError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .maybeSingle();

            if (byIdError) throw byIdError;
            if (!userById) throw new Error('User profile not found. Please sign up first.');

            return {
                id: userById.id,
                email: userById.email,
                mobile: userById.mobile,
                name: userById.name,
                company_name: userById.company_name,
                role: userById.role,
                created_at: new Date(userById.created_at),
                updated_at: new Date(userById.updated_at),
                rm_id: userById.rm_id,
                customer_id: userById.customer_id,
            };
        }

        return {
            id: userData.id,
            email: userData.email,
            mobile: userData.mobile,
            name: userData.name,
            company_name: userData.company_name,
            role: userData.role,
            created_at: new Date(userData.created_at),
            updated_at: new Date(userData.updated_at),
            rm_id: userData.rm_id,
            customer_id: userData.customer_id,
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to verify OTP';
        throw new Error(message);
    }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to sign out';
        throw new Error(message);
    }
}

/**
 * Get current authenticated user's data from database
 * Includes 10-second timeout to prevent hanging on Supabase connection issues
 */
export async function getCurrentUser(): Promise<User | null> {
    try {
        // Create a timeout promise to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Auth check timed out - please check your network connection')), 10000);
        });

        // Race the auth call against the timeout
        const authResult = await Promise.race([
            supabase.auth.getUser(),
            timeoutPromise
        ]);

        const authUser = authResult.data?.user;

        if (!authUser) return null;

        // Create another timeout for database query
        const dbTimeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Database query timed out')), 10000);
        });

        const dbResult = await Promise.race([
            supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle(),
            dbTimeoutPromise
        ]);

        const userData = dbResult.data;
        const error = dbResult.error;

        if (error) {
            console.error('Error fetching user data:', error);
            return null;
        }

        if (!userData) {
            console.warn('User authenticated but no profile found');
            return null;
        }

        return {
            id: userData.id,
            email: userData.email,
            mobile: userData.mobile,
            name: userData.name,
            company_name: userData.company_name,
            role: userData.role,
            created_at: new Date(userData.created_at),
            updated_at: new Date(userData.updated_at),
            rm_id: userData.rm_id,
            customer_id: userData.customer_id,
        };
    } catch (error) {
        // Re-throw timeout errors so the caller can show appropriate UI
        if (error instanceof Error && error.message.includes('timed out')) {
            // Don't log timeout errors to console - they're expected network issues
            throw error;
        }
        // For other errors, return null to trigger login redirect
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Get Supabase auth state change listener
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event: string, session: { user?: { id: string } } | null) => {
        if (session?.user) {
            const user = await getCurrentUser();
            callback(user);
        } else {
            callback(null);
        }
    });
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, roles: UserRole[]): boolean {
    return user ? roles.includes(user.role) : false;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
    return hasRole(user, ['admin']);
}

/**
 * Check if user is customer (individual or corporate)
 */
export function isCustomer(user: User | null): boolean {
    return hasRole(user, ['individual', 'corporate_employee', 'corporate_admin']);
}
