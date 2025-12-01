'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { MotorPolicy, MotorPolicyFormData } from '@/types';
import FormInput from './FormInput';
import FileUpload from './FileUpload';
import { addMotorPolicy, updateMotorPolicy } from '@/lib/db';
import { INSURANCE_COMPANIES, CAR_MANUFACTURERS } from '@/lib/constants';
import {
    validateVehicleNumber,
    validatePolicyNumber,
    validatePremiumAmount,
    validateDateRange,
    getTodayString,
    getOneYearFromNow
} from '@/lib/validation';

interface MotorPolicyFormProps {
    userId: string;
    initialData?: MotorPolicy;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MotorPolicyForm({ userId, initialData, onClose, onSuccess }: MotorPolicyFormProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<MotorPolicyFormData>({
        vehicle_number: initialData?.vehicle_number || '',
        policy_number: initialData?.policy_number || '',
        vehicle_type: initialData?.vehicle_type || 'Car',
        manufacturer: initialData?.manufacturer || '',
        model: initialData?.model || '',
        fuel_type: initialData?.fuel_type || 'Petrol',
        manufacturing_year: initialData?.manufacturing_year || new Date().getFullYear(),
        number_plate_type: initialData?.number_plate_type || 'White',
        ownership_type: initialData?.ownership_type || 'Individual',
        insurer_name: initialData?.insurer_name || '',
        premium_amount: initialData?.premium_amount || 0,
        policy_start_date: initialData?.policy_start_date ? new Date(initialData.policy_start_date) : new Date(),
        policy_end_date: initialData?.policy_end_date ? new Date(initialData.policy_end_date) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        rc_docs: initialData?.rc_docs || [],
        previous_policy_docs: initialData?.previous_policy_docs || [],
        dl_docs: initialData?.dl_docs || [],
    });

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

        // Clear error when user types
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

        if (!validateVehicleNumber(formData.vehicle_number || '')) {
            newErrors.vehicle_number = 'Invalid vehicle number format (e.g., KA01AB1234)';
        }

        if (!validatePolicyNumber(formData.policy_number || '')) {
            newErrors.policy_number = 'Policy number is required';
        }

        if (!validatePremiumAmount(formData.premium_amount || 0)) {
            newErrors.premium_amount = 'Invalid premium amount';
        }

        if (formData.policy_start_date && formData.policy_end_date) {
            if (!validateDateRange(formData.policy_start_date, formData.policy_end_date)) {
                newErrors.policy_end_date = 'End date must be after start date';
            }
        }

        if (!formData.manufacturer) newErrors.manufacturer = 'Manufacturer is required';
        if (!formData.model) newErrors.model = 'Model is required';
        if (!formData.insurer_name) newErrors.insurer_name = 'Insurer name is required';

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
                // Ensure dates are Date objects
                policy_start_date: new Date(formData.policy_start_date!),
                policy_end_date: new Date(formData.policy_end_date!),
                rc_docs: formData.rc_docs || [],
                previous_policy_docs: formData.previous_policy_docs || [],
                dl_docs: formData.dl_docs || []
            };

            if (initialData?.id) {
                await updateMotorPolicy(initialData.id, policyData);
            } else {
                await addMotorPolicy(policyData as any);
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

    const handleFileUpload = (field: 'rc_docs' | 'previous_policy_docs' | 'dl_docs') => (url: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), url]
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Motor Policy' : 'Add New Motor Policy'}
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

                    {/* Vehicle Details */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <FormInput
                                label="Vehicle Number"
                                name="vehicle_number"
                                value={formData.vehicle_number || ''}
                                onChange={handleChange}
                                placeholder="KA01AB1234"
                                error={errors.vehicle_number}
                                required
                            />
                            <FormInput
                                label="Vehicle Type"
                                name="vehicle_type"
                                type="select"
                                value={formData.vehicle_type || 'Car'}
                                onChange={handleChange}
                                options={[
                                    { value: 'Car', label: 'Car' },
                                    { value: 'Bike', label: 'Bike' },
                                    { value: 'Bus', label: 'Bus' },
                                    { value: 'GCV', label: 'Goods Carrying Vehicle' },
                                    { value: 'Misc', label: 'Miscellaneous' }
                                ]}
                                required
                            />
                            <FormInput
                                label="Number Plate Type"
                                name="number_plate_type"
                                type="select"
                                value={formData.number_plate_type}
                                onChange={handleChange}
                                required
                                options={[
                                    { value: 'White', label: 'White (Pvt)' },
                                    { value: 'Yellow', label: 'Yellow (Commercial)' },
                                    { value: 'EV', label: 'EV (Green)' },
                                ]}
                            />
                            <FormInput
                                label="Ownership Type"
                                name="ownership_type"
                                type="select"
                                value={formData.ownership_type ?? 'Individual'}
                                onChange={handleChange}
                                required
                                options={[
                                    { value: 'Individual', label: 'Individual' },
                                    { value: 'Company', label: 'Company' },
                                ]}
                            />
                            <FormInput
                                label="Manufacturer"
                                name="manufacturer"
                                type="select"
                                value={formData.manufacturer || ''}
                                onChange={handleChange}
                                options={CAR_MANUFACTURERS.map(m => ({ value: m, label: m }))}
                                error={errors.manufacturer}
                                required
                            />
                            <FormInput
                                label="Model"
                                name="model"
                                value={formData.model || ''}
                                onChange={handleChange}
                                placeholder="e.g. Swift"
                                error={errors.model}
                                required
                            />
                            <FormInput
                                label="Fuel Type"
                                name="fuel_type"
                                type="select"
                                value={formData.fuel_type || 'Petrol'}
                                onChange={handleChange}
                                options={[
                                    { value: 'Petrol', label: 'Petrol' },
                                    { value: 'Diesel', label: 'Diesel' },
                                    { value: 'CNG', label: 'CNG' },
                                    { value: 'Electric', label: 'Electric' },
                                    { value: 'Hybrid', label: 'Hybrid' }
                                ]}
                                required
                            />
                            <FormInput
                                label="Manufacturing Year"
                                name="manufacturing_year"
                                type="number"
                                value={formData.manufacturing_year || new Date().getFullYear()}
                                onChange={handleChange}
                                min={1990}
                                max={new Date().getFullYear()}
                                required
                            />
                        </div>
                    </section>

                    {/* Policy Details */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Details</h3>
                        <div className="grid md:grid-cols-3 gap-6">
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
                                label="Premium Amount (₹)"
                                name="premium_amount"
                                type="number"
                                value={formData.premium_amount || ''}
                                onChange={handleChange}
                                error={errors.premium_amount}
                                required
                            />
                            <FormInput
                                label="Start Date"
                                name="policy_start_date"
                                type="date"
                                value={formData.policy_start_date ? new Date(formData.policy_start_date).toISOString().split('T')[0] : ''}
                                onChange={handleDateChange as any}
                                required
                            />
                            <FormInput
                                label="End Date"
                                name="policy_end_date"
                                type="date"
                                value={formData.policy_end_date ? new Date(formData.policy_end_date).toISOString().split('T')[0] : ''}
                                onChange={handleDateChange as any}
                                error={errors.policy_end_date}
                                required
                            />
                        </div>
                    </section>

                    {/* Documents */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <FileUpload
                                label="RC Copy"
                                name="rc_docs"
                                bucket="rc-copies"
                                onUploadComplete={handleFileUpload('rc_docs')}
                                existingFile={formData.rc_docs && formData.rc_docs.length > 0 ? { url: formData.rc_docs[0], name: 'RC Document' } : undefined}
                            />
                            <FileUpload
                                label="Previous Policy"
                                name="previous_policy_docs"
                                bucket="policy-documents"
                                onUploadComplete={handleFileUpload('previous_policy_docs')}
                                existingFile={formData.previous_policy_docs && formData.previous_policy_docs.length > 0 ? { url: formData.previous_policy_docs[0], name: 'Previous Policy' } : undefined}
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
