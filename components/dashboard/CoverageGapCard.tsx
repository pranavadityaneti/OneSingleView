'use client';

import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface CoverageGapCardProps {
    missingPolicyType: string;
    onExplore?: () => void;
}

export default function CoverageGapCard({ missingPolicyType, onExplore }: CoverageGapCardProps) {
    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl shadow-card border border-blue-100 h-full flex flex-col justify-between relative overflow-hidden group">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm">
                        <Lightbulb className="w-4 h-4" />
                    </div>
                    <span className="bg-white/80 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase shadow-sm">
                        Insight
                    </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-1.5">Recommended for You</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                    You currently don't have a <span className="font-semibold text-blue-700">{missingPolicyType}</span> insurance policy added.
                </p>
            </div>

            <button
                onClick={onExplore}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
                Explore Plans
                <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* subtle decoration */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-indigo-200 rounded-full opacity-30 blur-2xl"></div>
        </div>
    );
}
