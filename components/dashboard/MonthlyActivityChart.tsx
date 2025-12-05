'use client';

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Filter } from 'lucide-react';

interface MonthlyActivityChartProps {
    data: any[]; // Array of monthly data objects
    allPolicies: any[]; // Raw policies for filtering
}

export default function MonthlyActivityChart({ data: initialData, allPolicies }: MonthlyActivityChartProps) {
    const [metric, setMetric] = useState<'count' | 'premium'>('count');
    const [filterType, setFilterType] = useState<string>('All');

    // Process data based on filter and metric
    const chartData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const processedData = months.map(month => ({
            name: month,
            Active: 0,
            Expiring: 0,
            Expired: 0
        }));

        const filteredPolicies = filterType === 'All'
            ? allPolicies
            : allPolicies.filter(p => {
                const type = p.vehicle_number ? 'Motor' : p.no_of_lives !== undefined ? 'Health' : p.lob_type || 'Other';
                return type === filterType;
            });

        filteredPolicies.forEach(policy => {
            // Use policy start date if available, fallback to created_at
            const dateStr = policy.policy_start_date || policy.start_date || policy.created_at;
            const date = new Date(dateStr);
            const monthIndex = date.getMonth();
            const status = policy.status || 'Active'; // Default to Active if status missing

            // Map status to chart categories
            let category: 'Active' | 'Expiring' | 'Expired' = 'Active';
            if (status === 'Expiring Soon') category = 'Expiring';
            else if (status === 'Expired') category = 'Expired';
            else category = 'Active';

            if (metric === 'count') {
                processedData[monthIndex][category] += 1;
            } else {
                processedData[monthIndex][category] += Number(policy.premium_amount) || 0;
            }
        });

        return processedData;
    }, [allPolicies, metric, filterType]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Monthly Activity</h3>
                    <p className="text-sm text-gray-500">Policy status distribution over time</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {/* Metric Toggle */}
                    <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-medium">
                        <button
                            onClick={() => setMetric('count')}
                            className={`px-3 py-1.5 rounded-md transition-all ${metric === 'count'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Count
                        </button>
                        <button
                            onClick={() => setMetric('premium')}
                            className={`px-3 py-1.5 rounded-md transition-all ${metric === 'premium'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Premium
                        </button>
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="pl-3 pr-8 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="All">All Types</option>
                            <option value="Motor">Motor</option>
                            <option value="Health">Health</option>
                            <option value="Travel">Travel</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Life">Life</option>
                            <option value="Cyber">Cyber</option>
                        </select>
                        <Filter className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 11 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 11 }}
                            tickFormatter={(value) => metric === 'premium' ? `₹${value / 1000}k` : value}
                        />
                        <Tooltip
                            cursor={{ fill: '#f9fafb' }}
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                fontSize: '12px'
                            }}
                            formatter={(value: number) => [
                                metric === 'premium' ? formatCurrency(value) : value,
                                ''
                            ]}
                        />
                        <Legend
                            iconType="circle"
                            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                        />
                        <Bar dataKey="Active" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} barSize={20} />
                        <Bar dataKey="Expiring" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} barSize={20} />
                        <Bar dataKey="Expired" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
