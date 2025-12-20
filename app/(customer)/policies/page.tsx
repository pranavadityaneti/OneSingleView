'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
    getUserMotorPolicies,
    getUserHealthPolicies,
    getUserCommercialPolicies,
} from '@/lib/db';
import { User, MotorPolicy, HealthPolicy, CommercialPolicy } from '@/types';
import { calculatePolicyStatus, formatCurrency } from '@/lib/utils';
import { Car, Heart, Briefcase, Search, Filter, Plus, Pencil } from 'lucide-react';
import Link from 'next/link';
import AddPolicyModal from '@/components/policies/AddPolicyModal';
import EditPolicyModal from '@/components/policies/EditPolicyModal';

function PoliciesContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('search') || '';
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [allPolicies, setAllPolicies] = useState<(MotorPolicy | HealthPolicy | CommercialPolicy)[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<any>(null);

    // Check if user is corporate
    const isCorporate = user?.role === 'corporate_employee' || user?.role === 'corporate_admin';

    const refreshData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [motor, gmc, commercial] = await Promise.all([
                getUserMotorPolicies(user.id),
                getUserHealthPolicies(user.id),
                getUserCommercialPolicies(user.id),
            ]);

            // Add type identifier to each policy
            const motorTyped = motor.map(p => ({ ...p, type: 'Motor' }));
            const gmcTyped = gmc.map(p => ({ ...p, type: 'Health' }));
            const commercialTyped = commercial.map(p => ({ ...p, type: 'Commercial' }));

            setAllPolicies([...motorTyped, ...gmcTyped, ...commercialTyped]);
        } catch (error) {
            console.error('Error reloading policies:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            refreshData();
        }
    }, [user]);

    // Filter logic - show ALL policies including expired
    const filteredPolicies = allPolicies.filter(policy => {
        const matchesSearch = searchQuery === '' ||
            policy.policy_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            policy.insurer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ('vehicle_number' in policy && (policy as MotorPolicy).vehicle_number.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Policies</h1>
                    <p className="text-gray-500">Manage and view all your insurance policies</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search policies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Policy
                    </button>
                </div>
            </div>

            {filteredPolicies.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No policies found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your search or add a new policy</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                    {isCorporate && (
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                                    )}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle/Policy #</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Insurer</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Premium</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End Date</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredPolicies.map((policy: any) => {
                                    const isMotor = policy.type === 'Motor';
                                    const isHealth = policy.type === 'Health';
                                    const Icon = isMotor ? Car : isHealth ? Heart : Briefcase;
                                    const colorClass = isMotor ? 'text-blue-600 bg-blue-50' : isHealth ? 'text-green-600 bg-green-50' : 'text-purple-600 bg-purple-50';
                                    const expiryDate = new Date(isHealth || policy.type === 'Commercial' ? policy.expiry_date : policy.policy_end_date);
                                    const startDate = isMotor ? new Date(policy.policy_start_date) : null;
                                    const status = calculatePolicyStatus(expiryDate);
                                    const identifier = isMotor ? (policy as MotorPolicy).vehicle_number : policy.policy_number;
                                    const detailHref = `/policies/${isMotor ? 'motor' : isHealth ? 'health' : 'commercial'}/${policy.id}`;

                                    // Build details string based on policy type
                                    let details = '';
                                    if (isMotor) {
                                        const mp = policy as MotorPolicy;
                                        details = `${mp.vehicle_type || ''} • ${mp.manufacturer || ''} ${mp.model || ''}`.trim();
                                    } else if (isHealth) {
                                        const hp = policy as HealthPolicy;
                                        details = hp.sum_insured ? `₹${(hp.sum_insured / 100000).toFixed(1)}L SI` : '';
                                        if (hp.no_of_lives) details += ` • ${hp.no_of_lives} lives`;
                                    } else {
                                        const cp = policy as CommercialPolicy;
                                        details = cp.lob_type || '';
                                        if (cp.sum_insured) details += ` • ₹${(cp.sum_insured / 100000).toFixed(1)}L SI`;
                                    }

                                    return (
                                        <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                                            {/* Type */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-md ${colorClass}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{policy.type}</span>
                                                </div>
                                            </td>

                                            {/* Company Name (Corporate only) */}
                                            {isCorporate && (
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {policy.company_name || '—'}
                                                </td>
                                            )}

                                            {/* Vehicle/Policy Number (Clickable) */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Link
                                                    href={detailHref}
                                                    className="text-sm font-semibold text-primary-600 hover:text-primary-800 hover:underline"
                                                >
                                                    {identifier}
                                                </Link>
                                            </td>

                                            {/* Insurer */}
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {policy.insurer_name}
                                            </td>

                                            {/* Premium */}
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                                                {formatCurrency(policy.premium_amount)}
                                            </td>

                                            {/* Start Date */}
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {startDate ? startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </td>

                                            {/* End Date */}
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {expiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status === 'Active' ? 'bg-green-100 text-green-800' :
                                                    status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {status}
                                                </span>
                                            </td>

                                            {/* Details */}
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 max-w-[200px] truncate" title={details}>
                                                {details || '—'}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedPolicy(policy);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Edit Policy"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AddPolicyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={user?.id || ''}
                userRole={user?.role}
                onSuccess={refreshData}
            />

            <EditPolicyModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedPolicy(null);
                }}
                policy={selectedPolicy}
                onSuccess={refreshData}
            />
        </div>
    );
}

export default function PoliciesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <PoliciesContent />
        </Suspense>
    );
}
