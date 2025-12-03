'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock } from 'lucide-react';
import { signIn } from '@/lib/auth';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'individual';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await signIn(formData.email, formData.password);

            console.log('🔍 Login Debug - User role:', user.role);
            console.log('🔍 Login Debug - Full user:', user);

            // Redirect based on user role
            if (user.role === 'admin') {
                console.log('🔍 Redirecting to /admin/dashboard');
                router.push('/admin/dashboard');
            } else {
                // All other roles (individual, corporate_employee, corporate_admin) go to main dashboard
                console.log('🔍 Redirecting to /dashboard');
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Please check your credentials.');
        } finally {
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
                    <h2 className="text-3xl font-bold text-gray-900">
                        {type === 'corporate' ? 'Corporate Login' : 'Individual Login'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Access your insurance dashboard
                    </p>
                </div>

                {/* Login Type Toggle */}
                <div className="flex gap-2">
                    <Link
                        href="/login?type=individual"
                        className={`flex-1 py-2 px-4 text-center rounded-lg font-medium transition-all ${type === 'individual'
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Individual
                    </Link>
                    <Link
                        href="/login?type=corporate"
                        className={`flex-1 py-2 px-4 text-center rounded-lg font-medium transition-all ${type === 'corporate'
                            ? 'bg-secondary-600 text-white shadow-sm'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Corporate
                    </Link>
                </div>

                {/* Login Form */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="alert-error">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="label">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Email address
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
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input type="checkbox" className="rounded border-gray-300 text-primary-600 mr-2" />
                                <span className="text-sm text-gray-600">Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href={`/signup?type=${type}`} className="text-primary-600 font-medium hover:text-primary-700">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
