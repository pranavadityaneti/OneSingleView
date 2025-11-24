'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Claim, ClaimFormData, MotorPolicy, HealthPolicy, CommercialPolicy } from '@/types';
import FormInput from './FormInput';
import FileUpload from './FileUpload';
import { addClaim, getUserMotorPolicies, getUserHealthPolicies, getUserCommercialPolicies } from '@/lib/db';

interface ClaimFormProps {
    userId: string;
    initialData?: Claim;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ClaimForm({ userId, initialData, onClose, onSuccess }: ClaimFormProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [policies, setPolicies] = useState<{ id: string; label: string; type: string }[]>([]);
    const [loadingPolicies, setLoadingPolicies] = useState(true);

    const [formData, setFormData] = useState<ClaimFormData>({
        policy_id: initialData?.policy_id || '',
        lob_type: initialData?.lob_type || 'Motor',
        claim_type: initialData?.claim_type || 'Accident',
        incident_date: initialData?.incident_date ? new Date(initialData.incident_date) : new Date(),
        description: initialData?.description || '',
        supporting_docs: initialData?.supporting_docs || [],
        status: initialData?.status || 'New',
    });

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const [motor, gmc, commercial] = await Promise.all([
                    getUserMotorPolicies(userId),
                    getUserHealthPolicies(userId),
                    getUserCommercialPolicies(userId)
                ]);

                const policyOptions = [
                    ...motor.map(p => ({ id: p.id, label: `Motor - ${p.vehicle_number} (${p.policy_number})`, type: 'Motor' })),
                    ...gmc.map(p => ({ id: p.id, label: `Health - ${p.policy_number}`, type: 'Health' })),
                    ...commercial.map(p => ({ id: p.id, label: `Commercial - ${p.policy_number}`, type: p.lob_type }))
                ];

                setPolicies(policyOptions);
            } catch (error) {
                console.error('Error fetching policies:', error);
            } finally {
                setLoadingPolicies(false);
            }
        };

        fetchPolicies();
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-set LOB type if policy is selected
        if (name === 'policy_id') {
            const selectedPolicy = policies.find(p => p.id === value);
            if (selectedPolicy) {
                setFormData(prev => ({
                    ...prev,
                    lob_type: selectedPolicy.type as any
                }));
            }
        }

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

        if (!formData.policy_id) newErrors.policy_id = 'Please select a policy';
        if (!formData.incident_date) newErrors.incident_date = 'Incident date is required';
        if (!formData.description) newErrors.description = 'Description is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const claimData = {
                ...formData,
                user_id: userId,
                incident_date: new Date(formData.incident_date!),
                policy_id: formData.policy_id || '',
                lob_type: formData.lob_type || 'Motor',
                claim_type: formData.claim_type || 'Accident',
                description: formData.description || '',
                supporting_docs: formData.supporting_docs || [],
                status: formData.status || 'New'
            };

            // Only add is supported for now as per requirements, but structure allows update
            if (initialData?.id) {
                // await updateClaim(initialData.id, claimData);
            } else {
                await addClaim(claimData);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving claim:', error);
            setErrors(prev => ({ ...prev, submit: 'Failed to save claim. Please try again.' }));
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (url: string) => {
        setFormData(prev => ({
            ...prev,
            supporting_docs: [...(prev.supporting_docs || []), url]
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Claim' : 'Register New Claim'}
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Policy
                            </label>
                            {loadingPolicies ? (
                                <div className="text-sm text-gray-500">Loading policies...</div>
                            ) : (
                                <select
                                    name="policy_id"
                                    value={formData.policy_id}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${errors.policy_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select a policy</option>
                                    {policies.map(policy => (
                                        <option key={policy.id} value={policy.id}>
                                            {policy.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.policy_id && <p className="text-red-500 text-xs mt-1">{errors.policy_id}</p>}
                        </div>

                        <FormInput
                            label="Claim Type"
                            name="claim_type"
                            type="select"
                            value={formData.claim_type || 'Accident'}
                            onChange={handleChange}
                            options={[
                                { value: 'Accident', label: 'Accident' },
                                { value: 'Theft', label: 'Theft' },
                                { value: 'Natural Calamity', label: 'Natural Calamity' },
                                { value: 'Third Party', label: 'Third Party' },
                                { value: 'Health', label: 'Health / Hospitalization' },
                                { value: 'Other', label: 'Other' }
                            ]}
                            required
                        />

                        <FormInput
                            label="Incident Date"
                            name="incident_date"
                            type="date"
                            value={formData.incident_date ? new Date(formData.incident_date).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange as any}
                            required
                            error={errors.incident_date}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                placeholder="Describe the incident..."
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>

                        <FileUpload
                            label="Supporting Documents (Photos, FIR, etc.)"
                            name="supporting_docs"
                            bucket="claim-documents"
                            onUploadComplete={handleFileUpload}
                            existingFile={formData.supporting_docs && formData.supporting_docs.length > 0 ? { url: formData.supporting_docs[0], name: 'Document' } : undefined}
                        />
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
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Submit Claim
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
