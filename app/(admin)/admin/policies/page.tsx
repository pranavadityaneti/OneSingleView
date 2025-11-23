'use client';

import { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Filter,
    Download,
    Car,
    Heart,
    Building,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';
import {
    getAllMotorPolicies,
    getAllGMCPolicies,
    getAllCommercialPolicies
} from '@/lib/db';
import { MotorPolicy, GMCPolicy, CommercialPolicy } from '@/types';

type PolicyType = 'motor' | 'health' | 'commercial';

export default function PoliciesPage() {
    const [activeTab, setActiveTab] = useState<PolicyType>('motor');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [motorPolicies, setMotorPolicies] = useState<MotorPolicy[]>([]);
    const [gmcPolicies, setGmcPolicies] = useState<GMCPolicy[]>([]);
    const [commercialPolicies, setCommercialPolicies] = useState<CommercialPolicy[]>([]);

    useEffect(() => {
        loadPolicies();
    }, []);

    const loadPolicies = async () => {
        try {
            const [motor, gmc, commercial] = await Promise.all([
                getAllMotorPolicies(),
                getAllGMCPolicies(),
                getAllCommercialPolicies()
            ]);
            setMotorPolicies(motor);
            setGmcPolicies(gmc);
            setCommercialPolicies(commercial);
        } catch (error) {
            console.error('Failed to load policies:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivePolicies = () => {
        switch (activeTab) {
            case 'motor': return motorPolicies;
            case 'health': return gmcPolicies;
            case 'commercial': return commercialPolicies;
            default: return [];
        }
    };

    const filteredPolicies = getActivePolicies().filter((policy: any) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            policy.policy_number?.toLowerCase().includes(searchLower) ||
            policy.insurer_name?.toLowerCase().includes(searchLower) ||
            policy.user_name?.toLowerCase().includes(searchLower) ||
            policy.user_email?.toLowerCase().includes(searchLower)
        );
    });

    const getStatusColor = (expiryDate: string | Date) => {
        const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry < 0) return 'bg-red-100 text-red-800';
        if (daysUntilExpiry < 30) return 'bg-orange-100 text-orange-800';
        return 'bg-green-100 text-green-800';
    };

    const getStatusText = (expiryDate: string | Date) => {
        const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry < 0) return 'Expired';
        if (daysUntilExpiry < 30) return 'Expiring Soon';
        return 'Active';
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Master Policy Tables</h1>
                    <p className="text-gray-500">View and manage all insurance policies across the platform</p>
                </div>
                <button className="btn btn-primary">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('motor')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'motor' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Car className="w-4 h-4 mr-2" />
                    Motor
                </button>
                <button
                    onClick={() => setActiveTab('health')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'health' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Heart className="w-4 h-4 mr-2" />
                    Health (GMC)
                </button>
                <button
                    onClick={() => setActiveTab('commercial')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'commercial' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Building className="w-4 h-4 mr-2" />
                    Commercial
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by policy no, insurer, or user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-gray-400 w-5 h-5" />
                    <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-transparent">
                        <option value="all">All Insurers</option>
                        <option value="hdfc">HDFC Ergo</option>
                        <option value="icici">ICICI Lombard</option>
                    </select>
                </div>
            </div>

            {/* Policy Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Policy Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Insurer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Premium</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPolicies.map((policy: any) => (
                                <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-mono font-medium text-gray-900">{policy.policy_number}</p>
                                            {activeTab === 'motor' && (
                                                <p className="text-xs text-gray-500">{policy.vehicle_number} • {policy.model}</p>
                                            )}
                                            {activeTab === 'health' && (
                                                <p className="text-xs text-gray-500">{policy.no_of_lives} Lives Insured</p>
                                            )}
                                            {activeTab === 'commercial' && (
                                                <p className="text-xs text-gray-500">{policy.lob_type}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{policy.user_name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500">{policy.user_email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {policy.insurer_name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-600">
                                            <p>Start: {new Date(policy.policy_start_date || policy.created_at).toLocaleDateString()}</p>
                                            <p>End: {new Date(policy.policy_end_date || policy.expiry_date).toLocaleDateString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-gray-900">
                                        ₹{policy.premium_amount?.toLocaleString() || '0'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(policy.policy_end_date || policy.expiry_date)}`}>
                                            {getStatusText(policy.policy_end_date || policy.expiry_date) === 'Active' && <CheckCircle className="w-3 h-3 mr-1" />}
                                            {getStatusText(policy.policy_end_date || policy.expiry_date) === 'Expiring Soon' && <Clock className="w-3 h-3 mr-1" />}
                                            {getStatusText(policy.policy_end_date || policy.expiry_date) === 'Expired' && <AlertCircle className="w-3 h-3 mr-1" />}
                                            {getStatusText(policy.policy_end_date || policy.expiry_date)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredPolicies.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No policies found matching your filters.
                    </div>
                )}
            </div>
        </div>
    );
}
