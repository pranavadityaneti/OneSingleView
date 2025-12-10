'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PortfolioStats } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import PremiumBreakdownModal from './PremiumBreakdownModal';

interface AnalyticsDonutChartProps {
    data: PortfolioStats;
    allPolicies?: any[];
    userRole?: string;
}

const COLORS = {
    motor: '#3B82F6',      // Blue
    health: '#8b5cf6',     // Purple
    travel: '#06B6D4',     // Cyan
    commercial: '#F59E0B', // Orange
    life: '#EC4899',       // Pink
    cyber: '#10B981',      // Green
};

const LABELS = {
    motor: 'Motor',
    health: 'Health',
    travel: 'Travel',
    commercial: 'Commercial',
    life: 'Life',
    cyber: 'Cyber',
};

export default function AnalyticsDonutChart({ data, allPolicies = [], userRole }: AnalyticsDonutChartProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPolicyType, setSelectedPolicyType] = useState<'Motor' | 'Health' | 'Commercial' | 'Travel' | 'Life' | 'Cyber' | null>(null);
    const chartData = [
        { name: LABELS.motor, value: data.motor, color: COLORS.motor },
        { name: LABELS.health, value: data.health, color: COLORS.health },
        { name: LABELS.travel, value: data.travel, color: COLORS.travel },
        { name: LABELS.commercial, value: data.commercial, color: COLORS.commercial },
        { name: LABELS.life, value: data.life, color: COLORS.life },
        { name: LABELS.cyber, value: data.cyber, color: COLORS.cyber },
    ].filter((item) => item.value > 0);

    const totalValue = chartData.reduce((acc, item) => acc + item.value, 0);

    if (chartData.length === 0) {
        return (
            <div className="w-full h-full bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <span className="text-xl">📊</span>
                </div>
                <p className="text-sm text-gray-500">No data available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex flex-col">
            <h3 className="text-gray-900 font-bold text-base mb-6">Source of Premium</h3>

            <div className="flex-1 relative min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            cornerRadius={6}
                            stroke="none"
                            onClick={(data) => {
                                const policyTypeMap: Record<string, 'Motor' | 'Health' | 'Commercial' | 'Travel' | 'Life' | 'Cyber'> = {
                                    'Motor': 'Motor',
                                    'Health': 'Health',
                                    'Commercial': 'Commercial',
                                    'Travel': 'Travel',
                                    'Life': 'Life',
                                    'Cyber': 'Cyber'
                                };
                                setSelectedPolicyType(policyTypeMap[data.name]);
                                setModalOpen(true);
                            }}
                            cursor="pointer"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            itemStyle={{ color: '#1F293B', fontSize: '12px', fontWeight: 600 }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-gray-900">100%</span>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Distribution</span>
                </div>
            </div>

            {/* Custom Legend - Compact 2-column grid */}
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2">
                {chartData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-600 font-medium truncate">{item.name}:</span>
                        <span className="font-bold text-gray-900 ml-auto">
                            {((item.value / totalValue) * 100).toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>

            {/* Premium Breakdown Modal */}
            {modalOpen && selectedPolicyType && (
                <PremiumBreakdownModal
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedPolicyType(null);
                    }}
                    policyType={selectedPolicyType}
                    policies={allPolicies.filter(p => {
                        const typeMap: Record<string, string> = {
                            'Motor': 'motor',
                            'Health': 'health',
                            'Commercial': 'commercial',
                            'Travel': 'travel',
                            'Life': 'life',
                            'Cyber': 'cyber'
                        };
                        return p.policy_type?.toLowerCase() === typeMap[selectedPolicyType];
                    })}
                    userRole={userRole}
                />
            )}
        </div>
    );
}
