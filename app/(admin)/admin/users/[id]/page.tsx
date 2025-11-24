'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Phone,
    Building,
    Calendar,
    Shield,
    FileText,
    Clock,
    ArrowLeft,
    AlertCircle
} from 'lucide-react';
import {
    getUserById,
    getUserMotorPolicies,
    getUserHealthPolicies,
    getUserCommercialPolicies,
    getUserAuditLogs
} from '@/lib/db';
import { User as UserType, AuditLog } from '@/types';

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [policies, setPolicies] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'activity'>('overview');

    useEffect(() => {
        if (userId) {
            loadUserData();
        }
    }, [userId]);

    const loadUserData = async () => {
        try {
            const [userData, motor, gmc, commercial, logs] = await Promise.all([
                getUserById(userId),
                getUserMotorPolicies(userId),
                getUserHealthPolicies(userId),
                getUserCommercialPolicies(userId),
                getUserAuditLogs(userId)
            ]);

            setUser(userData);

            // Combine all policies
            const allPolicies = [
                ...motor.map(p => ({ ...p, type: 'Motor' })),
                ...gmc.map(p => ({ ...p, type: 'Health' })),
                ...commercial.map(p => ({ ...p, type: 'Commercial' }))
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setPolicies(allPolicies);
            setAuditLogs(logs);
        } catch (error) {
            console.error('Failed to load user data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold text-gray-900">User not found</h2>
                <button onClick={() => router.back()} className="mt-4 text-primary-600 hover:underline">
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                    <div className="flex items-center text-sm text-gray-500 gap-2">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                            {user.customer_id || 'ID: N/A'}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{user.role} Account</span>
                    </div>
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                            <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Mobile</p>
                            <p className="text-sm font-medium text-gray-900">{user.mobile}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                            <Building className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Company</p>
                            <p className="text-sm font-medium text-gray-900">{user.company_name || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Joined</p>
                            <p className="text-sm font-medium text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['overview', 'policies', 'activity'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                                ${activeTab === tab
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Portfolio Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Policies</span>
                                    <span className="font-bold text-xl">{policies.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Active Claims</span>
                                    <span className="font-bold text-xl text-orange-600">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'policies' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Policy No</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Insurer</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Expiry</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {policies.map((policy) => (
                                    <tr key={policy.id}>
                                        <td className="px-6 py-4 font-mono text-sm">{policy.policy_number}</td>
                                        <td className="px-6 py-4 text-sm">{policy.type}</td>
                                        <td className="px-6 py-4 text-sm">{policy.insurer_name}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {new Date(policy.expiry_date || policy.policy_end_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {policies.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No policies found for this user.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="space-y-6">
                            {auditLogs.length > 0 ? auditLogs.map((log) => (
                                <div key={log.id} className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-gray-300 ring-4 ring-white"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {log.action.replace('_', ' ')}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(log.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center text-gray-500 py-8">
                                    No activity logs found.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
