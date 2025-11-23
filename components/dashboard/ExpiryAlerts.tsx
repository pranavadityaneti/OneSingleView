'use client';

import { useState } from 'react';
import { MotorPolicy, GMCPolicy, CommercialPolicy } from '@/types';
import { formatDate, daysUntil, formatCurrency } from '@/lib/utils';
import { AlertCircle, Car, Heart, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface ExpiryAlertsProps {
    motorPolicies: MotorPolicy[];
    gmcPolicies: GMCPolicy[];
    commercialPolicies: CommercialPolicy[];
}

export default function ExpiryAlerts({ motorPolicies, gmcPolicies, commercialPolicies }: ExpiryAlertsProps) {
    const [expanded, setExpanded] = useState(false);

    // Filter expiring soon policies
    const expiringMotor = motorPolicies.filter((p) => p.status === 'Expiring Soon');
    const expiringGMC = gmcPolicies.filter((p) => p.status === 'Expiring Soon');
    const expiringCommercial = commercialPolicies.filter((p) => p.status === 'Expiring Soon');

    const totalExpiring = expiringMotor.length + expiringGMC.length + expiringCommercial.length;

    if (totalExpiring === 0) {
        return (
            <div className="card bg-green-50 border border-green-200">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-900">All policies are up to date!</h3>
                        <p className="text-sm text-green-700">No policies expiring in the next 20 days</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-orange-50 border border-orange-200">
            {/* Header */}
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-orange-900">
                            {totalExpiring} {totalExpiring === 1 ? 'Policy' : 'Policies'} Expiring Soon
                        </h3>
                        <p className="text-sm text-orange-700">
                            Within the next 20 days - Click to view details
                        </p>
                    </div>
                </div>
                {expanded ? (
                    <ChevronUp className="w-5 h-5 text-orange-600" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-orange-600" />
                )}
            </div>

            {/* Expanded List */}
            {expanded && (
                <div className="mt-4 space-y-3 pt-4 border-t border-orange-200">
                    {/* Motor Policies */}
                    {expiringMotor.map((policy) => (
                        <div key={policy.id} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <Car className="w-5 h-5 text-primary-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">{policy.vehicle_number}</p>
                                        <p className="text-sm text-gray-600">{policy.insurer_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Policy: {policy.policy_number}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-orange-700">
                                        {daysUntil(new Date(policy.policy_end_date))} days left
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Expires: {formatDate(new Date(policy.policy_end_date))}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Premium: {formatCurrency(policy.premium_amount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* GMC Policies */}
                    {expiringGMC.map((policy) => (
                        <div key={policy.id} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <Heart className="w-5 h-5 text-secondary-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {policy.company_name || 'GMC Policy'}
                                        </p>
                                        <p className="text-sm text-gray-600">{policy.insurer_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Policy: {policy.policy_number}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-orange-700">
                                        {daysUntil(new Date(policy.expiry_date))} days left
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Expires: {formatDate(new Date(policy.expiry_date))}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Premium: {formatCurrency(policy.premium_amount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Commercial Policies */}
                    {expiringCommercial.map((policy) => (
                        <div key={policy.id} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <FileText className="w-5 h-5 text-accent mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {policy.company_name || policy.policy_holder_name || `${policy.lob_type} Policy`}
                                        </p>
                                        <p className="text-sm text-gray-600">{policy.insurer_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Policy: {policy.policy_number}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-orange-700">
                                        {daysUntil(new Date(policy.expiry_date))} days left
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Expires: {formatDate(new Date(policy.expiry_date))}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Premium: {formatCurrency(policy.premium_amount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
