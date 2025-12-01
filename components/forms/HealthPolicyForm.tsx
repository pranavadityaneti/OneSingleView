'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { HealthPolicy, HealthPolicyFormData } from '@/types';
import FormInput from './FormInput';
import FileUpload from './FileUpload';
import { addHealthPolicy, updateHealthPolicy } from '@/lib/db';
import { INSURANCE_COMPANIES } from '@/lib/constants';
import {
    validatePolicyNumber,
    validatePremiumAmount,
    validateDateRange
} from '@/lib/validation';

interface HealthPolicyFormProps {
    userId: string;
    initialData?: HealthPolicy;
    onClose: () => void;
    onSuccess: () => void;
}

export default function HealthPolicyForm({ userId, initialData, onClose, onSuccess }: HealthPolicyFormProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<HealthPolicyFormData>({
        company_name: initialData?.company_name || '',
        policy_number: initialData?.policy_number || '',
        insurer_name: initialData?.insurer_name || '',
        sum_insured: initialData?.sum_insured || 0,
        premium_amount: initialData?.premium_amount || 0,
        expiry_date: initialData?.expiry_date ? new Date(initialData.expiry_date) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        policy_docs: initialData?.policy_docs || [],
        no_of_lives: initialData?.no_of_lives || 0,
    });

    // Auto-calculate expiry date when it's a new policy (1 year from today - 1 day)
    useEffect(() => {
        if (!initialData) {
            const today = new Date();
            const expiryDate = new Date(today);
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            expiryDate.setDate(expiryDate.getDate() - 1); // 1 day before
            setFormData(prev => ({
                ...prev,
                expiry_date: expiryDate
            }));
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: new Date(value)
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!validatePolicyNumber(formData.policy_number || '')) {
            newErrors.policy_number = 'Policy number is required';
        }

        if (!validatePremiumAmount(formData.premium_amount || 0)) {
            newErrors.premium_amount = 'Invalid premium amount';
        }

        if (!formData.insurer_name) newErrors.insurer_name = 'Insurer name is required';
        if (!formData.company_name) newErrors.company_name = 'Company name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const policyData = {
                ...formData,
                user_id: userId,
                expiry_date: new Date(formData.expiry_date!),
                policy_number: formData.policy_number || '',
                insurer_name: formData.insurer_name || '',
                premium_amount: formData.premium_amount || 0,
                policy_docs: formData.policy_docs || []
            };

            if (initialData?.id) {
                await updateHealthPolicy(initialData.id, policyData);
            } else {
                await addHealthPolicy(policyData);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving policy:', error);
            setErrors(prev => ({ ...prev, submit: 'Failed to save policy. Please try again.' }));
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (url: string) => {
        setFormData(prev => ({
            ...prev,
            policy_docs: [...(prev.policy_docs || []), url]
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Health Insurance Policy' : 'Add New Health Insurance Policy'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {errors.submit && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                            {errors.submit}
                        </div>
                    )}

                    {/* Policy Details */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Details</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <FormInput
                                label="Company Name"
                                name="company_name"
                                value={formData.company_name || ''}
                                onChange={handleChange}
                                placeholder="e.g. Acme Corp"
                                error={errors.company_name}
                                required
                            />
                            <FormInput
                                label="Policy Number"
                                name="policy_number"
                                value={formData.policy_number || ''}
                                onChange={handleChange}
                                placeholder="Enter policy number"
                                error={errors.policy_number}
                                required
                            />
                            <FormInput
                                label="Insurer Name"
                                name="insurer_name"
                                type="select"
                                value={formData.insurer_name || ''}
                                onChange={handleChange}
                                options={INSURANCE_COMPANIES.map(c => ({ value: c, label: c }))}
                                error={errors.insurer_name}
                                required
                            />
                            <FormInput
                                label="Sum Insured (₹)"
                                name="sum_insured"
                                type="number"
                                value={formData.sum_insured || ''}
                                onChange={handleChange}
                                placeholder="e.g. 500000"
                            />
                            <FormInput
                                label="Premium Amount (₹)"
                                name="premium_amount"
                                type="number"
                                value={formData.premium_amount || ''}
                                onChange={handleChange}
                                error={errors.premium_amount}
                                required
                            />
                            <FormInput
                                label="Expiry Date"
                                name="expiry_date"
                                type="date"
                                value={formData.expiry_date ? new Date(formData.expiry_date).toISOString().split('T')[0] : ''}
                                onChange={handleDateChange as any}
                                required
                            />
                            <FormInput
                                label="Number of Lives"
                                name="no_of_lives"
                                type="number"
                                value={formData.no_of_lives || ''}
                                onChange={handleChange}
                                placeholder="e.g. 50"
                            />
                        </div>
                    </section>

                    {/* Documents */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <FileUpload
                                label="Policy Document"
                                name="policy_docs"
                                bucket="policy-documents"
                                onUploadComplete={handleFileUpload}
                                existingFile={formData.policy_docs && formData.policy_docs.length > 0 ? { url: formData.policy_docs[0], name: 'Policy Document' } : undefined}
                            />
                        </div>
                    </section>

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
                                    Save Policy
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
