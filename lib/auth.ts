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

        // Generate unique customer ID (OSV + 6 random alphanumeric characters)
        const customerId = 'OSV' + Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create user profile object
        const newUser: Omit<User, 'created_at' | 'updated_at'> = {
            id: authData.user.id,
            email,
            mobile,
            name,
            company_name: role === 'corporate' ? company_name : undefined,
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
                        console.log('User profile already exists, checking for orphan...');

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
                            console.log('Found orphaned profile. Linking to new Auth ID...');
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
            } catch (error: any) {
                retries--;
                if (retries === 0) {
                    console.error('Failed to create user profile after retries:', error);
                    throw new Error('Failed to create user profile. Please try again.');
                }
                console.log(`Retrying user profile creation... (${retries} attempts left)`);
            }
        }

        return {
            ...newUser,
            created_at: new Date(),
            updated_at: new Date(),
        };
    } catch (error: any) {
        console.error('Signup error:', error);
        throw new Error(error.message || 'Failed to sign up');
    }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) throw error;
    } catch (error: any) {
        console.error('Reset password error:', error);
        throw new Error(error.message || 'Failed to send reset password email');
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
        if (!authData.user) throw new Error('No user returned from sign in');

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
    } catch (error: any) {
        console.error('Sign in error:', error);
        throw new Error(error.message || 'Failed to sign in');
    }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    } catch (error: any) {
        console.error('Sign out error:', error);
        throw new Error(error.message || 'Failed to sign out');
    }
}

/**
 * Get current authenticated user's data from database
 */
export async function getCurrentUser(): Promise<User | null> {
    try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) return null;

        const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

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
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Get Supabase auth state change listener
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
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
    return hasRole(user, ['individual', 'corporate']);
}
