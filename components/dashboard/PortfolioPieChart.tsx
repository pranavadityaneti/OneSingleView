'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PortfolioStats } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface PortfolioPieChartProps {
    data: PortfolioStats;
}

const COLORS = {
    motor: '#6366f1',
    health: '#8b5cf6',
    commercial: '#06b6d4',
    travel: '#f59e0b',
    life: '#ec4899',
    cyber: '#10b981',
};

const LABELS = {
    motor: 'Motor',
    health: 'Health',
    commercial: 'Commercial',
    travel: 'Travel',
    life: 'Life',
    cyber: 'Cyber',
};

import { useRouter } from 'next/navigation';

export default function PortfolioPieChart({ data }: PortfolioPieChartProps) {
    const router = useRouter();

    // Convert data to chart format
    const chartData = [
        { name: LABELS.motor, value: data.motor, color: COLORS.motor, path: '/motor' },
        { name: LABELS.health, value: data.health, color: COLORS.health, path: '/health' },
        { name: LABELS.commercial, value: data.commercial, color: COLORS.commercial, path: '/commercial' },
        { name: LABELS.travel, value: data.travel, color: COLORS.travel, path: '/travel' },
        { name: LABELS.life, value: data.life, color: COLORS.life, path: '/life' },
        { name: LABELS.cyber, value: data.cyber, color: COLORS.cyber, path: '/cyber' },
    ].filter((item) => item.value > 0); // Only show non-zero values

    const onPieClick = (data: any) => {
        if (data && data.path) {
            router.push(data.path);
        }
    };

    if (chartData.length === 0) {
        // ... empty state code
        return (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <span className="text-2xl">📊</span>
                </div>
                <p className="text-gray-900 font-medium mb-1">No Data Available</p>
                <p className="text-sm text-gray-500 mb-4">Add your first policy to see the distribution.</p>
                <a
                    href="/motor"
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 border border-primary-200 bg-white px-4 py-2 rounded-md shadow-sm hover:shadow transition-all"
                >
                    Add Policy
                </a>
            </div>
        );
    }

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={onPieClick}
                        className="cursor-pointer focus:outline-none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '1rem',
                            padding: '1rem',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)', // shadow-card
                        }}
                        itemStyle={{ color: '#1f2937', fontWeight: 600 }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
