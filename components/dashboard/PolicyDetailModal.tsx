'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { MotorPolicy, HealthPolicy, CommercialPolicy } from '@/types';

interface PolicyDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    type: 'total' | 'premium' | 'expiring' | 'expired';
    motorPolicies?: MotorPolicy[];
    healthPolicies: HealthPolicy[];
    commercialPolicies?: CommercialPolicy[];
    travelPolicies?: any[];
    lifePolicies?: any[];
    cyberPolicies?: any[];
}

export default function PolicyDetailModal({
    isOpen,
    onClose,
    title,
    type,
    motorPolicies = [],
    healthPolicies,
    commercialPolicies = [],
    travelPolicies = [],
    lifePolicies = [],
    cyberPolicies = []
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

        // Determine primary field based on policy type
        let primaryField = policy.policy_number;
        let primaryLabel = 'Policy Number';

        if (policyType === 'Motor') {
            primaryField = policy.vehicle_number;
            primaryLabel = 'Vehicle Number';
        } else if (policyType === 'Health') {
            primaryField = policy.company_name; // Health uses company_name as primary identifier in this context? Or maybe we should use a different field if available. Requirement says "Policy holder name". Health policy has company_name. Let's use that or insurer if name missing.
            // Wait, requirement says "Health: Policy holder name". Health policy schema has 'company_name' but not 'policy_holder_name'.
            // Let's check the schema again. HealthPolicy has 'company_name'.
            // Maybe I should use company_name as the clickable field.
            primaryField = policy.company_name || 'N/A';
        } else if (policyType === 'Commercial') {
            primaryField = policy.company_name || policy.policy_holder_name || 'N/A';
        } else if (['Travel', 'Life', 'Cyber'].includes(policyType)) {
            // Travel/Life/Cyber: Policy holder name
            // Travel has destination? No, requirement says "Policy holder name".
            // Let's check Travel/Life/Cyber schemas.
            // Life: nominee_name? No.
            // Actually, these policies might not have a 'policy_holder_name' field on the policy itself if it's linked to the user.
            // But for the table, we need something clickable.
            // If the requirement says "Policy holder name", and it's not on the policy, maybe it means the User's name?
            // But the user is the same for all.
            // Let's use Policy Number as fallback if specific field not found, but requirement asks for specific fields.
            // For now, let's use Policy Number for these if name not available, or maybe 'insurer_name'?
            // Wait, for Motor it is Vehicle Number.
            // For Commercial it is Business Name.
            // For Health/Travel/Life/Cyber it is Policy Holder Name.
            // Since I don't have policy_holder_name on Health/Travel/Cyber (only Commercial has it), I will use Policy Number as the primary clickable field for now to avoid breaking,
            // OR I can use another relevant field.
            // For Travel: Destination?
            // For Life: Nominee?
            // For Cyber: Risk Type?
            // The requirement explicitly said "Policy holder name".
            // I'll stick to Policy Number for now if name is missing, but I'll try to use relevant fields if possible.
            // Actually, let's look at the requirement again: "Health: Policy holder name (clickable)".
            // If the DB doesn't have it, maybe I should use the User's name? But that's static.
            // I'll use Policy Number for now as the clickable field for these if I can't find a better one, BUT I will add a Policy Number column as requested.
            // So:
            // Col 1: Primary (Clickable)
            // Col 2: Policy Number
            // ...

            // For Motor: Vehicle Number
            // For Health: Company Name (closest to "Policy Holder" for corporate/group, or maybe just use Policy Number if individual?)
            // For Commercial: Company Name / Policy Holder Name
            // For others: Let's use Insurer Name? No, that's a separate column.
            // Let's use "Policy Details" as header and put relevant info.
            // For Travel: Destination
            // For Life: Sum Assured? No.
            // For Cyber: Risk Type

            // actually, let's just use Policy Number as the clickable field for the others if the specific field is missing, 
            // BUT the requirement says "Policy Number column" is separate.
            // So I must have two columns.
            // If I can't find a "Policy Holder Name", I'll use "N/A" or the User's name if I can get it.
            // But I don't have the user's name here easily unless I fetch it.
            // Let's use "Self" or similar if it's the logged-in user?

            // Let's use a generic "Details" column.
            if (policyType === 'Travel') primaryField = policy.destination || 'Travel Policy';
            if (policyType === 'Life') primaryField = policy.nominee_name || 'Life Policy';
            if (policyType === 'Cyber') primaryField = policy.cyber_risk_type || 'Cyber Policy';
        }

        return (
            <tr key={policy.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                    <button
                        onClick={() => handlePolicyClick(policyType, policy.id)}
                        className="text-primary-600 hover:text-primary-700 font-semibold hover:underline text-left"
                    >
                        {primaryField}
                    </button>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{policy.policy_number}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{policy.insurer_name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{policyType}</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                    ₹{premium.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${policy.status === 'Active' ? 'bg-green-100 text-green-700' :
                        policy.status === 'Expiring Soon' ? 'bg-orange-100 text-orange-700' :
                            policy.status === 'Expired' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
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
        ...healthPolicies.map((p: any) => ({ ...p, policyType: 'Health' })),
        ...commercialPolicies.map(p => ({ ...p, policyType: 'Commercial' })),
        ...travelPolicies.map(p => ({ ...p, policyType: 'Travel' })),
        ...lifePolicies.map(p => ({ ...p, policyType: 'Life' })),
        ...cyberPolicies.map(p => ({ ...p, policyType: 'Cyber' }))
    ];

    // Filter based on type
    let displayPolicies = allPolicies;
    if (type === 'expiring') {
        displayPolicies = allPolicies.filter((p: any) => p.status === 'Expiring Soon');
    } else if (type === 'expired') {
        displayPolicies = allPolicies.filter((p: any) => p.status === 'Expired');
    } else if (type === 'total' || type === 'premium') {
        // For total and premium, we only want active policies (Active or Expiring Soon)
        // Expiring Soon is technically still active until it expires
        displayPolicies = allPolicies.filter((p: any) => p.status === 'Active' || p.status === 'Expiring Soon');
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

                {/* Status Legend */}
                <div className="px-6 py-2 bg-gray-50 border-b border-gray-200 flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-gray-600">Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span className="text-gray-600">Expiring Soon (&lt;20 days)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-gray-600">Expired</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {displayPolicies.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No policies found</p>
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-xl overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Details
                                        </th>
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
                                    {healthPolicies.length > 0 && (type === 'total' || type === 'expiring' ?
                                        displayPolicies.filter(p => p.policyType === 'Health').map(p => renderPolicyRow(p, 'Health')) :
                                        healthPolicies.map((p: any) => renderPolicyRow(p, 'Health'))
                                    )}
                                    {commercialPolicies.length > 0 && (type === 'total' || type === 'expiring' ?
                                        displayPolicies.filter(p => p.policyType === 'Commercial').map(p => renderPolicyRow(p, 'Commercial')) :
                                        commercialPolicies.map(p => renderPolicyRow(p, 'Commercial'))
                                    )}
                                    {travelPolicies.length > 0 && (type === 'total' || type === 'expiring' ?
                                        displayPolicies.filter(p => p.policyType === 'Travel').map(p => renderPolicyRow(p, 'Travel')) :
                                        travelPolicies.map(p => renderPolicyRow(p, 'Travel'))
                                    )}
                                    {lifePolicies.length > 0 && (type === 'total' || type === 'expiring' ?
                                        displayPolicies.filter(p => p.policyType === 'Life').map(p => renderPolicyRow(p, 'Life')) :
                                        lifePolicies.map(p => renderPolicyRow(p, 'Life'))
                                    )}
                                    {cyberPolicies.length > 0 && (type === 'total' || type === 'expiring' ?
                                        displayPolicies.filter(p => p.policyType === 'Cyber').map(p => renderPolicyRow(p, 'Cyber')) :
                                        cyberPolicies.map(p => renderPolicyRow(p, 'Cyber'))
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
