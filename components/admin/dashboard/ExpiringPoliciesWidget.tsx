import React from 'react';
import { Calendar, ArrowRight, Bell } from 'lucide-react';
import { ExpiryOverview } from '@/lib/admin-db';
import Link from 'next/link';

interface ExpiringPoliciesWidgetProps {
    data: ExpiryOverview;
}

export default function ExpiringPoliciesWidget({ data }: ExpiringPoliciesWidgetProps) {
    return (
        <div className="card h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <h3 className="font-bold text-gray-900">Expiring Policies Overview</h3>
                </div>
                <Link href="/admin/policies?filter=expiring" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>

            {/* Expiry Ranges */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 p-3 rounded-lg text-center border border-red-100">
                    <p className="text-xs font-semibold text-red-600 uppercase">0-7 Days</p>
                    <p className="text-2xl font-bold text-red-700">{data.range0to7}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center border border-orange-100">
                    <p className="text-xs font-semibold text-orange-600 uppercase">8-15 Days</p>
                    <p className="text-2xl font-bold text-orange-700">{data.range8to15}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-100">
                    <p className="text-xs font-semibold text-yellow-600 uppercase">16-20 Days</p>
                    <p className="text-2xl font-bold text-yellow-700">{data.range16to20}</p>
                </div>
            </div>

            {/* Top 5 List */}
            <div className="flex-1 overflow-auto">
                <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Approaching Expiry</h4>
                <div className="space-y-3">
                    {data.topExpiring.length > 0 ? (
                        data.topExpiring.map((policy) => (
                            <div key={policy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{policy.customerName}</p>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                        <span className="bg-white px-1.5 rounded border border-gray-200">{policy.lob}</span>
                                        <span>Expires: {new Date(policy.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-full transition-all" title="Notify Customer">
                                    <Bell className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No policies expiring soon.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
