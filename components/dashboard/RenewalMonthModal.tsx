'use client';

import React from 'react';
import { X, Car, Heart, Briefcase, Plane, Umbrella, Shield, Calendar, IndianRupee } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface RenewalMonthModalProps {
    isOpen: boolean;
    onClose: () => void;
    month: string;
    year: number;
    policies: any[];
}

export default function RenewalMonthModal({ isOpen, onClose, month, year, policies }: RenewalMonthModalProps) {
    if (!isOpen) return null;

    const totalPremium = policies.reduce((sum, p) => sum + (Number(p.premium_amount) || 0), 0);

    const getPolicyTypeIcon = (policy: any) => {
        if (policy.vehicle_number) return <Car className="w-4 h-4" />;
        if (policy.no_of_lives !== undefined) return <Heart className="w-4 h-4" />;
        if (policy.lob_type) return <Briefcase className="w-4 h-4" />;
        if (policy.destination) return <Plane className="w-4 h-4" />;
        if (policy.nominee_name) return <Umbrella className="w-4 h-4" />;
        return <Shield className="w-4 h-4" />;
    };

    const getPolicyType = (policy: any) => {
        if (policy.vehicle_number) return 'Motor';
        if (policy.no_of_lives !== undefined) return 'Health';
        if (policy.lob_type) return 'Commercial';
        if (policy.destination) return 'Travel';
        if (policy.nominee_name) return 'Life';
        return 'Cyber';
    };

    const getExpiryDate = (policy: any) => {
        return policy.policy_end_date || policy.expiry_date;
    };

    const getPolicyIdentifier = (policy: any) => {
        if (policy.vehicle_number) return policy.vehicle_number;
        if (policy.policy_number) return policy.policy_number;
        return policy.id?.slice(0, 8) || 'N/A';
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Renewals Due - {month} {year}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {policies.length} {policies.length === 1 ? 'policy' : 'policies'} expiring
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Summary Bar */}
                    <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                                {policies.length} Renewals
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <IndianRupee className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-bold text-blue-800">
                                {formatCurrency(totalPremium)} Total Premium
                            </span>
                        </div>
                    </div>

                    {/* Policy List */}
                    <div className="overflow-y-auto max-h-[50vh] p-4">
                        {policies.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No policies expiring in {month} {year}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {policies.map((policy, index) => {
                                    const expiryDate = getExpiryDate(policy);
                                    const policyType = getPolicyType(policy);

                                    return (
                                        <div
                                            key={policy.id || index}
                                            className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${policyType === 'Motor' ? 'bg-blue-100 text-blue-600' :
                                                            policyType === 'Health' ? 'bg-green-100 text-green-600' :
                                                                policyType === 'Commercial' ? 'bg-orange-100 text-orange-600' :
                                                                    policyType === 'Travel' ? 'bg-purple-100 text-purple-600' :
                                                                        policyType === 'Life' ? 'bg-pink-100 text-pink-600' :
                                                                            'bg-cyan-100 text-cyan-600'
                                                        }`}>
                                                        {getPolicyTypeIcon(policy)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-900">
                                                                {getPolicyIdentifier(policy)}
                                                            </span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${policyType === 'Motor' ? 'bg-blue-100 text-blue-700' :
                                                                    policyType === 'Health' ? 'bg-green-100 text-green-700' :
                                                                        policyType === 'Commercial' ? 'bg-orange-100 text-orange-700' :
                                                                            policyType === 'Travel' ? 'bg-purple-100 text-purple-700' :
                                                                                policyType === 'Life' ? 'bg-pink-100 text-pink-700' :
                                                                                    'bg-cyan-100 text-cyan-700'
                                                                }`}>
                                                                {policyType}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {policy.insurer_name || 'Unknown Insurer'}
                                                        </p>
                                                        {policy.vehicle_type && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {policy.vehicle_type} • {policy.manufacturer} {policy.model}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">
                                                        {formatCurrency(Number(policy.premium_amount) || 0)}
                                                    </p>
                                                    <p className="text-xs text-orange-600 mt-1">
                                                        Expires: {expiryDate ? formatDate(new Date(expiryDate)) : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
