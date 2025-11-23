'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { resetPassword } from '@/lib/auth';

function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            await resetPassword(email);
            setStatus('success');
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Failed to send reset email. Please try again.');
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
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email to receive reset instructions
                    </p>
                </div>

                {/* Form */}
                <div className="card">
                    {status === 'success' ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h3>
                            <p className="text-gray-600 mb-6">
                                We've sent password reset instructions to <strong>{email}</strong>
                            </p>
                            <Link href="/login" className="btn-primary w-full inline-block">
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {status === 'error' && (
                                <div className="alert-error">
                                    {errorMessage}
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="btn-primary w-full"
                            >
                                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <div className="text-center">
                                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center">
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ForgotPasswordForm />
        </Suspense>
    );
}
