'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
    getUserMotorPolicies,
    getUserGMCPolicies,
    getUserCommercialPolicies,
} from '@/lib/db';
import { User, MotorPolicy, GMCPolicy, CommercialPolicy } from '@/types';
import { calculatePolicyStatus, formatCurrency } from '@/lib/utils';
import { Car, Heart, Briefcase, Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import AddPolicyModal from '@/components/policies/AddPolicyModal';

function PoliciesContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('search') || '';
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [allPolicies, setAllPolicies] = useState<(MotorPolicy | GMCPolicy | CommercialPolicy)[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const refreshData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [motor, gmc, commercial] = await Promise.all([
                getUserMotorPolicies(user.id),
                getUserGMCPolicies(user.id),
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

    // Filter logic
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPolicies.map((policy: any) => {
                        const isMotor = policy.type === 'Motor';
                        const isHealth = policy.type === 'Health';
                        const Icon = isMotor ? Car : isHealth ? Heart : Briefcase;
                        const colorClass = isMotor ? 'text-blue-600 bg-blue-50' : isHealth ? 'text-green-600 bg-green-50' : 'text-purple-600 bg-purple-50';
                        const expiryDate = new Date(isHealth || policy.type === 'Commercial' ? policy.expiry_date : policy.policy_end_date);
                        const status = calculatePolicyStatus(expiryDate);

                        return (
                            <Link
                                key={policy.id}
                                href={`/policies/${isMotor ? 'motor' : isHealth ? 'health' : 'commercial'}/${policy.id}`}
                                className="block bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all p-5"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-lg ${colorClass}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'Active' ? 'bg-green-100 text-green-800' :
                                        status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {status}
                                    </span>
                                </div>

                                <h3 className="font-bold text-gray-900 mb-1">{policy.insurer_name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{policy.policy_number}</p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Premium</span>
                                        <span className="font-medium">{formatCurrency(policy.premium_amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Valid Till</span>
                                        <span className="font-medium">{expiryDate.toLocaleDateString()}</span>
                                    </div>
                                    {isMotor && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Vehicle</span>
                                            <span className="font-medium">{(policy as MotorPolicy).vehicle_number}</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            <AddPolicyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={user?.id || ''}
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
