'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FlipCardProps {
    title: string;
    icon: LucideIcon;
    activeCount: number;
    colorClass: string; // e.g., 'blue', 'green'
    onClick: () => void;
}

export default function FlipCard({ title, icon: Icon, activeCount, colorClass, onClick }: FlipCardProps) {
    // Map color names to Tailwind classes
    const colorMap: Record<string, { bg: string; text: string; hover: string; border: string }> = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'group-hover:bg-blue-100', border: 'border-blue-100' },
        green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'group-hover:bg-green-100', border: 'border-green-100' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'group-hover:bg-purple-100', border: 'border-purple-100' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', hover: 'group-hover:bg-orange-100', border: 'border-orange-100' },
        pink: { bg: 'bg-pink-50', text: 'text-pink-600', hover: 'group-hover:bg-pink-100', border: 'border-pink-100' },
        cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', hover: 'group-hover:bg-cyan-100', border: 'border-cyan-100' },
    };

    const colors = colorMap[colorClass] || colorMap['blue'];

    return (
        <div
            onClick={onClick}
            className="group h-32 w-full perspective-1000 cursor-pointer"
        >
            <div className="relative h-full w-full transition-all duration-500 transform-style-3d group-hover:rotate-y-180">
                {/* Front Side */}
                <div className={`absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-lg bg-white border ${colors.border} flex flex-col items-center justify-center p-4 transition-all duration-300 group-hover:shadow-xl`}>
                    <div className={`p-3 rounded-full ${colors.bg} bg-opacity-10 mb-3`}>
                        <Icon className={`w-8 h-8 ${colors.text}`} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-700 text-center">{title}</h3>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-4">
                    <div className="text-4xl font-bold mb-1">{activeCount}</div>
                    <div className="text-xs font-medium text-gray-300 uppercase tracking-wider">Active Policies</div>
                </div>
            </div>
        </div>
    );
}
