'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { CyberPolicy } from '@/types';
import FormInput from './FormInput';
import { useDuplicatePolicyCheck } from '@/hooks/useDuplicatePolicyCheck';
import DuplicatePolicyWarning from '@/components/policies/DuplicatePolicyWarning';
import FileUpload from './FileUpload';
import { addCyberPolicy } from '@/lib/db';
import { INSURANCE_COMPANIES } from '@/lib/constants';

interface CyberPolicyFormProps {
    userId: string;
    userRole?: string;
    initialData?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CyberPolicyForm({ userId, userRole, initialData, onClose, onSuccess }: CyberPolicyFormProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState(''); // For general form errors like duplicate policy
    const [formData, setFormData] = useState<Partial<CyberPolicy>>(initialData || {
        company_name: '',
        policy_number: '',
        insurer_name: '',
        premium_amount: 0,
        sum_insured: 0,
        cyber_risk_type: 'Personal',
        policy_start_date: new Date(),
        policy_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        document_url: '',
    });

    // Duplicate policy detection
    const { duplicateResult, checking, checkDuplicate } = useDuplicatePolicyCheck(userId);

    // Auto-calculate end date when start date changes (1 day before same date next year)
    useEffect(() => {
        if (formData.policy_start_date && !initialData) {
            const startDate = new Date(formData.policy_start_date);
            const endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 1);
            endDate.setDate(endDate.getDate() - 1); // 1 day before
            setFormData(prev => ({
                ...prev,
                policy_end_date: endDate
            }));
        }
    }, [formData.policy_start_date, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));

        // Check for duplicate policy number
        if (name === 'policy_number' && value) {
            checkDuplicate(value);
            setError(''); // Clear general error when policy number changes
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: new Date(value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check for duplicate before submission
        if (duplicateResult?.exists) {
            setError('This policy already exists. Please check the policy number.');
            return;
        }

        setLoading(true);
        setError(''); // Clear any previous general errors
        try {
            await addCyberPolicy({
                ...formData,
                user_id: userId,
                status: 'Active'
            });
            onSuccess();
        } catch (error) {
            console.error('Error saving cyber policy:', error);
            setErrors({ submit: 'Failed to save policy' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Cyber Insurance Details</h3>

            <div className="grid md:grid-cols-2 gap-6">
                {(userRole === 'corporate_employee' || userRole === 'corporate_admin') && (
                    <FormInput label="Company Name" name="company_name" value={(formData as any).company_name || ''} onChange={handleChange} placeholder="e.g. Acme Corp" required />
                )}
                <FormInput
                    label="Policy Number"
                    name="policy_number"
                    value={formData.policy_number || ''}
                    onChange={handleChange}
                    placeholder="Enter policy number"
                    required
                />

                {/* Duplicate Policy Warning */}
                {duplicateResult?.exists && (
                    <DuplicatePolicyWarning
                        policyNumber={formData.policy_number || ''}
                        policyType={duplicateResult.policyType || 'cyber'}
                        policyId={duplicateResult.policyId || ''}
                        insurerName={duplicateResult.policy?.insurer_name}
                    />
                )}
                <FormInput
                    label="Insurer Name"
                    name="insurer_name"
                    type="select"
                    value={formData.insurer_name || ''}
                    onChange={handleChange}
                    options={INSURANCE_COMPANIES.map(c => ({ value: c, label: c }))}
                    required
                />
                <FormInput label="Premium Amount (₹)" name="premium_amount" type="number" value={formData.premium_amount || 0} onChange={handleChange} required />
                <FormInput label="Sum Insured (₹)" name="sum_insured" type="number" value={formData.sum_insured || 0} onChange={handleChange} required />
                <FormInput
                    label="Risk Type"
                    name="cyber_risk_type"
                    type="select"
                    value={formData.cyber_risk_type || ''}
                    onChange={handleChange}
                    options={[{ value: 'Personal', label: 'Personal' }, { value: 'Business', label: 'Business' }]}
                    required
                />
                <FormInput label="Start Date" name="policy_start_date" type="date" value={formData.policy_start_date ? new Date(formData.policy_start_date).toISOString().split('T')[0] : ''} onChange={handleDateChange as any} required />
                <FormInput label="End Date" name="policy_end_date" type="date" value={formData.policy_end_date ? new Date(formData.policy_end_date).toISOString().split('T')[0] : ''} onChange={handleDateChange as any} required />
            </div>

            <FileUpload
                label="Policy Document"
                name="document_url"
                bucket="policy-documents"
                onUploadComplete={(url) => setFormData(prev => ({ ...prev, document_url: url }))}
            />

            <div className="flex justify-end space-x-4 pt-4 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Policy
                </button>
            </div>
        </form>
    );
}
