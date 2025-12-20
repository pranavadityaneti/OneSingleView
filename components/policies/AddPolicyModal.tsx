'use client';

import React, { useState } from 'react';
import { X, Car, Heart, Briefcase, ChevronRight } from 'lucide-react';
import MotorPolicyForm from '@/components/forms/MotorPolicyForm';
import HealthPolicyForm from '@/components/forms/HealthPolicyForm';
import CommercialPolicyForm from '@/components/forms/CommercialPolicyForm';

import LifePolicyForm from '@/components/forms/LifePolicyForm';
import TravelPolicyForm from '@/components/forms/TravelPolicyForm';
import CyberPolicyForm from '@/components/forms/CyberPolicyForm';

interface AddPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userRole?: string;
    onSuccess: () => void;
    initialType?: PolicyType;
    // NEW: Renewal mode props
    isRenewalMode?: boolean;
    renewalData?: any;
    onRenewalComplete?: (oldPolicyId: string) => void;
}

export type PolicyType = 'Motor' | 'Health' | 'Commercial' | 'Life' | 'Travel' | 'Cyber';

export default function AddPolicyModal({
    isOpen,
    onClose,
    userId,
    userRole,
    onSuccess,
    initialType = undefined,
    isRenewalMode = false,
    renewalData = null,
    onRenewalComplete
}: AddPolicyModalProps) {
    const [selectedType, setSelectedType] = useState<PolicyType | undefined>(initialType);

    // Reset selected type when modal opens/closes or initialType changes
    React.useEffect(() => {
        if (isOpen) {
            setSelectedType(initialType);
        }
    }, [isOpen, initialType]);

    if (!isOpen) return null;

    const handleSuccess = async () => {
        // If renewal mode, handle the old policy status update
        if (isRenewalMode && renewalData && onRenewalComplete) {
            await onRenewalComplete(renewalData.id); // Wait for status update to complete
        }
        onSuccess();
        onClose();
        setSelectedType(undefined);
    };

    const renderForm = () => {
        // Prepare initial data for renewal mode
        // Remove fields that shouldn't be passed to database (policyType is added by PolicyDetailModal for display)
        const formInitialData = isRenewalMode && renewalData ? (() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { policyType, id, created_at, updated_at, status, ...cleanData } = renewalData;
            return {
                ...cleanData,
                policy_number: '', // Clear for new input
                policy_start_date: new Date(), // Start from today
                policy_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year
                renewed_from_policy_id: renewalData.id, // Track renewal
                rc_docs: renewalData.rc_docs || renewalData.documents || [], // Ensure RC docs are carried over (try rc_docs first, then documents)
                previous_policy_number: renewalData.policy_number, // Store ref to old number
            };
        })() : undefined;

        switch (selectedType) {
            case 'Motor':
                return <MotorPolicyForm userId={userId} userRole={userRole} initialData={formInitialData} onClose={onClose} onSuccess={handleSuccess} />;
            case 'Health':
                return <HealthPolicyForm userId={userId} userRole={userRole} initialData={formInitialData} onClose={onClose} onSuccess={handleSuccess} />;
            case 'Commercial':
                return <CommercialPolicyForm userId={userId} userRole={userRole} initialData={formInitialData} onClose={onClose} onSuccess={handleSuccess} />;
            case 'Life':
                return <LifePolicyForm userId={userId} userRole={userRole} initialData={formInitialData} onClose={onClose} onSuccess={handleSuccess} />;
            case 'Travel':
                return <TravelPolicyForm userId={userId} userRole={userRole} initialData={formInitialData} onClose={onClose} onSuccess={handleSuccess} />;
            case 'Cyber':
                return <CyberPolicyForm userId={userId} userRole={userRole} initialData={formInitialData} onClose={onClose} onSuccess={handleSuccess} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {selectedType ? (
                    <div>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedType(undefined)}
                                    className="text-sm text-gray-500 hover:text-gray-900"
                                >
                                    Select Type
                                </button>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <h3 className="text-lg font-bold text-gray-900">
                                    {isRenewalMode ? `Renew ${selectedType} Policy` : `Add ${selectedType} Policy`}
                                </h3>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6">
                            {renderForm()}
                        </div>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Add New Policy</h2>
                                <p className="text-gray-500 mt-1">Select the type of policy you want to add</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="grid gap-4">
                            <button
                                onClick={() => setSelectedType('Motor')}
                                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                            >
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                                    <Car className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">Motor Insurance</h3>
                                    <p className="text-sm text-gray-500">Car, Bike, and other vehicle policies</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-blue-500" />
                            </button>

                            <button
                                onClick={() => setSelectedType('Health')}
                                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all group text-left"
                            >
                                <div className="p-3 bg-pink-100 text-pink-600 rounded-lg group-hover:bg-pink-200 transition-colors">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-pink-700">Health Insurance</h3>
                                    <p className="text-sm text-gray-500">Individual and Family Floater plans</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-pink-500" />
                            </button>

                            <button
                                onClick={() => setSelectedType('Commercial')}
                                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group text-left"
                            >
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200 transition-colors">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">Commercial Insurance</h3>
                                    <p className="text-sm text-gray-500">Fire, Marine, and Liability policies</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-purple-500" />
                            </button>

                            <button
                                onClick={() => setSelectedType('Life')}
                                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all group text-left"
                            >
                                <div className="p-3 bg-pink-100 text-pink-600 rounded-lg group-hover:bg-pink-200 transition-colors">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-pink-700">Life Insurance</h3>
                                    <p className="text-sm text-gray-500">Term life and endowment plans</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-pink-500" />
                            </button>

                            <button
                                onClick={() => setSelectedType('Travel')}
                                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group text-left"
                            >
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-200 transition-colors">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-700">Travel Insurance</h3>
                                    <p className="text-sm text-gray-500">Domestic and International travel</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-orange-500" />
                            </button>

                            <button
                                onClick={() => setSelectedType('Cyber')}
                                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left"
                            >
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700">Cyber Insurance</h3>
                                    <p className="text-sm text-gray-500">Protection against digital threats</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-indigo-500" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
