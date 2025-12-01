'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';
import { PremiumBreakdown, getPremiumByLOB } from '@/lib/admin-db';
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from 'recharts';

export default function PremiumSourceWidget() {
    const [data, setData] = useState<PremiumBreakdown[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPremium, setTotalPremium] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const premiumData = await getPremiumByLOB();
        setData(premiumData);
        const total = premiumData.reduce((sum, item) => sum + item.value, 0);
        setTotalPremium(total);
        setLoading(false);
    };

    // Transform data for Radial Bar Chart (Recharts expects angles/endAngle)
    const chartData = data.map((item, index) => ({
        name: item.name,
        value: item.percentage,
        fill: item.fill
    })).reverse(); // Reverse so largest is on outside

    const formatCurrency = (value: number) => {
        if (value >= 10000000) {
            return `₹${(value / 10000000).toFixed(2)}Cr`;
        } else if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        } else {
            return `₹${value.toLocaleString()}`;
        }
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-gray-900">Premium Source</h3>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <DollarSign className="w-12 h-12 mb-2 opacity-50" />
                    <p className="text-sm">No premium data available</p>
                </div>
            ) : (
                <>
                    {/* Total Premium */}
                    <div className="text-center mb-6">
                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalPremium)}</p>
                        <p className="text-sm text-gray-500">Total Premium</p>
                    </div>

                    {/* Radial Bar Chart */}
                    <ResponsiveContainer width="100%" height={220}>
                        <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="30%"
                            outerRadius="100%"
                            data={chartData}
                            startAngle={90}
                            endAngle={-270}
                        >
                            <RadialBar
                                background
                                dataKey="value"
                                cornerRadius={10}
                            />
                            <Tooltip
                                formatter={(value: any) => `${value}%`}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {data.map((item) => (
                            <div key={item.name} className="text-center">
                                <div className="flex items-center justify-center mb-1">
                                    <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: item.fill }}
                                    ></div>
                                    <span className="text-xs font-semibold text-gray-700">{item.name}</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">{item.percentage}%</p>
                                <p className="text-xs text-gray-500">{formatCurrency(item.value)}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
