'use client';

import { useState } from 'react';
import { MotorPolicy, HealthPolicy, CommercialPolicy } from '@/types';
import { calculatePolicyStatus, formatCurrency } from '@/lib/utils';
import { Car, Heart, Briefcase, Eye, Plus, Plane, Umbrella, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddPolicyModal from '@/components/policies/AddPolicyModal';

type PolicyType = 'Motor' | 'Health' | 'Travel' | 'Commercial' | 'Life' | 'Cyber';

interface PolicyTableProps {
    policyType: PolicyType;
    motorPolicies: MotorPolicy[];
    healthPolicies: HealthPolicy[];
    commercialPolicies: CommercialPolicy[];
    travelPolicies?: any[];
    lifePolicies?: any[];
    cyberPolicies?: any[];
    userId: string;
    onPolicyAdded?: () => void;
}

export default function PolicyTable({
    policyType,
    motorPolicies,
    healthPolicies,
    commercialPolicies,
    travelPolicies = [],
    lifePolicies = [],
    cyberPolicies = [],
    userId,
    onPolicyAdded
}: PolicyTableProps) {
    const router = useRouter();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Get policies based on type
    const getPolicies = () => {
        switch (policyType) {
            case 'Motor':
                return motorPolicies.map(p => ({ ...p, type: 'Motor' as const }));
            case 'Health':
                return healthPolicies.map(p => ({ ...p, type: 'Health' as const }));
            case 'Commercial':
                return commercialPolicies.map(p => ({ ...p, type: 'Commercial' as const }));
            case 'Travel':
                return travelPolicies.map(p => ({ ...p, type: 'Travel' as const }));
            case 'Life':
                return lifePolicies.map(p => ({ ...p, type: 'Life' as const }));
            case 'Cyber':
                return cyberPolicies.map(p => ({ ...p, type: 'Cyber' as const }));
            default:
                return [];
        }
    };

    const policies = getPolicies();

    const getIcon = () => {
        switch (policyType) {
            case 'Motor':
                return <Car className="w-5 h-5 text-blue-600" />;
            case 'Health':
                return <Heart className="w-5 h-5 text-green-600" />;
            case 'Commercial':
                return <Briefcase className="w-5 h-5 text-orange-600" />;
            case 'Travel':
                return <Plane className="w-5 h-5 text-purple-600" />;
            case 'Life':
                return <Umbrella className="w-5 h-5 text-pink-600" />;
            case 'Cyber':
                return <Shield className="w-5 h-5 text-cyan-600" />;
            default:
                return null;
        }
    };

    const getColorClass = () => {
        switch (policyType) {
            case 'Motor':
                return 'bg-blue-50 border-blue-200';
            case 'Health':
                return 'bg-green-50 border-green-200';
            case 'Commercial':
                return 'bg-orange-50 border-orange-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const handleViewDetails = (policy: any) => {
        const typeSlug = policyType.toLowerCase();
        router.push(`/policies/${typeSlug}/${policy.id}`);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-4 border-b ${getColorClass()} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{policyType} Policies</h3>
                        <p className="text-sm text-gray-600">
                            {policies.length} {policies.length === 1 ? 'policy' : 'policies'} found
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Add Policy</span>
                </button>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
                {policies.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            {getIcon() || <Briefcase className="w-8 h-8 text-gray-400" />}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            No {policyType} Policies Found
                        </h4>
                        <p className="text-gray-500">
                            You don't have any {policyType.toLowerCase()} policies yet.
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Policy Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Insurer Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Premium Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Start Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    End Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {policies.map((policy: any) => {
                                const isMotor = policy.type === 'Motor';
                                const isHealth = policy.type === 'Health';
                                const startDate = new Date(
                                    isMotor ? policy.policy_start_date :
                                        isHealth ? policy.start_date :
                                            policy.start_date
                                );
                                const endDate = new Date(
                                    isMotor ? policy.policy_end_date :
                                        isHealth ? policy.expiry_date :
                                            policy.expiry_date
                                );
                                const status = calculatePolicyStatus(endDate);

                                return (
                                    <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {policy.policy_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {policy.insurer_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(policy.premium_amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">
                                                {startDate.toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">
                                                {endDate.toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : status === 'Expiring Soon'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleViewDetails(policy)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

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
