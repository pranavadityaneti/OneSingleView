'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';

interface UpsellCardProps {
    type: 'Health' | 'Life' | 'Travel' | 'Cyber';
    title: string;
    description: string;
    priceStart?: string;
}

export default function UpsellCard({ type, title, description, priceStart }: UpsellCardProps) {
    const colors = {
        Health: 'bg-red-50 text-red-900',
        Life: 'bg-blue-50 text-blue-900',
        Travel: 'bg-yellow-50 text-yellow-900',
        Cyber: 'bg-indigo-50 text-indigo-900',
    };

    const colorClass = colors[type] || colors.Health;

    return (
        <div className={`p-8 rounded-3xl shadow-card border-none bg-white relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}>
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Shield className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Recommended</span>
                </div>

                <h3 className="font-bold text-xl mb-2 text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed flex-grow">{description}</p>

                <div className="mt-auto">
                    {priceStart && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl inline-block">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Starting from</p>
                            <p className="text-lg font-bold text-gray-900">{priceStart}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                        </div>
                    )}

                    <Link
                        href={`/quotes?type=${type}`}
                        className="inline-flex items-center text-sm font-bold text-primary-600 hover:text-primary-700 group-hover:translate-x-1 transition-transform"
                    >
                        Get a Quote <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>
            </div>

            {/* Decorative Icon */}
            <Shield className="absolute -bottom-6 -right-6 w-32 h-32 text-gray-50 opacity-50 rotate-12 group-hover:rotate-6 transition-transform duration-500" />
        </div>
    );
}
