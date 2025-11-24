'use client';

import React, { useState, useEffect } from 'react';
import { History, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getUserMotorPolicies, getUserHealthPolicies, getUserCommercialPolicies } from '@/lib/db';
import { MotorPolicy, HealthPolicy, CommercialPolicy, User } from '@/types';

type AnyPolicy = (MotorPolicy | HealthPolicy | CommercialPolicy) & { type: 'Motor' | 'Health' | 'Commercial' };

export default function HistoryPage() {
    const [user, setUser] = useState<User | null>(null);
    const [expiredPolicies, setExpiredPolicies] = useState<AnyPolicy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserAndHistory = async () => {
            setLoading(true);
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    setLoading(false);
                    return;
                }
                setUser(currentUser);

                const [motor, gmc, commercial] = await Promise.all([
                    getUserMotorPolicies(currentUser.id),
                    getUserHealthPolicies(currentUser.id),
                    getUserCommercialPolicies(currentUser.id)
                ]);

                const now = new Date();
                const allPolicies: AnyPolicy[] = [
                    ...motor.map(p => ({ ...p, type: 'Motor' as const })),
                    ...gmc.map(p => ({ ...p, type: 'Health' as const })),
                    ...commercial.map(p => ({ ...p, type: 'Commercial' as const }))
                ];

                // Filter for expired policies (end date < now)
                const expired = allPolicies.filter(p => {
                    const endDate = 'policy_end_date' in p ? p.policy_end_date : p.expiry_date;
                    return new Date(endDate) < now;
                });

                setExpiredPolicies(expired.sort((a, b) => {
                    const dateA = 'policy_end_date' in a ? a.policy_end_date : a.expiry_date;
                    const dateB = 'policy_end_date' in b ? b.policy_end_date : b.expiry_date;
                    return new Date(dateB).getTime() - new Date(dateA).getTime();
                }));

            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndHistory();
    }, []);

    const getPolicyTitle = (policy: AnyPolicy) => {
        if (policy.type === 'Motor') return `${(policy as MotorPolicy).vehicle_number} - ${(policy as MotorPolicy).model}`;
        if (policy.type === 'Health') return `${(policy as HealthPolicy).company_name} Health`;
        return `${(policy as CommercialPolicy).lob_type} Policy`;
    };

    const getPolicyEndDate = (policy: AnyPolicy) => {
        return 'policy_end_date' in policy ? policy.policy_end_date : policy.expiry_date;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Policy History</h1>
                <p className="text-gray-500">View your expired and past insurance policies</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : expiredPolicies.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No History Found</h3>
                    <p className="text-gray-500">You don't have any expired policies yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Policy Details</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Insurer</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expired On</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expiredPolicies.map((policy) => (
                                    <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{getPolicyTitle(policy)}</div>
                                            <div className="text-xs text-gray-500">{policy.policy_number}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {policy.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {policy.insurer_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(getPolicyEndDate(policy)).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Expired
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
                                                Renew <ArrowRight className="w-4 h-4 ml-1" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
