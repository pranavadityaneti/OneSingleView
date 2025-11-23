'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { MotorPolicy, GMCPolicy, CommercialPolicy } from '@/types';

interface PolicyDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    type: 'total' | 'premium' | 'expiring';
    motorPolicies?: MotorPolicy[];
    gmcPolicies?: GMCPolicy[];
    commercialPolicies?: CommercialPolicy[];
}

export default function PolicyDetailModal({
    isOpen,
    onClose,
    title,
    type,
    motorPolicies = [],
    gmcPolicies = [],
    commercialPolicies = []
}: PolicyDetailModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const handlePolicyClick = (policyType: string, id: string) => {
        onClose();
        router.push(`/policies/${policyType.toLowerCase()}/${id}`);
    };

    const renderPolicyRow = (policy: any, policyType: string) => {
        const getPolicyDates = () => {
            if ('policy_end_date' in policy) {
                return {
                    start: policy.policy_start_date,
                    end: policy.policy_end_date
                };
            }
            return {
                start: policy.policy_start_date,
                end: policy.expiry_date
            };
        };

        const dates = getPolicyDates();
        const premium = Number(policy.premium_amount);

        return (
            <tr key={policy.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                    <button
                        onClick={() => handlePolicyClick(policyType, policy.id)}
                        className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
                    >
                        {policy.policy_number}
                    </button>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{policy.insurer_name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{policyType}</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                    ₹{premium.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${policy.status === 'Active' ? 'bg-green-100 text-green-700' :
                            policy.status === 'Expired' ? 'bg-red-100 text-red-700' :
                                'bg-orange-100 text-orange-700'
                        }`}>
                        {policy.status}
                    </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                    {dates.end ? new Date(dates.end).toLocaleDateString() : 'N/A'}
                </td>
            </tr>
        );
    };

    const allPolicies = [
        ...motorPolicies.map(p => ({ ...p, policyType: 'Motor' })),
        ...gmcPolicies.map(p => ({ ...p, policyType: 'Health' })),
        ...commercialPolicies.map(p => ({ ...p, policyType: 'Commercial' }))
    ];

    // Filter based on type
    let displayPolicies = allPolicies;
    if (type === 'expiring') {
        const now = new Date();
        const twentyDaysFromNow = new Date();
        twentyDaysFromNow.setDate(now.getDate() + 20);

        displayPolicies = allPolicies.filter(p => {
            const endDate = 'policy_end_date' in p ? p.policy_end_date : p.expiry_date;
            if (!endDate) return false;
            const date = new Date(endDate);
            return date > now && date <= twentyDaysFromNow;
        });
    }

    // Calculate total premium for premium view
    const totalPremium = type === 'premium'
        ? displayPolicies.reduce((sum, p) => sum + Number(p.premium_amount), 0)
        : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {displayPolicies.length} {displayPolicies.length === 1 ? 'policy' : 'policies'}
                            {type === 'premium' && ` • Total: ₹${totalPremium.toLocaleString()}`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {displayPolicies.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No policies found</p>
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Policy Number
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Insurer
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Premium
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            End Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {motorPolicies.length > 0 && (type === 'total' || type === 'expiring' ?
                                        displayPolicies.filter(p => p.policyType === 'Motor').map(p => renderPolicyRow(p, 'Motor')) :
                                        motorPolicies.map(p => renderPolicyRow(p, 'Motor'))
                                    )}
                                    {gmcPolicies.length > 0 && (type === 'total' || type === 'expiring' ?
                                        displayPolicies.filter(p => p.policyType === 'Health').map(p => renderPolicyRow(p, 'Health')) :
                                        gmcPolicies.map(p => renderPolicyRow(p, 'Health'))
                                    )}
                                    {commercialPolicies.length > 0 && (type === 'total' || type === 'expiring' ?
                                        displayPolicies.filter(p => p.policyType === 'Commercial').map(p => renderPolicyRow(p, 'Commercial')) :
                                        commercialPolicies.map(p => renderPolicyRow(p, 'Commercial'))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <p className="text-xs text-gray-500">
                        Click on a policy number to view full details
                    </p>
                </div>
            </div>
        </div>
    );
}
