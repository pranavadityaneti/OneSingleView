'use client';

import { useState } from 'react';
import { formatCurrency, calculatePolicyStatus } from '@/lib/utils';
import { Plus } from 'lucide-react';
import AddPolicyModal from '@/components/policies/AddPolicyModal';

interface PolicyTableProps {
    policies: any[];
    policyType: 'Motor' | 'Health' | 'Commercial' | 'Travel' | 'Life' | 'Cyber';
    userId: string;
    onPolicyAdded?: () => void;
}

export default function PolicyTable({ policies, policyType, userId, onPolicyAdded }: PolicyTableProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const getStatusBadge = (status: string) => {
        const styles = {
            'Active': 'bg-green-50 text-green-700 border-green-100',
            'Expiring Soon': 'bg-yellow-50 text-yellow-700 border-yellow-100',
            'Expired': 'bg-red-50 text-red-700 border-red-100'
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || styles['Active']}`}>
                {status}
            </span>
        );
    };

    const getFieldValue = (policy: any, field: string) => {
        return policy[field] || 'N/A';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{policyType} Policies</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
                >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Add Policy</span>
                </button>
            </div>

            {/* Table */}
            {policies.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">No {policyType.toLowerCase()} policies found</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Add your first {policyType.toLowerCase()} policy
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Policy Number</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Insurer</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Premium</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {policies.map((policy, index) => {
                                const expiryDate = policy.expiry_date || policy.policy_end_date;
                                const status = expiryDate ? calculatePolicyStatus(new Date(expiryDate)) : 'N/A';

                                return (
                                    <tr key={policy.id || index} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                            {getFieldValue(policy, 'policy_number')}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {getFieldValue(policy, 'insurer_name')}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                                            {policy.premium_amount ? formatCurrency(policy.premium_amount) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {policy.policy_start_date ? new Date(policy.policy_start_date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            {getStatusBadge(status)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Policy Modal */}
            <AddPolicyModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                userId={userId}
                initialType={policyType}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    onPolicyAdded?.();
                }}
            />
        </div>
    );
}
