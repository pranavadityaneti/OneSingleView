'use client';

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Filter, Calendar, ChevronDown } from 'lucide-react';
import RenewalMonthModal from './RenewalMonthModal';

interface MonthlyActivityChartProps {
    data: any[]; // Array of monthly data objects (legacy, not used)
    allPolicies: any[]; // Raw policies for filtering
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthlyActivityChart({ data: initialData, allPolicies }: MonthlyActivityChartProps) {
    const [metric, setMetric] = useState<'count' | 'premium'>('count');
    const [filterType, setFilterType] = useState<string>('All');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedMonthPolicies, setSelectedMonthPolicies] = useState<any[]>([]);

    // Get available years based on policy expiry dates
    const availableYears = useMemo(() => {
        const years = new Set<number>();
        const currentYear = new Date().getFullYear();

        // Add current year and next 5 years by default
        for (let i = 0; i <= 5; i++) {
            years.add(currentYear + i);
        }

        // Also add years from actual policy data
        allPolicies.forEach(policy => {
            const expiryDate = policy.policy_end_date || policy.expiry_date;
            if (expiryDate) {
                const year = new Date(expiryDate).getFullYear();
                if (year >= currentYear) {
                    years.add(year);
                }
            }
        });

        return Array.from(years).sort((a, b) => a - b);
    }, [allPolicies]);

    // Get policies grouped by expiry month for the selected year
    const policiesByMonth = useMemo(() => {
        const result: { [key: number]: any[] } = {};

        // Initialize all months
        for (let i = 0; i < 12; i++) {
            result[i] = [];
        }

        // Filter by policy type if needed
        const filteredPolicies = filterType === 'All'
            ? allPolicies
            : allPolicies.filter(p => {
                const type = p.vehicle_number ? 'Motor'
                    : p.no_of_lives !== undefined ? 'Health'
                        : p.lob_type ? 'Commercial'
                            : p.destination ? 'Travel'
                                : p.nominee_name ? 'Life'
                                    : 'Cyber';
                return type === filterType;
            });

        // Group policies by expiry month
        filteredPolicies.forEach(policy => {
            const expiryDate = policy.policy_end_date || policy.expiry_date;
            if (expiryDate) {
                const date = new Date(expiryDate);
                const year = date.getFullYear();
                const month = date.getMonth();

                if (year === selectedYear) {
                    result[month].push(policy);
                }
            }
        });

        return result;
    }, [allPolicies, filterType, selectedYear]);

    // Process chart data
    const chartData = useMemo(() => {
        return MONTHS.map((month, index) => {
            const policies = policiesByMonth[index] || [];
            const count = policies.length;
            const premium = policies.reduce((sum, p) => sum + (Number(p.premium_amount) || 0), 0);

            return {
                name: month,
                monthIndex: index,
                count,
                premium,
                value: metric === 'count' ? count : premium,
                policies
            };
        });
    }, [policiesByMonth, metric]);

    // Handle bar click
    const handleBarClick = (data: any) => {
        if (data && data.policies && data.policies.length > 0) {
            setSelectedMonth(data.name);
            setSelectedMonthPolicies(data.policies);
            setIsModalOpen(true);
        }
    };

    // Custom bar color based on value
    const getBarColor = (value: number, maxValue: number) => {
        if (value === 0) return '#e5e7eb'; // Gray for empty
        const intensity = value / maxValue;
        if (intensity > 0.7) return '#3b82f6'; // Blue for high
        if (intensity > 0.4) return '#60a5fa'; // Light blue for medium
        return '#93c5fd'; // Very light blue for low
    };

    const maxValue = Math.max(...chartData.map(d => d.value), 1);

    // Total renewals and premium for the year
    const yearTotal = useMemo(() => {
        const totalCount = chartData.reduce((sum, d) => sum + d.count, 0);
        const totalPremium = chartData.reduce((sum, d) => sum + d.premium, 0);
        return { count: totalCount, premium: totalPremium };
    }, [chartData]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Renewals Due</h3>
                    <p className="text-sm text-gray-500">
                        {yearTotal.count} renewals • {formatCurrency(yearTotal.premium)} premium in {selectedYear}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {/* Year Selector */}
                    <div className="relative">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="pl-8 pr-8 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none cursor-pointer"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

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

            {/* Click hint */}
            <p className="text-xs text-gray-400 mb-2">
                💡 Click on any month to view policy details
            </p>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        onClick={(e) => {
                            if (e && e.activePayload && e.activePayload[0]) {
                                handleBarClick(e.activePayload[0].payload);
                            }
                        }}
                    >
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
                            tickFormatter={(value) => {
                                if (metric === 'premium') {
                                    if (value >= 100000) {
                                        return `₹${(value / 100000).toFixed(1)}L`;
                                    } else if (value >= 1000) {
                                        return `₹${(value / 1000).toFixed(0)}K`;
                                    }
                                    return `₹${value}`;
                                }
                                // For count, show integers only
                                return Math.floor(value).toString();
                            }}
                            allowDecimals={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#f0f9ff', style: { cursor: 'pointer' } }}
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                fontSize: '12px'
                            }}
                            formatter={(value: number, name: string, props: any) => {
                                const count = props.payload.count;
                                const premium = props.payload.premium;
                                return [
                                    <div key="tooltip" className="space-y-1">
                                        <div className="font-semibold">{count} {count === 1 ? 'Policy' : 'Policies'}</div>
                                        <div className="text-gray-600">{formatCurrency(premium)} Premium</div>
                                        <div className="text-xs text-blue-600 mt-1">Click to view details</div>
                                    </div>,
                                    ''
                                ];
                            }}
                            labelFormatter={(label) => `${label} ${selectedYear}`}
                        />
                        <Bar
                            dataKey="value"
                            radius={[4, 4, 0, 0]}
                            barSize={24}
                            style={{ cursor: 'pointer' }}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getBarColor(entry.value, maxValue)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Renewal Month Modal */}
            <RenewalMonthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                month={selectedMonth}
                year={selectedYear}
                policies={selectedMonthPolicies}
            />
        </div>
    );
}
