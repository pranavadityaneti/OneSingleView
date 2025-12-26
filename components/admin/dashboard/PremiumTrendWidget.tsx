'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { PremiumTrend, getPremiumTrend } from '@/lib/admin-db';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TimeRange = '1day' | '1week' | '15days' | '1month' | '3months' | '6months' | '1year' | 'custom';

export default function PremiumTrendWidget() {
    const [data, setData] = useState<PremiumTrend[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<TimeRange>('1month');
    const [customDates, setCustomDates] = useState({
        start: '',
        end: ''
    });

    useEffect(() => {
        loadData();
    }, [timeRange, customDates]);

    const getDateRange = (): { start: Date; end: Date; groupBy: 'day' | 'week' | 'month' } => {
        const end = new Date();
        const start = new Date();
        let groupBy: 'day' | 'week' | 'month' = 'day';

        if (timeRange === 'custom') {
            if (customDates.start && customDates.end) {
                return {
                    start: new Date(customDates.start),
                    end: new Date(customDates.end),
                    groupBy: 'day'
                };
            }
            // Default to 1 month if custom dates not set
            start.setMonth(end.getMonth() - 1);
            return { start, end, groupBy: 'day' };
        }

        switch (timeRange) {
            case '1day':
                start.setDate(end.getDate() - 1);
                groupBy = 'day';
                break;
            case '1week':
                start.setDate(end.getDate() - 7);
                groupBy = 'day';
                break;
            case '15days':
                start.setDate(end.getDate() - 15);
                groupBy = 'day';
                break;
            case '1month':
                start.setMonth(end.getMonth() - 1);
                groupBy = 'day';
                break;
            case '3months':
                start.setMonth(end.getMonth() - 3);
                groupBy = 'week';
                break;
            case '6months':
                start.setMonth(end.getMonth() - 6);
                groupBy = 'week';
                break;
            case '1year':
                start.setFullYear(end.getFullYear() - 1);
                groupBy = 'month';
                break;
        }

        return { start, end, groupBy };
    };

    const loadData = async () => {
        setLoading(true);
        const { start, end, groupBy } = getDateRange();
        const trendData = await getPremiumTrend(start, end, groupBy);
        setData(trendData);
        setLoading(false);
    };

    const formatCurrency = (value: number) => {
        if (value >= 10000000) {
            return `₹${(value / 10000000).toFixed(1)}Cr`;
        } else if (value >= 100000) {
            return `₹${(value / 100000).toFixed(1)}L`;
        } else if (value >= 1000) {
            return `₹${(value / 1000).toFixed(0)}K`;
        } else {
            return `₹${value}`;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        if (timeRange === '1year' || timeRange === '6months') {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const totalPremium = data.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Total Premium Trend</h3>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 mb-4">
                <div className="flex-1">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                        <option value="1day">1 Day</option>
                        <option value="1week">1 Week</option>
                        <option value="15days">15 Days</option>
                        <option value="1month">1 Month</option>
                        <option value="3months">3 Months</option>
                        <option value="6months">6 Months</option>
                        <option value="1year">1 Year</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
            </div>

            {/* Custom Date Range */}
            {timeRange === 'custom' && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label className="text-xs text-gray-600 mb-1 block">Start Date</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={customDates.start}
                                onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-600 mb-1 block">End Date</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={customDates.end}
                                onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Summary */}
            <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPremium)}</p>
                <p className="text-sm text-gray-500">Total premium in selected period</p>
            </div>

            {/* Chart */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <TrendingUp className="w-12 h-12 mb-2 opacity-50" />
                    <p className="text-sm">No premium data for this period</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1057a9" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#1057a9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            style={{ fontSize: '11px' }}
                            tick={{ fill: '#6B7280' }}
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            style={{ fontSize: '11px' }}
                            tick={{ fill: '#6B7280' }}
                        />
                        <Tooltip
                            formatter={(value: any) => [formatCurrency(value), 'Premium']}
                            labelFormatter={(label) => formatDate(label)}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                fontSize: '12px'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#1057a9"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorTotal)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
