'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface AnalyticsAreaChartProps {
    data?: { name: string; value: number }[];
}

export default function AnalyticsAreaChart({ data = [] }: AnalyticsAreaChartProps) {
    // Calculate total and percentage change (mock percentage for now)
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="w-full h-full bg-white rounded-2xl p-8 shadow-soft border border-gray-100 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Total Premium Trend</h3>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold text-gray-900">{formatCurrency(total)}</h2>
                        <span className="bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full flex items-center">
                            +20.8%
                        </span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary-600"></span>
                        <span className="text-xs text-gray-500 font-medium">Current Year</span>
                    </div>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 10 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 10 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1E293B',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}
                            labelStyle={{ display: 'none' }}
                            formatter={(value: number) => [`₹${value}`, 'Premium']}
                            cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
