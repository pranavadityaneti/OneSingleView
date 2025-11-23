'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface PolicyCategoryCardProps {
    title: string;
    count: number;
    icon: LucideIcon;
    href: string;
    color: string; // e.g., 'blue', 'green', 'purple'
}

export default function PolicyCategoryCard({ title, count, icon: Icon, href, color }: PolicyCategoryCardProps) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
        green: 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white',
        purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
        orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
        pink: 'bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white',
        indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
    };

    const iconClass = colorClasses[color] || colorClasses.blue;

    return (
        <Link href={href} className="block p-4 rounded-xl bg-white shadow-soft hover:shadow-hover transition-all duration-300 group hover:-translate-y-1 border border-gray-100">
            <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg transition-colors duration-300 ${iconClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center text-gray-300 group-hover:text-primary-600 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>

            <h3 className="font-bold text-sm text-gray-900 mb-0.5 group-hover:text-primary-600 transition-colors">{title}</h3>
            <p className="text-[10px] font-medium text-gray-500">
                {count > 0 ? `${count} Active Policies` : 'No Active Policies'}
            </p>
        </Link>
    );
}
