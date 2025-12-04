'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getUserCyberPolicies } from '@/lib/db';
import { User } from '@/types';
import { calculatePolicyStatus, formatCurrency } from '@/lib/utils';
import { Shield, Plus, ArrowLeft, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CyberPoliciesPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    router.push('/login');
                    return;
                }
                setUser(currentUser);

                const cyberPolicies = await getUserCyberPolicies(currentUser.id);
                const processedPolicies = cyberPolicies.map((p: any) => ({
                    ...p,
                    status: calculatePolicyStatus(new Date(p.policy_end_date))
                }));
                setPolicies(processedPolicies);
            } catch (error) {
                console.error('Error loading cyber policies:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router]);

    const filteredPolicies = policies.filter(policy =>
        searchQuery === '' ||
        policy.policy_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.insurer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="w-7 h-7 text-green-600" />
                            Cyber Policies
                        </h1>
                        <p className="text-gray-500">{policies.length} {policies.length === 1 ? 'policy' : 'policies'} found</p>
                    </div>
                </div>

                <Link
                    href="/dashboard"
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Cyber Policy
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search policies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                />
            </div>

            {/* Policies Grid */}
            {filteredPolicies.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No cyber policies found</h3>
                    <p className="text-gray-500 mt-1">
                        {searchQuery ? 'Try adjusting your search' : 'Add your first cyber policy to get started'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPolicies.map((policy) => {
                        const expiryDate = new Date(policy.policy_end_date);
                        const status = calculatePolicyStatus(expiryDate);

                        return (
                            <div
                                key={policy.id}
                                className="bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all p-5"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 rounded-lg bg-green-50 text-green-600">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'Active' ? 'bg-green-100 text-green-800' :
                                            status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {status}
                                    </span>
                                </div>

                                <h3 className="font-bold text-gray-900 mb-1">{policy.insurer_name}</h3>
                                <p className="text-sm text-gray-500 mb-1">{policy.policy_number}</p>
                                <p className="text-xs font-medium text-gray-600 mb-3">Cyber Insurance</p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Company</span>
                                        <span className="font-medium">{policy.company_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Coverage</span>
                                        <span className="font-medium">{formatCurrency(policy.sum_insured || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Premium</span>
                                        <span className="font-medium">{formatCurrency(policy.premium_amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Valid Till</span>
                                        <span className="font-medium">{expiryDate.toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
