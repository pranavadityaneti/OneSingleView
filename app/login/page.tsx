'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { signIn, signInWithPhone, verifyOtp, signInWithEmailOtp, verifyEmailOtp } from '@/lib/auth';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'individual';

    const [loginMethod, setLoginMethod] = useState<'email' | 'emailOtp' | 'phone'>('email');
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phone: '',
        otp: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await signIn(formData.email, formData.password);

            if (user.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmailOtp = async () => {
        if (!formData.email || !formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await signInWithEmailOtp(formData.email);
            setEmailOtpSent(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmailOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.otp || formData.otp.length !== 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const user = await verifyEmailOtp(formData.email, formData.otp);

            if (user?.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!formData.phone || formData.phone.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setError('');
        setLoading(true);

        try {
            // Format phone with country code if not present
            const phoneNumber = formData.phone.startsWith('+')
                ? formData.phone
                : `+91${formData.phone}`;

            await signInWithPhone(phoneNumber);
            setOtpSent(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.otp || formData.otp.length !== 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const phoneNumber = formData.phone.startsWith('+')
                ? formData.phone
                : `+91${formData.phone}`;

            const user = await verifyOtp(phoneNumber, formData.otp);

            if (user?.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center justify-center mb-6">
                        <img src="/images/brand-logo.png" alt="1SingleView" className="h-16 w-auto" />
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

                {/* Login Method Toggle */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => {
                            setLoginMethod('email');
                            setOtpSent(false);
                            setEmailOtpSent(false);
                            setError('');
                        }}
                        className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${loginMethod === 'email'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Lock className="w-4 h-4" />
                        Password
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setLoginMethod('emailOtp');
                            setEmailOtpSent(false);
                            setOtpSent(false);
                            setError('');
                            setFormData({ ...formData, otp: '' });
                        }}
                        className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${loginMethod === 'emailOtp'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Email OTP
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setLoginMethod('phone');
                            setOtpSent(false);
                            setEmailOtpSent(false);
                            setError('');
                        }}
                        className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${loginMethod === 'phone'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Phone className="w-4 h-4" />
                        Phone
                    </button>
                </div>

                {/* Login Form */}
                <div className="card">
                    {error && (
                        <div className="alert-error mb-4">
                            {error}
                        </div>
                    )}

                    {loginMethod === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                    ) : loginMethod === 'emailOtp' ? (
                        <div className="space-y-6">
                            {!emailOtpSent ? (
                                <>
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

                                    <button
                                        type="button"
                                        onClick={handleSendEmailOtp}
                                        disabled={loading || !formData.email.includes('@')}
                                        className="btn-primary w-full flex items-center justify-center gap-2"
                                    >
                                        {loading ? 'Sending OTP...' : (
                                            <>
                                                Send OTP to Email
                                                <Sparkles className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <form onSubmit={handleVerifyEmailOtp} className="space-y-6">
                                    <div>
                                        <label className="label">
                                            Enter OTP sent to {formData.email}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="input text-center text-2xl tracking-widest"
                                            placeholder="000000"
                                            maxLength={6}
                                            value={formData.otp}
                                            onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || formData.otp.length !== 6}
                                        className="btn-primary w-full"
                                    >
                                        {loading ? 'Verifying...' : 'Verify & Login'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmailOtpSent(false);
                                            setFormData({ ...formData, otp: '' });
                                        }}
                                        className="text-sm text-primary-600 hover:text-primary-700 w-full text-center"
                                    >
                                        Change email address
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {!otpSent ? (
                                <>
                                    <div>
                                        <label className="label">
                                            <Phone className="w-4 h-4 inline mr-2" />
                                            Phone Number
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm">
                                                +91
                                            </div>
                                            <input
                                                type="tel"
                                                required
                                                className="input flex-1"
                                                placeholder="9876543210"
                                                maxLength={10}
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={loading || formData.phone.length < 10}
                                        className="btn-primary w-full flex items-center justify-center gap-2"
                                    >
                                        {loading ? 'Sending OTP...' : (
                                            <>
                                                Send OTP
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div>
                                        <label className="label">
                                            Enter OTP sent to +91 {formData.phone}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="input text-center text-2xl tracking-widest"
                                            placeholder="000000"
                                            maxLength={6}
                                            value={formData.otp}
                                            onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || formData.otp.length !== 6}
                                        className="btn-primary w-full"
                                    >
                                        {loading ? 'Verifying...' : 'Verify & Login'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOtpSent(false);
                                            setFormData({ ...formData, otp: '' });
                                        }}
                                        className="text-sm text-primary-600 hover:text-primary-700 w-full text-center"
                                    >
                                        Change phone number
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

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
