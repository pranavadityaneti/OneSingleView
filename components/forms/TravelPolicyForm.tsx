'use client';

import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import FormInput from './FormInput';
import FileUpload from './FileUpload';
import { addTravelPolicy } from '@/lib/db';

interface TravelPolicyFormProps {
    userId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function TravelPolicyForm({ userId, onClose, onSuccess }: TravelPolicyFormProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        policy_number: '',
        insurer_name: '',
        premium_amount: 0,
        destination: '',
        trip_type: 'Single Trip',
        policy_start_date: new Date(),
        policy_end_date: new Date(new Date().setDate(new Date().getDate() + 7)),
        document_url: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: new Date(value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addTravelPolicy({
                ...formData,
                user_id: userId,
                status: 'Active'
            });
            onSuccess();
        } catch (error) {
            console.error('Error saving travel policy:', error);
            setErrors({ submit: 'Failed to save policy' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Travel Insurance Details</h3>

            <div className="grid md:grid-cols-2 gap-6">
                <FormInput label="Policy Number" name="policy_number" value={formData.policy_number} onChange={handleChange} required />
                <FormInput label="Insurer Name" name="insurer_name" value={formData.insurer_name} onChange={handleChange} required />
                <FormInput label="Premium Amount (₹)" name="premium_amount" type="number" value={formData.premium_amount} onChange={handleChange} required />
                <FormInput label="Destination" name="destination" value={formData.destination} onChange={handleChange} required />
                <FormInput
                    label="Trip Type"
                    name="trip_type"
                    type="select"
                    value={formData.trip_type}
                    onChange={handleChange}
                    options={[{ value: 'Single Trip', label: 'Single Trip' }, { value: 'Multi Trip', label: 'Multi Trip' }]}
                    required
                />
                <FormInput label="Start Date" name="policy_start_date" type="date" value={formData.policy_start_date.toISOString().split('T')[0]} onChange={handleDateChange as any} required />
                <FormInput label="End Date" name="policy_end_date" type="date" value={formData.policy_end_date.toISOString().split('T')[0]} onChange={handleDateChange as any} required />
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
