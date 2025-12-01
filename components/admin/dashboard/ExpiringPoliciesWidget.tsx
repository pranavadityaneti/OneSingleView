import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { ExpiryOverview } from '@/lib/admin-db';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ExpiringPoliciesWidgetProps {
    data: ExpiryOverview;
}

export default function ExpiringPoliciesWidget({ data }: ExpiringPoliciesWidgetProps) {
    const chartData = [
        { name: '0-7 Days', value: data.range0to7, color: '#DC2626', bgColor: '#FEF2F2' },
        { name: '8-15 Days', value: data.range8to15, color: '#EA580C', bgColor: '#FFF7ED' },
        { name: '16-20 Days', value: data.range16to20, color: '#CA8A04', bgColor: '#FEFCE8' }
    ];

    const totalExpiring = data.range0to7 + data.range8to15 + data.range16to20;

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <h3 className="font-bold text-gray-900">Expiring Policies Overview</h3>
                </div>
                <Link href="/admin/policies?filter=expiring" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>

            {/* Summary */}
            <div className="mb-4">
                <p className="text-3xl font-bold text-gray-900">{totalExpiring}</p>
                <p className="text-sm text-gray-500">Policies expiring in next 20 days</p>
            </div>

            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={70} style={{ fontSize: '12px' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any) => [`${value} ${value === 1 ? 'policy' : 'policies'}`, 'Count']}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
