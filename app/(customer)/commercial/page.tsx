'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Eye, Upload, Trash2 } from 'lucide-react';
import { getUserCommercialPolicies, deleteCommercialPolicy } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { CommercialPolicy, User } from '@/types';
import { calculatePolicyStatus, formatCurrency, formatDate } from '@/lib/utils';
import CommercialPolicyForm from '@/components/forms/CommercialPolicyForm';

export default function CommercialPoliciesPage() {
    const router = useRouter();
    const [policies, setPolicies] = useState<CommercialPolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<CommercialPolicy | undefined>(undefined);
    const [user, setUser] = useState<User | null>(null);

    const loadPolicies = async (userId: string) => {
        setLoading(true);
        try {
            const data = await getUserCommercialPolicies(userId);

            const policiesWithStatus = data.map(p => ({
                ...p,
                status: calculatePolicyStatus(new Date(p.expiry_date))
            }));

            setPolicies(policiesWithStatus);
        } catch (error) {
            console.error('Error loading policies:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                router.push('/login');
                return;
            }
            setUser(currentUser);
            loadPolicies(currentUser.id);
        };
        init();
    }, [router]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this policy?')) return;
        if (!user) return;
        try {
            await deleteCommercialPolicy(id);
            await loadPolicies(user.id);
        } catch (error) {
            console.error('Error deleting policy:', error);
            alert('Failed to delete policy');
        }
    };

    const handleEdit = (policy: CommercialPolicy) => {
        setEditingPolicy(policy);
        setShowAddForm(true);
    };

    const handleCloseForm = () => {
        setShowAddForm(false);
        setEditingPolicy(undefined);
    };

    const totalPolicies = policies.length;
    const totalPremium = policies.reduce((sum, p) => sum + Number(p.premium_amount), 0);
    const totalSumInsured = policies.reduce((sum, p) => sum + (p.sum_insured || 0), 0);

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Expiring Soon':
                return 'bg-orange-100 text-orange-800';
            case 'Expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Commercial Policies</h1>
                    <p className="text-gray-600 mt-1">Manage your commercial and other insurance policies</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Policy
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stat-card bg-blue-50 border-blue-100">
                    <p className="stat-label">Total Policies</p>
                    <p className="stat-value text-blue-600">{totalPolicies}</p>
                </div>
                <div className="stat-card bg-green-50 border-green-100">
                    <p className="stat-label">Total Premium</p>
                    <p className="stat-value text-green-600">{formatCurrency(totalPremium)}</p>
                </div>
                <div className="stat-card bg-purple-50 border-purple-100">
                    <p className="stat-label">Total Sum Insured</p>
                    <p className="stat-value text-purple-600">{formatCurrency(totalSumInsured)}</p>
                </div>
            </div>

            {/* Policies Table */}
            {policies.length === 0 ? (
                <div className="card text-center py-12">
                    <div className="text-gray-500">
                        <p className="text-lg font-medium mb-2">No commercial policies yet</p>
                        <p className="mb-6">Add your first commercial policy to get started</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="btn-primary mx-auto"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            <span>Add Your First Policy</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-header-cell">LOB Type</th>
                                    <th className="table-header-cell">Company/Holder</th>
                                    <th className="table-header-cell">Insurer</th>
                                    <th className="table-header-cell">Sum Insured</th>
                                    <th className="table-header-cell">Premium</th>
                                    <th className="table-header-cell">Expiry Date</th>
                                    <th className="table-header-cell">Status</th>
                                    <th className="table-header-cell">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {policies.map((policy) => (
                                    <tr key={policy.id} className="table-row">
                                        <td className="table-cell font-medium">{policy.lob_type}</td>
                                        <td className="table-cell">
                                            <div className="text-sm text-gray-900">{policy.company_name || policy.policy_holder_name}</div>
                                        </td>
                                        <td className="table-cell">{policy.insurer_name}</td>
                                        <td className="table-cell">{formatCurrency(policy.sum_insured || 0)}</td>
                                        <td className="table-cell">{formatCurrency(policy.premium_amount)}</td>
                                        <td className="table-cell">{formatDate(policy.expiry_date)}</td>
                                        <td className="table-cell">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(policy.status)}`}>
                                                {policy.status}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(policy)}
                                                    className="p-1 text-gray-500 hover:text-primary-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(policy.id)}
                                                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Policy Form Modal */}
            {showAddForm && user && (
                <CommercialPolicyForm
                    userId={user.id}
                    initialData={editingPolicy}
                    onClose={handleCloseForm}
                    onSuccess={() => loadPolicies(user.id)}
                />
            )}
        </div>
    );
}
