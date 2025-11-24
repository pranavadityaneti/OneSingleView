import React from 'react';
import { Users, FileText, AlertCircle, TrendingUp, Shield, FileCheck, MessageSquare } from 'lucide-react';
import { AdminMetrics } from '@/lib/admin-db';

interface KPIGridProps {
    metrics: AdminMetrics;
}

export default function KPIGrid({ metrics }: KPIGridProps) {
    const cards = [
        {
            title: 'Total Users',
            value: metrics.totalUsers.total,
            subtext: `${metrics.totalUsers.individual} Ind | ${metrics.totalUsers.corporate} Corp`,
            icon: <Users className="w-5 h-5 text-blue-600" />,
            bg: 'bg-blue-50',
            trend: '+12%'
        },
        {
            title: 'Total Policies',
            value: metrics.policies.total,
            subtext: `${metrics.policies.active} Active`,
            icon: <FileText className="w-5 h-5 text-purple-600" />,
            bg: 'bg-purple-50',
            trend: '+5%'
        },
        {
            title: 'Expiring Soon',
            value: metrics.policies.expiringSoon,
            subtext: 'Next 20 Days',
            icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
            bg: 'bg-orange-50',
            trend: 'Action Req'
        },
        {
            title: 'Claims Raised',
            value: metrics.claims.raisedThisMonth,
            subtext: 'This Month',
            icon: <Shield className="w-5 h-5 text-red-600" />,
            bg: 'bg-red-50',
            trend: `${metrics.claims.pending} Pending`
        },
        {
            title: 'Open Quotes',
            value: metrics.quotes.open,
            subtext: `${metrics.quotes.pending} New`,
            icon: <MessageSquare className="w-5 h-5 text-green-600" />,
            bg: 'bg-green-50',
            trend: 'Pipeline'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {cards.map((card, index) => (
                <div key={index} className="card p-4 hover:shadow-md transition-shadow border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg ${card.bg}`}>
                            {card.icon}
                        </div>
                        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                            {card.trend}
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.subtext}</p>
                </div>
            ))}
        </div>
    );
}
