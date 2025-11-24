'use client';

import React, { useState } from 'react';
import { X, Eye, EyeOff, Check, X as XIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const passwordStrength = {
        hasMinLength: formData.newPassword.length >= 8,
        hasUpperCase: /[A-Z]/.test(formData.newPassword),
        hasLowerCase: /[a-z]/.test(formData.newPassword),
        hasNumber: /[0-9]/.test(formData.newPassword),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword),
    };

    const isPasswordStrong =
        passwordStrength.hasMinLength &&
        passwordStrength.hasUpperCase &&
        passwordStrength.hasLowerCase &&
        passwordStrength.hasNumber;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        if (!isPasswordStrong) {
            setError('Password must meet all strength requirements');
            setLoading(false);
            return;
        }

        try {
            // 1. Re-authenticate with current password to ensure security
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: (await supabase.auth.getUser()).data.user?.email || '',
                password: formData.currentPassword,
            });

            if (signInError) {
                throw new Error('Incorrect current password');
            }

            // 2. Update password using Supabase auth
            const { error: updateError } = await supabase.auth.updateUser({
                password: formData.newPassword,
            });

            if (updateError) throw updateError;

            onSuccess();
            onClose();

            // Reset form
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (err: any) {
            setError(err.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {formData.newPassword && (
                            <div className="mt-3 space-y-2">
                                <p className="text-xs font-medium text-gray-600">Password must contain:</p>
                                <div className="space-y-1">
                                    {Object.entries({
                                        'At least 8 characters': passwordStrength.hasMinLength,
                                        'One uppercase letter': passwordStrength.hasUpperCase,
                                        'One lowercase letter': passwordStrength.hasLowerCase,
                                        'One number': passwordStrength.hasNumber,
                                    }).map(([requirement, met]) => (
                                        <div key={requirement} className="flex items-center gap-2 text-xs">
                                            {met ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <XIcon className="w-4 h-4 text-gray-300" />
                                            )}
                                            <span className={met ? 'text-green-700' : 'text-gray-500'}>
                                                {requirement}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || !isPasswordStrong}
                        >
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
