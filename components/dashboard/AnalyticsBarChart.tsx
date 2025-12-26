'use client';

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalyticsBarChartProps {
    data?: { name: string; value: number }[];
}

export default function AnalyticsBarChart({ data = [] }: AnalyticsBarChartProps) {
    const maxVal = Math.max(...data.map(d => d.value), 0);
    const peakMonth = data.find(d => d.value === maxVal);

    return (
        <div className="w-full h-full bg-white rounded-2xl p-4 shadow-soft border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-900 font-bold text-sm">Monthly Activity</h3>
                <div className="flex gap-1">
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                </div>
            </div>

            <div className="flex-1 min-h-[140px] relative">
                {/* Floating Label for Peak */}
                {peakMonth && maxVal > 0 && (
                    <div className="absolute left-[50%] top-0 transform -translate-x-1/2 -translate-y-2 z-10">
                        <div className="bg-[#1E293B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-lg">
                            {peakMonth.value > 1000 ? `${(peakMonth.value / 1000).toFixed(1)}K` : peakMonth.value}
                        </div>
                        <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[3px] border-t-[#1E293B] mx-auto"></div>
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={6}>
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ display: 'none' }}
                        />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 9 }}
                            dy={5}
                        />
                        <Bar dataKey="value" radius={[3, 3, 3, 3]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.value === maxVal ? '#1057a9' : '#E2E8F0'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-2 flex items-start gap-2 p-2.5 bg-green-50 rounded-xl border border-green-100">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 text-xs">
                    🏆
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-900">Congratulations!</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">You've hit a new record this month.</p>
                </div>
            </div>
        </div>
    );
}
