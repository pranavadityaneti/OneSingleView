'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, ArrowDown, ArrowUp, FileText, Info, RefreshCw } from 'lucide-react';
import { MotorPolicy, HealthPolicy, CommercialPolicy } from '@/types';
import RenewalConfirmationModal from './RenewalConfirmationModal';

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
    onRenewPolicy?: (policy: any, policyType: string) => void; // NEW: For renewal handling
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
    cyberPolicies = [],
    onRenewPolicy // NEW
}: PolicyDetailModalProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortDirection, setSortDirection] = useState<'high' | 'low' | null>(null); // null = no sort
    const [showClaimsInfo, setShowClaimsInfo] = useState(false);

    // Renewal modal state
    const [showRenewalModal, setShowRenewalModal] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
    const [selectedPolicyType, setSelectedPolicyType] = useState<string>('');

    const handlePolicyClick = (policyType: string, id: string) => {
        onClose();
        router.push(`/policies/${policyType.toLowerCase()}/${id}`);
    };

    const handleClaimsStatusClick = () => {
        setShowClaimsInfo(true);
    };

    const handleViewQuote = (policy: any) => {
        if (policy.quote_document_url) {
            window.open(policy.quote_document_url, '_blank');
        } else {
            alert('No quote document available for this policy');
        }
    };

    // NEW: Handle renew button click
    const handleRenewClick = (policy: any, policyType: string) => {
        setSelectedPolicy(policy);
        setSelectedPolicyType(policyType);
        setShowRenewalModal(true);
    };

    // NEW: Handle renewal confirmation
    const handleRenewalConfirm = () => {
        if (onRenewPolicy && selectedPolicy && selectedPolicyType) {
            onRenewPolicy(selectedPolicy, selectedPolicyType);
        }
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

        if (policyType === 'Motor') {
            primaryField = policy.vehicle_number;
        } else if (policyType === 'Health') {
            primaryField = policy.company_name || 'N/A';
        } else if (policyType === 'Commercial') {
            primaryField = policy.company_name || policy.policy_holder_name || 'N/A';
        } else if (['Travel', 'Life', 'Cyber'].includes(policyType)) {
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
                {/* Vehicle Type Cell for Motor Policies */}
                {policyType === 'Motor' ? (
                    <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                        {policy.custom_vehicle_type || policy.vehicle_type || 'N/A'}
                    </td>
                ) : (
                    // Empty cell for other policy types if mixed list (though currently filtered by type usually)
                    // If mixed types are shown, we need to handle alignment. 
                    // However, modal usually shows mixed list only for 'total', 'expiring' etc.
                    // Let's check if we are in a context where Motor policies exist alongside others.
                    // The header condition check `displayPolicies.some(p => p.policyType === 'Motor')` implies filtering.
                    // If policies are mixed, non-Motor rows need an empty cell to maintain alignment.
                    displayPolicies.some(p => p.policyType === 'Motor') ? <td className="px-4 py-3 text-sm"></td> : null
                )}

                {/* Hide Policy Number for Expiring/Expired/Total types */}
                {!['expiring', 'expired', 'total'].includes(type) && (
                    <td className="px-4 py-3 text-sm text-gray-900">{policy.policy_number}</td>
                )}
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

                {/* Claims Status - Only for expiring type */}
                {type === 'expiring' && (
                    <td className="px-4 py-3 text-sm">
                        <select
                            onClick={handleClaimsStatusClick}
                            className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                            defaultValue=""
                        >
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </td>
                )}

                {/* View Quote - Only for expiring type */}
                {type === 'expiring' && (
                    <td className="px-4 py-3 text-sm">
                        <button
                            onClick={() => handleViewQuote(policy)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            <FileText className="w-3 h-3" />
                            View Quote
                        </button>
                    </td>
                )}

                {/* View Documents - For all types */}
                <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col gap-1">
                        {/* RC Copy */}
                        {policyType === 'Motor' && policy.rc_docs && policy.rc_docs.length > 0 && (
                            <a
                                href={policy.rc_docs[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                                <FileText className="w-3 h-3" />
                                RC Copy
                            </a>
                        )}
                        {/* Policy Copy */}
                        {policyType === 'Motor' && policy.previous_policy_docs && policy.previous_policy_docs.length > 0 && (
                            <a
                                href={policy.previous_policy_docs[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                            >
                                <FileText className="w-3 h-3" />
                                Policy Copy
                            </a>
                        )}
                        {/* For Health/Commercial/Others - Policy Docs */}
                        {['Health', 'Commercial', 'Travel', 'Life', 'Cyber'].includes(policyType) && policy.policy_docs && policy.policy_docs.length > 0 && (
                            <a
                                href={policy.policy_docs[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                            >
                                <FileText className="w-3 h-3" />
                                Policy Doc
                            </a>
                        )}
                        {/* No documents available */}
                        {!((policyType === 'Motor' && ((policy.rc_docs && policy.rc_docs.length > 0) || (policy.previous_policy_docs && policy.previous_policy_docs.length > 0))) ||
                            (['Health', 'Commercial', 'Travel', 'Life', 'Cyber'].includes(policyType) && policy.policy_docs && policy.policy_docs.length > 0)) && (
                                <span className="text-xs text-gray-400">No docs</span>
                            )}
                    </div>
                </td>

                {/* Action Column - Only for expiring and expired */}
                {(type === 'expiring' || type === 'expired') && (
                    <td className="px-4 py-3 text-sm">
                        <button
                            onClick={() => handleRenewClick(policy, policyType)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Renew
                        </button>
                    </td>
                )}
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
    const displayPolicies = useMemo(() => {
        let filtered = allPolicies;

        if (type === 'expiring') {
            filtered = allPolicies.filter((p: any) => p.status === 'Expiring Soon');
        } else if (type === 'expired') {
            filtered = allPolicies.filter((p: any) => p.status === 'Expired');
        } else if (type === 'total' || type === 'premium') {
            filtered = allPolicies.filter((p: any) => p.status === 'Active' || p.status === 'Expiring Soon');
        }

        // Apply search filter for 'total' type
        if (type === 'total' && searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((p: any) => {
                return (
                    p.policy_number?.toLowerCase().includes(query) ||
                    p.insurer_name?.toLowerCase().includes(query) ||
                    p.vehicle_number?.toLowerCase().includes(query) ||
                    p.custom_vehicle_type?.toLowerCase().includes(query) ||
                    p.vehicle_type?.toLowerCase().includes(query) ||
                    p.company_name?.toLowerCase().includes(query) ||
                    p.destination?.toLowerCase().includes(query) ||
                    p.nominee_name?.toLowerCase().includes(query) ||
                    p.policyType?.toLowerCase().includes(query)
                );
            });
        }

        // Apply premium sort for 'premium' type (user-controlled)
        if (type === 'premium' && sortDirection) {
            filtered = [...filtered].sort((a, b) => {
                const diff = Number(b.premium_amount) - Number(a.premium_amount);
                return sortDirection === 'high' ? diff : -diff;
            });
        }

        return filtered;
    }, [allPolicies, type, searchQuery, sortDirection]);

    // Calculate total premium for premium view
    const totalPremium = type === 'premium'
        ? displayPolicies.reduce((sum, p) => sum + Number(p.premium_amount), 0)
        : 0;

    // Return early if modal is not open - AFTER all hooks are called
    if (!isOpen) return null;

    return (
        <>
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

                    {/* Search Bar - Only for 'total' type */}
                    {type === 'total' && (
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search policies (policy number, insurer, vehicle number, etc.)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* Sort Controls - For 'premium' type */}
                    {type === 'premium' && (
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">Sort by Premium:</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSortDirection(sortDirection === 'high' ? null : 'high')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all ${sortDirection === 'high'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                        High to Low
                                    </button>
                                    <button
                                        onClick={() => setSortDirection(sortDirection === 'low' ? null : 'low')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all ${sortDirection === 'low'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                        Low to High
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

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
                                <p className="text-gray-500">
                                    {searchQuery ? 'No policies match your search' : 'No policies found'}
                                </p>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-xl overflow-x-auto">
                                <table className="w-full min-w-[600px]">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Vehicle Number
                                            </th>
                                            {/* Vehicle Type Column for Motor Policies */}
                                            {displayPolicies.some(p => p.policyType === 'Motor') && (
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Vehicle Type
                                                </th>
                                            )}
                                            {/* Hide Policy Number for Expiring/Expired/Total types */}
                                            {!['expiring', 'expired', 'total'].includes(type) && (
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Policy Number
                                                </th>
                                            )}
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Insurer
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Premium
                                                {type === 'premium' && (
                                                    <ArrowDown className="w-3 h-3 inline ml-1 text-blue-600" />
                                                )}
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                End Date
                                            </th>
                                            {type === 'expiring' && (
                                                <>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                        Claims Status
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                        Quote
                                                    </th>
                                                </>
                                            )}
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                View Doc
                                            </th>
                                            {/* Action Column Header */}
                                            {(type === 'expiring' || type === 'expired') && (
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Action
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {displayPolicies.filter(p => p.policyType === 'Motor').map(p => renderPolicyRow(p, 'Motor'))}
                                        {displayPolicies.filter(p => p.policyType === 'Health').map(p => renderPolicyRow(p, 'Health'))}
                                        {displayPolicies.filter(p => p.policyType === 'Commercial').map(p => renderPolicyRow(p, 'Commercial'))}
                                        {displayPolicies.filter(p => p.policyType === 'Travel').map(p => renderPolicyRow(p, 'Travel'))}
                                        {displayPolicies.filter(p => p.policyType === 'Life').map(p => renderPolicyRow(p, 'Life'))}
                                        {displayPolicies.filter(p => p.policyType === 'Cyber').map(p => renderPolicyRow(p, 'Cyber'))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                        <p className="text-xs text-gray-500">
                            Click on a policy to view full details
                        </p>
                    </div>
                </div>
            </div>

            {/* Claims Info Popup */}
            {showClaimsInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Info className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Claims Status</h3>
                                <p className="text-sm text-gray-600">
                                    Please click on <span className="font-semibold">Yes</span>, if you have applied for any type of claim which is under process.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowClaimsInfo(false)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Renewal Confirmation Modal */}
            <RenewalConfirmationModal
                isOpen={showRenewalModal}
                onClose={() => setShowRenewalModal(false)}
                onConfirm={handleRenewalConfirm}
                policy={selectedPolicy}
                policyType={selectedPolicyType}
            />
        </>
    );
}
