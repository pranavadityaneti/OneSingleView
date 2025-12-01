'use client';

import React from 'react';
import { Heart, Download, FileText, AlertCircle, Calendar, Building2, Users } from 'lucide-react';
import { HealthPolicy } from '@/types';
import { formatCurrency, formatDate, calculatePolicyStatus } from '@/lib/utils';
import Link from 'next/link';

interface GMCPolicyCardProps {
    policy: HealthPolicy;
    isAdmin: boolean;
    onStartClaim: () => void;
}

export default function GMCPolicyCard({ policy, isAdmin, onStartClaim }: GMCPolicyCardProps) {
    const status = calculatePolicyStatus(new Date(policy.expiry_date));
    const statusColors = {
        'Active': 'text-green-600 bg-green-50',
        'Expiring Soon': 'text-orange-600 bg-orange-50',
        'Expired': 'text-red-600 bg-red-50'
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <Heart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Health Insurance</h2>
                        <p className="text-sm text-gray-600">Your group medical insurance policy</p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>
                    {status}
                </span>
            </div>

            {/* Policy Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Sum Insured</p>
                    <p className="text-lg font-bold text-gray-900">
                        {policy.sum_insured ? formatCurrency(policy.sum_insured) : 'N/A'}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Coverage Type</p>
                    <p className="text-sm font-semibold text-gray-900">
                        Parents, Spouse, Children & You
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Valid Till</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(new Date(policy.expiry_date))}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Employer</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center">
                        <Building2 className="w-4 h-4 mr-1" />
                        {policy.company_name || 'N/A'}
                    </p>
                </div>
            </div>

            {/* Policy Number */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Policy Number</p>
                <p className="text-sm font-mono font-semibold text-gray-900">{policy.policy_number}</p>
            </div>

            {/* Admin Stats (only for admins) */}
            {isAdmin && (
                <div className="mb-6 grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl text-center">
                        <Users className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                        <p className="text-2xl font-bold text-gray-900">{policy.no_of_lives || 0}</p>
                        <p className="text-xs text-gray-600">Employees</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl text-center">
                        <FileText className="w-5 h-5 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold text-gray-900">
                            {policy.premium_amount ? formatCurrency(policy.premium_amount) : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600">Premium</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl text-center">
                        <AlertCircle className="w-5 h-5 mx-auto mb-2 text-orange-600" />
                        <p className="text-2xl font-bold text-gray-900">0</p>
                        <p className="text-xs text-gray-600">Active Claims</p>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                    onClick={onStartClaim}
                    className="py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all"
                >
                    Start a Claim
                </button>
                <button className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all">
                    View Hospital Network
                </button>
                <button className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-all flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download E-Card
                </button>
            </div>

            {/* Quick Links */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3">Quick Links</p>
                <div className="space-y-2">
                    <Link href="#" className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all group">
                        <span className="text-sm text-gray-900">Guide to Cashless Claims</span>
                        <span className="text-primary-600 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                    <Link href="#" className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all group">
                        <span className="text-sm text-gray-900">Guide to Reimbursement Claims</span>
                        <span className="text-primary-600 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                    <Link href="#" className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all group">
                        <span className="text-sm text-gray-900">Guide to Emergency Claims</span>
                        <span className="text-primary-600 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
