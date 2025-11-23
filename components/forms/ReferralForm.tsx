'use client';

import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Referral } from '@/types';
import FormInput from './FormInput';
import { addReferral } from '@/lib/db';

interface ReferralFormProps {
    userId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ReferralForm({ userId, onClose, onSuccess }: ReferralFormProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        friend_name: '',
        friend_mobile: '',
        friend_email: '',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.friend_name) newErrors.friend_name = 'Friend\'s name is required';
        if (!formData.friend_mobile) newErrors.friend_mobile = 'Mobile number is required';

        // Basic mobile validation
        if (formData.friend_mobile && !/^\d{10}$/.test(formData.friend_mobile.replace(/\D/g, ''))) {
            newErrors.friend_mobile = 'Invalid mobile number (10 digits required)';
        }

        // Basic email validation if provided
        if (formData.friend_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.friend_email)) {
            newErrors.friend_email = 'Invalid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            await addReferral({
                user_id: userId,
                friend_name: formData.friend_name,
                friend_mobile: formData.friend_mobile,
                friend_email: formData.friend_email,
                notes: formData.notes
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving referral:', error);
            setErrors(prev => ({ ...prev, submit: 'Failed to save referral. Please try again.' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        Add Referral
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {errors.submit && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                            {errors.submit}
                        </div>
                    )}

                    <div className="space-y-4">
                        <FormInput
                            label="Friend's Name"
                            name="friend_name"
                            value={formData.friend_name}
                            onChange={handleChange}
                            placeholder="e.g. Rahul Kumar"
                            error={errors.friend_name}
                            required
                        />

                        <FormInput
                            label="Friend's Mobile"
                            name="friend_mobile"
                            value={formData.friend_mobile}
                            onChange={handleChange}
                            placeholder="e.g. 9876543210"
                            error={errors.friend_mobile}
                            required
                        />

                        <FormInput
                            label="Friend's Email (Optional)"
                            name="friend_email"
                            type="email"
                            value={formData.friend_email}
                            onChange={handleChange}
                            placeholder="e.g. rahul@example.com"
                            error={errors.friend_email}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                placeholder="Any specific requirements..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Add Referral
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
