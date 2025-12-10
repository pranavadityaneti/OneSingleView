'use client';

import { X, RefreshCw } from 'lucide-react';

interface RenewalConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    policy: any;
    policyType: string;
}

export default function RenewalConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    policy,
    policyType
}: RenewalConfirmationModalProps) {
    if (!isOpen) return null;

    const getPolicyIdentifier = () => {
        if (policyType === 'Motor') return policy.vehicle_number;
        if (policyType === 'Health') return policy.company_name || policy.policy_number;
        if (policyType === 'Commercial') return policy.company_name || policy.policy_number;
        return policy.policy_number;
    };

    const getEndDate = () => {
        return policy.policy_end_date || policy.expiry_date;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-primary-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Renew Policy</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-lg text-gray-900 font-medium">
                        Is this policy renewed?
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Policy:</span>
                            <span className="text-sm font-medium text-gray-900">{getPolicyIdentifier()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Type:</span>
                            <span className="text-sm font-medium text-gray-900">{policyType} Insurance</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Insurer:</span>
                            <span className="text-sm font-medium text-gray-900">{policy.insurer_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">End Date:</span>
                            <span className="text-sm font-medium text-red-600">
                                {getEndDate() ? new Date(getEndDate()).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            Clicking "Yes" will open the Add Policy form with pre-filled data. You can update the policy details and save the renewed policy.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        No, Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Yes, Renew Policy
                    </button>
                </div>
            </div>
        </div>
    );
}
