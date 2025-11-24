'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MotorPolicyForm from '../forms/MotorPolicyForm';
import HealthPolicyForm from '../forms/HealthPolicyForm';
import CommercialPolicyForm from '../forms/CommercialPolicyForm';
import TravelPolicyForm from '../forms/TravelPolicyForm';
import LifePolicyForm from '../forms/LifePolicyForm';
import CyberPolicyForm from '../forms/CyberPolicyForm';

interface EditPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    policy: any;
    onSuccess?: () => void;
}

export default function EditPolicyModal({ isOpen, onClose, policy, onSuccess }: EditPolicyModalProps) {
    const [saving, setSaving] = useState(false);

    if (!isOpen || !policy) return null;

    const policyType = policy.type || 'Motor';

    const handleSuccess = () => {
        if (onSuccess) onSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Edit {policyType} Policy</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={saving}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {policyType === 'Motor' && (
                        <MotorPolicyForm
                            userId={policy.user_id}
                            onSuccess={handleSuccess}
                            onClose={onClose}
                            initialData={policy}
                        />
                    )}
                    {policyType === 'Health' && (
                        <HealthPolicyForm
                            userId={policy.user_id}
                            onSuccess={handleSuccess}
                            onClose={onClose}
                            initialData={policy}
                        />
                    )}
                    {policyType === 'Commercial' && (
                        <CommercialPolicyForm
                            userId={policy.user_id}
                            onSuccess={handleSuccess}
                            onClose={onClose}
                            initialData={policy}
                        />
                    )}
                    {policyType === 'Travel' && (
                        <TravelPolicyForm
                            userId={policy.user_id}
                            onSuccess={handleSuccess}
                            onClose={onClose}
                            initialData={policy}
                        />
                    )}
                    {policyType === 'Life' && (
                        <LifePolicyForm
                            userId={policy.user_id}
                            onSuccess={handleSuccess}
                            onClose={onClose}
                            initialData={policy}
                        />
                    )}
                    {policyType === 'Cyber' && (
                        <CyberPolicyForm
                            userId={policy.user_id}
                            onSuccess={handleSuccess}
                            onClose={onClose}
                            initialData={policy}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

