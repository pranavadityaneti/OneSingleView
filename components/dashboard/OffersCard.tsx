'use client';

import React from 'react';
import { Tag, ArrowRight } from 'lucide-react';

export default function OffersCard() {
    return (
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-8 text-white shadow-lg shadow-pink-500/25 relative overflow-hidden transition-transform hover:-translate-y-1">
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Tag className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-pink-100 bg-white/10 px-2 py-1 rounded-full">Limited Offer</span>
                </div>

                <h3 className="font-bold text-xl mb-2">Family Floater Plan</h3>
                <p className="text-sm text-pink-100 mb-6 leading-relaxed flex-grow">Get flat 20% off on premium for 3+ family members. Protect your loved ones today.</p>

                <div className="mt-auto">
                    <button className="bg-white text-pink-600 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center hover:bg-pink-50 transition-colors shadow-sm">
                        Claim Offer <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>

            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        </div>
    );
}
