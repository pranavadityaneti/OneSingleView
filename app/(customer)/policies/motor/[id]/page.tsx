'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, FileText, Car, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MotorPolicy } from '@/types';

export default function MotorPolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [policy, setPolicy] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editedPolicy, setEditedPolicy] = useState<any | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const { data, error } = await supabase
                    .from('motor_policies')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setPolicy(data as MotorPolicy);
                setEditedPolicy(data as MotorPolicy);
            } catch (error) {
                console.error('Error fetching policy:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicy();
    }, [id]);

    const handleInputChange = (field: string, value: any) => {
        setEditedPolicy((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaveLoading(true);
            const { error } = await supabase
                .from('motor_policies')
                .update(editedPolicy)
                .eq('id', id);

            if (error) throw error;

            setPolicy(editedPolicy);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating policy:', error);
            alert('Failed to update policy');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleCancel = () => {
        setEditedPolicy(policy);
        setIsEditing(false);
    };

    const renderField = (label: string, field: string, value: any, type: string = 'text', options: string[] = []) => {
        if (!isEditing) {
            let displayValue = value;
            if (type === 'date' && value) displayValue = new Date(value).toLocaleDateString();
            if (label.includes('Premium') || label.includes('IDV')) displayValue = `₹${Number(value).toLocaleString()}`;
            if (label === 'NCB Percentage') displayValue = `${value}%`;

            return (
                <div>
                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                    <p className="text-lg font-semibold text-gray-900">{displayValue || 'N/A'}</p>
                </div>
            );
        }

        if (options.length > 0) {
            return (
                <div>
                    <label className="block text-sm text-gray-600 mb-1">{label}</label>
                    <select
                        value={value}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            );
        }

        return (
            <div>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <input
                    type={type}
                    value={type === 'date' && value ? new Date(value).toISOString().split('T')[0] : value}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-2xl p-12 text-center shadow-soft">
                    <p className="text-gray-500">Policy not found</p>
                    <button
                        onClick={() => router.push('/policies')}
                        className="mt-4 btn btn-primary"
                    >
                        Back to Policies
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>
                <div className="flex items-center gap-3">
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Edit Policy
                        </button>
                    )}
                    {isEditing && (
                        <>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={saveLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                disabled={saveLoading}
                            >
                                {saveLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${policy.status === 'Active' ? 'bg-green-100 text-green-700' :
                        policy.status === 'Expired' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                        }`}>
                        {policy.status}
                    </span>
                </div>
            </div>

            {/* Policy Overview */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-soft">
                <div className="flex items-start justify-between">
                    <div className="flex-1 mr-4">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedPolicy.policy_number}
                                onChange={(e) => handleInputChange('policy_number', e.target.value)}
                                className="text-3xl font-bold text-gray-900 mb-2 w-full bg-transparent border-b border-gray-300 focus:border-primary-500 outline-none"
                            />
                        ) : (
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {policy.policy_number}
                            </h1>
                        )}
                        <p className="text-gray-600">Motor Insurance Policy</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                        <Car className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                    {renderField('Premium Amount', 'premium_amount', editedPolicy?.premium_amount, 'number')}
                    {renderField('Policy Type', 'policy_type', editedPolicy?.policy_type, 'text', ['Comprehensive', 'Third Party'])}
                    {renderField('Insurer', 'insurer_name', editedPolicy?.insurer_name)}
                </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Car className="w-5 h-5 mr-2 text-blue-600" />
                    Vehicle Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        {renderField('Registration Number', 'vehicle_number', editedPolicy?.vehicle_number)}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        {renderField('Manufacturer', 'manufacturer', editedPolicy?.manufacturer)}
                        <div className="mt-2" />
                        {renderField('Model', 'model', editedPolicy?.model)}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        {renderField('Vehicle Type', 'vehicle_type', editedPolicy?.vehicle_type, 'text', ['Car', 'Bike', 'GCV', 'PCV', 'Misc'])}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        {renderField('Fuel Type', 'fuel_type', editedPolicy?.fuel_type, 'text', ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'])}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        {renderField('Manufacturing Year', 'manufacturing_year', editedPolicy?.manufacturing_year, 'number')}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        {renderField('Number Plate', 'number_plate_type', editedPolicy?.number_plate_type, 'text', ['White', 'Yellow', 'Green', 'Black'])}
                    </div>
                </div>
            </div>

            {/* Policy Details */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                    Policy Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        {renderField('Start Date', 'policy_start_date', editedPolicy?.policy_start_date, 'date')}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        {renderField('End Date', 'policy_end_date', editedPolicy?.policy_end_date, 'date')}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        {renderField('IDV (Insured Declared Value)', 'idv', editedPolicy?.idv, 'number')}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        {renderField('NCB Percentage', 'ncb_percentage', editedPolicy?.ncb_percentage, 'number')}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                        {renderField('Add-on Covers', 'addon_covers', editedPolicy?.addon_covers)}
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
                    Documents
                </h2>
                <div className="grid gap-3">
                    {policy.rc_docs && policy.rc_docs.map((doc: string, index: number) => (
                        <a
                            key={`rc-${index}`}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="flex items-center text-gray-700">
                                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                RC Document {index + 1}
                            </span>
                            <span className="text-sm text-primary-600 font-medium">View</span>
                        </a>
                    ))}
                    {policy.previous_policy_docs && policy.previous_policy_docs.map((doc: string, index: number) => (
                        <a
                            key={`prev-${index}`}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="flex items-center text-gray-700">
                                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                Previous Policy {index + 1}
                            </span>
                            <span className="text-sm text-primary-600 font-medium">View</span>
                        </a>
                    ))}
                    {policy.dl_docs && policy.dl_docs.map((doc: string, index: number) => (
                        <a
                            key={`dl-${index}`}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="flex items-center text-gray-700">
                                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                Driving License {index + 1}
                            </span>
                            <span className="text-sm text-primary-600 font-medium">View</span>
                        </a>
                    ))}
                    {!policy.rc_docs?.length && !policy.previous_policy_docs?.length && !policy.dl_docs?.length && (
                        <p className="text-gray-500 italic">No documents uploaded</p>
                    )}
                </div>
            </div>
        </div>
    );
}
