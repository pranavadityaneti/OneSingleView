'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, User, Phone, Building } from 'lucide-react';
import { signUp } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types';

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'individual';

    const [formData, setFormData] = useState({
        name: '',
        company_name: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Sign out any existing user when visiting signup page
    useEffect(() => {
        const performSignOut = async () => {
            await supabase.auth.signOut();
        };
        performSignOut();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (type === 'corporate' && !formData.company_name) {
            setError('Company name is required for corporate accounts');
            return;
        }

        setLoading(true);

        try {
            const role: UserRole = type === 'corporate' ? 'corporate' : 'individual';

            await signUp(
                formData.email,
                formData.password,
                formData.name,
                formData.mobile,
                role,
                type === 'corporate' ? formData.company_name : undefined
            );

            // Check if we have an active session after signup
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // User is logged in (auto-confirm enabled)
                // Signup form only creates individual/corporate users, so redirect to customer dashboard
                window.scrollTo(0, 0); // Scroll to top before redirect
                router.push('/dashboard');
            } else {
                // User needs to confirm email
                setError('Account created! Please check your email to confirm your account before logging in.');
                setLoading(false);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create account. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center space-x-2 mb-6">
                        <Shield className="w-10 h-10 text-primary-600" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            One Single View
                        </span>
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {type === 'corporate' ? 'Corporate Account' : 'Individual Account'}
                    </p>
                </div>

                {/* Signup Type Toggle */}
                <div className="flex gap-2">
                    <Link
                        href="/signup?type=individual"
                        className={`flex-1 py-2 px-4 text-center rounded-lg font-medium transition-all ${type === 'individual'
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Individual
                    </Link>
                    <Link
                        href="/signup?type=corporate"
                        className={`flex-1 py-2 px-4 text-center rounded-lg font-medium transition-all ${type === 'corporate'
                            ? 'bg-secondary-600 text-white shadow-sm'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Corporate
                    </Link>
                </div>

                {/* Signup Form */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="alert-error">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="label">
                                <User className="w-4 h-4 inline mr-2" />
                                {type === 'corporate' ? 'Your Name' : 'Full Name'}
                            </label>
                            <input
                                type="text"
                                required
                                className="input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {type === 'corporate' && (
                            <div>
                                <label className="label">
                                    <Building className="w-4 h-4 inline mr-2" />
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    placeholder="Acme Corporation"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                />
                            </div>
                        )}

                        <div>
                            <label className="label">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                className="input"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="label">
                                <Phone className="w-4 h-4 inline mr-2" />
                                Mobile Number
                            </label>
                            <input
                                type="tel"
                                required
                                className="input"
                                placeholder="+91 98765 43210"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="label">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                className="input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                        </div>

                        <div>
                            <label className="label">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                required
                                className="input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href={`/login?type=${type}`} className="text-primary-600 font-medium hover:text-primary-700">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SignupForm />
        </Suspense>
    );
}
