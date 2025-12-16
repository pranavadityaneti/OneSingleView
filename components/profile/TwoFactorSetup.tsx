'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';

interface TwoFactorSetupProps {
    userId: string;
}

export default function TwoFactorSetup({ userId }: TwoFactorSetupProps) {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isEnabling, setIsEnabling] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        checkMFAStatus();
    }, []);

    const checkMFAStatus = async () => {
        try {
            const { data, error } = await supabase.auth.mfa.listFactors();

            if (error) {
                // Check for specific MFA-not-enabled error
                if (error.message?.includes('MFA') || error.message?.includes('factor') || error.status === 422) {
                    setError('Two-Factor Authentication is not enabled for this project. Please contact the administrator to enable MFA in Supabase settings.');
                } else {
                    throw error;
                }
                return;
            }

            const totpFactor = data?.totp?.[0];
            setIsEnabled(totpFactor?.status === 'verified');
        } catch (err: any) {
            console.error('Error checking MFA status:', err);
            setError('Two-Factor Authentication is not available. The administrator needs to enable MFA in Supabase Dashboard → Authentication → Multi-Factor Authentication.');
        } finally {
            setLoading(false);
        }
    };

    const handleEnable2FA = async () => {
        setIsEnabling(true);
        setError('');
        setSuccess('');

        try {
            // Enroll in TOTP MFA
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp',
            });

            if (error) throw error;

            if (data) {
                setSecret(data.totp.secret);

                // Generate QR code
                const otpauthUrl = data.totp.uri;
                const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
                setQrCode(qrCodeDataUrl);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to enable 2FA. This feature may not be available.');
            setIsEnabling(false);
        }
    };

    const handleVerify = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const factors = await supabase.auth.mfa.listFactors();
            const factorId = factors.data?.totp?.[0]?.id;

            if (!factorId) throw new Error('No factor found');

            const { error } = await supabase.auth.mfa.challengeAndVerify({
                factorId,
                code: verificationCode,
            });

            if (error) throw error;

            setSuccess('2FA enabled successfully!');
            setIsEnabled(true);
            setIsEnabling(false);
            setQrCode('');
            setVerificationCode('');
        } catch (err: any) {
            setError(err.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!confirm('Are you sure you want to disable two-factor authentication?')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const factors = await supabase.auth.mfa.listFactors();
            const factorId = factors.data?.totp?.[0]?.id;

            if (!factorId) throw new Error('No factor found');

            const { error } = await supabase.auth.mfa.unenroll({
                factorId,
            });

            if (error) throw error;

            setSuccess('2FA disabled successfully');
            setIsEnabled(false);
        } catch (err: any) {
            setError(err.message || 'Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isEnabling) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                    <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Add an extra layer of security to your account by requiring a code from your authenticator app when signing in.
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">{success}</p>
                </div>
            )}

            {!isEnabled && !isEnabling && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-700 mb-4">
                        Two-factor authentication is currently <strong>disabled</strong>. Enable it to secure your account.
                    </p>
                    <button
                        onClick={handleEnable2FA}
                        className="btn-primary"
                    >
                        Enable 2FA
                    </button>
                </div>
            )}

            {isEnabling && qrCode && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 mb-4">
                            Scan this QR code with your authenticator app:
                        </p>
                        <img src={qrCode} alt="2FA QR Code" className="mx-auto w-48 h-48" />
                        <p className="text-xs text-gray-500 mt-2">
                            Or enter this code manually: <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter Verification Code
                        </label>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setIsEnabling(false);
                                setQrCode('');
                                setVerificationCode('');
                                setError('');
                            }}
                            className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleVerify}
                            disabled={verificationCode.length !== 6 || loading}
                            className="flex-1 btn-primary"
                        >
                            {loading ? 'Verifying...' : 'Verify & Enable'}
                        </button>
                    </div>
                </div>
            )}

            {isEnabled && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Check className="w-5 h-5 text-green-600" />
                        <p className="text-green-700 font-medium">
                            Two-factor authentication is currently <strong>enabled</strong>
                        </p>
                    </div>
                    <button
                        onClick={handleDisable2FA}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Disabling...' : 'Disable 2FA'}
                    </button>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Recommended apps:</strong> Google Authenticator, Authy, Microsoft Authenticator
                </p>
            </div>
        </div>
    );
}
